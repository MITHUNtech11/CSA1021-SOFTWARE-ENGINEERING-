import asyncio
import logging
import re
import subprocess
import json
import os
import secrets
from contextlib import asynccontextmanager
from pathlib import Path
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Query, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from shared.models.telemetry import TelemetryTick
from services.ingestion.app.simulator import MatchSimulator
from services.ingestion.app.stream_reader import LiveStreamWorker, StreamSourceType, VideoSourceError
from services.analytics.app.engine import AnalyticsEngine
from services.analytics.app.vision.hud_analyzer import ValorantHUDAnalyzer, ValorantHUDState
from services.prediction.app.service import PredictionEngine
from services.prediction.app.model.valorant_model import (
    ValorantTacticalWinProbability,
    ValorantInflectionTagger
)
from services.gateway.app.ws_manager import WebSocketManager
from services.gateway.app.valorant_generator import generate_valorant_telemetry

class YouTubeAnalysisRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2048)

class SeekRequest(BaseModel):
    sequence_id: int

class LiveAnalysisRequest(BaseModel):
    source: str = Field("SYNTHETIC", max_length=2048)
    source_type: StreamSourceType = StreamSourceType.SYNTHETIC
    fps: float = Field(1.0, ge=0.2, le=10.0)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gateway")

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await _cancel_playback_task()
    await _cancel_live_task()


app = FastAPI(
    title="EsportEcho Predict API Gateway",
    description="Unified API Gateway, Telemetry Orchestrator & Live Broadcast HUD Analyzer",
    version="2.0.0",
    lifespan=lifespan
)

DASHBOARD_ORIGIN = os.getenv("ESPORTECHO_DASHBOARD_ORIGIN", "")
ACCESS_KEY = os.getenv("ESPORTECHO_ACCESS_KEY", "")
if DASHBOARD_ORIGIN or ACCESS_KEY or os.getenv("RENDER"):
    if not re.fullmatch(r"https://[A-Za-z0-9.-]+(?::[0-9]+)?", DASHBOARD_ORIGIN):
        raise RuntimeError("Set ESPORTECHO_DASHBOARD_ORIGIN to the exact HTTPS dashboard origin.")
    if not re.fullmatch(r"[!-~]{32,256}", ACCESS_KEY):
        raise RuntimeError("Set ESPORTECHO_ACCESS_KEY to a random 32-256 character ASCII key.")


def valid_key(value: str) -> bool:
    return value.isascii() and secrets.compare_digest(value, ACCESS_KEY)


def allowed_origin(headers) -> bool:
    origin = headers.get("origin")
    if not origin:
        return True
    if DASHBOARD_ORIGIN:
        return origin == DASHBOARD_ORIGIN
    try:
        parsed = urllib.parse.urlsplit(origin)
        return parsed.scheme in {"http", "https"} and parsed.netloc == headers.get("host")
    except ValueError:
        return False


@app.middleware("http")
async def reject_cross_origin_writes(request: Request, call_next):
    if request.method not in {"GET", "HEAD", "OPTIONS"} and not allowed_origin(request.headers):
        return JSONResponse({"detail": "Cross-origin request rejected."}, status_code=403)
    if ACCESS_KEY and request.url.path != "/health":
        scheme, _, key = request.headers.get("authorization", "").partition(" ")
        if scheme.lower() != "bearer" or not valid_key(key):
            return JSONResponse({"detail": "A valid team access key is required."}, status_code=401)
    return await call_next(request)


if DASHBOARD_ORIGIN:
    app.add_middleware(
        CORSMiddleware, allow_origins=[DASHBOARD_ORIGIN], allow_methods=["GET", "POST"],
        allow_headers=["Authorization", "Content-Type"],
    )


ws_manager = WebSocketManager()

# Default match: 24-round VALORANT VCT Champions match on Ascent
val_ticks = generate_valorant_telemetry()
simulator = MatchSimulator(ticks=val_ticks)
analytics_engine = AnalyticsEngine(match_id=val_ticks[0].match_id if val_ticks else "MATCH-DEFAULT")
prediction_engine = PredictionEngine()

# State memory for simulation
processed_ticks: List[Dict[str, Any]] = []
change_points: List[Dict[str, Any]] = []
predictions: List[Dict[str, Any]] = []
playback_task: Optional[asyncio.Task] = None
replay_control_lock = asyncio.Lock()

# State memory for Live Broadcast Analysis
live_worker: Optional[LiveStreamWorker] = None
live_hud_analyzer = ValorantHUDAnalyzer()
live_valorant_model = ValorantTacticalWinProbability()
live_inflection_tagger = ValorantInflectionTagger()
live_task: Optional[asyncio.Task] = None
live_control_lock = asyncio.Lock()
live_error: Optional[str] = None
current_live_state: Optional[Dict[str, Any]] = None
live_history: List[Dict[str, Any]] = []
prev_live_hud_state: Optional[ValorantHUDState] = None
prev_prob_blue: float = 0.50
current_broadcast_meta: Optional[Dict[str, Any]] = None

async def _cancel_playback_task():
    global playback_task
    simulator.is_playing = False
    if playback_task and not playback_task.done():
        playback_task.cancel()
        try:
            await playback_task
        except asyncio.CancelledError:
            pass
    playback_task = None

async def _cancel_live_task():
    global live_task, live_worker
    if live_worker:
        live_worker.stop()
    if live_task and not live_task.done():
        live_task.cancel()
        try:
            await live_task
        except asyncio.CancelledError:
            pass
    live_task = None

def _process_single_tick(tick: TelemetryTick, *, include_segments: bool = True) -> Dict[str, Any]:
    # 1. Pass through analytics engine
    cp, momentum, behavior = analytics_engine.process_tick(tick)

    # 2. Pass through prediction engine
    pred = prediction_engine.predict(tick=tick, momentum=momentum, change_point=cp)

    tick_dict = tick.model_dump(mode="json")
    pred_dict = pred.model_dump(mode="json")
    cp_dict = cp.model_dump(mode="json") if cp else None

    processed_ticks.append(tick_dict)
    predictions.append(pred_dict)
    if cp_dict:
        change_points.append(cp_dict)

    packet = {
        "type": "TICK_UPDATE",
        "tick": tick_dict,
        "prediction": pred_dict,
        "change_point": cp_dict,
        "behavior": behavior,
        "simulator_status": simulator.get_status()
    }
    if include_segments:
        packet["pelt_segments"] = analytics_engine.run_pelt_segmentation()
    return packet

async def _playback_loop():
    logger.info("Playback loop started.")
    try:
        while simulator.is_playing:
            tick = simulator.step()
            if tick is None:
                await ws_manager.broadcast_json({
                    "type": "SIMULATION_STATUS", "simulator_status": simulator.get_status(),
                })
                break

            packet = _process_single_tick(tick)
            await ws_manager.broadcast_json(packet)

            delay = max(0.15, 1.5 / max(0.1, simulator.playback_speed))
            await asyncio.sleep(delay)
    except asyncio.CancelledError:
        logger.info("Playback loop task cancelled.")

def live_status():
    is_running = bool(live_worker and live_worker.is_running)
    return {
        "is_running": is_running,
        "video_id": (
            parse_video_id(live_worker.source)
            if is_running and live_worker.source_type == StreamSourceType.YOUTUBE_LIVE else None
        ),
        "source_type": live_worker.source_type.value if live_worker else "NONE",
        "fps": live_worker.fps if live_worker else 1.0,
        "processed_frames": len(live_history),
        "error": live_error,
    }


async def _live_analysis_loop(worker: LiveStreamWorker, frame):
    global current_live_state, prev_live_hud_state, prev_prob_blue, live_error
    try:
        while worker.is_running:
            hud_state = await asyncio.to_thread(live_hud_analyzer.analyze_frame, frame)
            p_blue_rnd, p_red_rnd, p_blue_match, p_red_match = live_valorant_model.predict(hud_state)

            # Evaluate tactical transition events
            events = live_inflection_tagger.evaluate_transition(
                prev_state=prev_live_hud_state,
                curr_state=hud_state,
                p_blue_prev=prev_prob_blue,
                p_blue_curr=p_blue_rnd
            )
            prev_live_hud_state = hud_state
            prev_prob_blue = p_blue_rnd

            analysis_seconds = worker.analysis_seconds
            packet = {
                "type": "LIVE_HUD_UPDATE",
                "analysis_seconds": analysis_seconds,
                "hud_state": hud_state.model_dump(mode="json"),
                "win_probability": {
                    "round_blue": p_blue_rnd,
                    "round_red": p_red_rnd,
                    "match_blue": p_blue_match,
                    "match_red": p_red_match
                },
                "inflection_events": [
                    {**event.model_dump(mode="json"), "analysis_seconds": analysis_seconds}
                    for event in events
                ],
                "source_type": worker.source_type.value
            }
            current_live_state = packet
            live_history.append(packet)
            # Bound live history memory
            if len(live_history) > 300:
                live_history.pop(0)

            await ws_manager.broadcast_json(packet)

            if worker.source_type == StreamSourceType.SYNTHETIC:
                await asyncio.sleep(1.0 / worker.fps)
            frame = await asyncio.wait_for(asyncio.to_thread(worker.read_frame), timeout=15)
            if frame is None:
                break
    except asyncio.CancelledError:
        raise
    except VideoSourceError as error:
        live_error = str(error)
        logger.warning("%s video analysis ended: %s", worker.source_type.value, live_error)
    except (TimeoutError, subprocess.TimeoutExpired):
        live_error = "The video source stopped sending frames."
        logger.warning("%s video source timed out", worker.source_type.value)
    except Exception:
        logger.exception("Live frame processing failed")
        live_error = "The video stream stopped responding."
    finally:
        worker.stop()
    current_live_state = None
    live_history.clear()
    await ws_manager.broadcast_json({"type": "LIVE_STOPPED", "error": live_error})


@app.get("/health")
def health():
    if ACCESS_KEY:
        return {"status": "healthy", "service": "api-gateway"}
    return {
        "status": "healthy",
        "service": "api-gateway",
        "active_ws_clients": len(ws_manager.active_connections),
        "total_processed_ticks": len(processed_ticks),
        "is_live_broadcasting": live_worker.is_running if live_worker else False
    }

# ----------------- LIVE BROADCAST ANALYSIS ENDPOINTS -----------------

def resolve_live_source(req: LiveAnalysisRequest) -> str:
    if req.source_type == StreamSourceType.SYNTHETIC:
        return "SYNTHETIC"
    if req.source_type == StreamSourceType.YOUTUBE_LIVE:
        return youtube_watch_url(req.source)
    directory = os.getenv("ESPORTECHO_VIDEO_DIR")
    if not directory:
        raise HTTPException(403, "Server-side recordings are disabled.")
    root = Path(directory).resolve()
    candidate = (root / req.source).resolve()
    if not candidate.is_relative_to(root) or candidate.suffix.lower() not in {".mp4", ".mkv", ".webm", ".mov"}:
        raise HTTPException(422, "Choose a supported recording from the server video directory.")
    if not candidate.is_file():
        raise HTTPException(404, "Recording not found.")
    return str(candidate)


@app.post("/api/v1/live/start")
async def start_live_analysis(req: LiveAnalysisRequest):
    global live_worker, live_task, current_live_state, prev_live_hud_state, prev_prob_blue, live_error
    source = resolve_live_source(req)
    async with live_control_lock:
        await _cancel_live_task()
        current_live_state = prev_live_hud_state = live_error = None
        prev_prob_blue = 0.50
        live_history.clear()
        worker = LiveStreamWorker(source=source, source_type=req.source_type, fps=req.fps)
        try:
            await asyncio.to_thread(worker.prepare)
            worker.start()
            frame = await asyncio.wait_for(asyncio.to_thread(worker.read_frame), timeout=15)
            if frame is None:
                status = 422 if req.source_type == StreamSourceType.LOCAL_VIDEO else 502
                raise VideoSourceError("The selected source ended before producing a video frame.", status)
        except (VideoSourceError, TimeoutError, OSError, subprocess.SubprocessError) as error:
            worker.stop()
            if isinstance(error, VideoSourceError):
                live_error, status = str(error), error.status_code
            elif isinstance(error, (TimeoutError, subprocess.TimeoutExpired)):
                live_error, status = "The video source took too long to respond. Try again or choose another source.", 504
            else:
                live_error, status = "The gateway could not launch the video decoder. Check the FFmpeg installation.", 503
            logger.warning("Could not start %s video analysis: %s", req.source_type.value, live_error)
            await ws_manager.broadcast_json({"type": "LIVE_STOPPED", "error": live_error})
            raise HTTPException(status, live_error) from None
        except asyncio.CancelledError:
            worker.stop()
            raise
        live_worker = worker
        status = live_status()
        try:
            await ws_manager.broadcast_json({"type": "LIVE_STARTED", **status})
        except asyncio.CancelledError:
            worker.stop()
            raise
        live_task = asyncio.create_task(_live_analysis_loop(worker, frame))
        return {"status": "live_started", "source": req.source, **status}


@app.post("/api/v1/live/stop")
async def stop_live_analysis():
    global live_error, current_live_state
    async with live_control_lock:
        await _cancel_live_task()
        live_error = None
        current_live_state = None
        live_history.clear()
        await ws_manager.broadcast_json({"type": "LIVE_STOPPED"})
    return {"status": "live_stopped"}


@app.get("/api/v1/live/status")
async def get_live_status():
    return live_status()


@app.get("/api/v1/live/state")
def get_live_state():
    return {
        "status": "success",
        "current": current_live_state,
        "history_count": len(live_history)
    }

# ----------------- SIMULATION REPLAY ENDPOINTS -----------------

@app.get("/api/v1/matches/current")
async def get_current_match():
    return {
        "match_id": simulator.ticks[0].match_id if simulator.ticks else "MATCH-DEFAULT",
        "blue_team": simulator.ticks[0].blue_team.team_name if simulator.ticks else "Blue",
        "red_team": simulator.ticks[0].red_team.team_name if simulator.ticks else "Red",
        "total_ticks": simulator.total_ticks,
        "ticks": processed_ticks,
        "predictions": predictions,
        "change_points": change_points,
        "status": simulator.get_status()
    }

@app.post("/api/v1/simulation/step")
async def step_simulation():
    async with replay_control_lock:
        tick = simulator.step()
        if tick:
            packet = _process_single_tick(tick)
            await ws_manager.broadcast_json(packet)
            return {"status": "stepped", "packet": packet}
        return {"status": "finished", "simulator_status": simulator.get_status()}

@app.post("/api/v1/simulation/play")
async def play_simulation(speed: float = Query(1.0, ge=0.25, le=10.0)):
    global playback_task
    async with replay_control_lock:
        simulator.playback_speed = speed
        simulator.is_playing = True
        status = simulator.get_status()
        await ws_manager.broadcast_json({"type": "SIMULATION_STATUS", "simulator_status": status})
        if simulator.is_playing and (playback_task is None or playback_task.done()):
            playback_task = asyncio.create_task(_playback_loop())
        return {"status": "playing", "speed": speed, "simulator_status": status}

@app.post("/api/v1/simulation/pause")
async def pause_simulation():
    async with replay_control_lock:
        simulator.is_playing = False
        await _cancel_playback_task()
        snapshot = replay_snapshot()
        await ws_manager.broadcast_json(snapshot)
        return {"status": "paused", "simulator_status": snapshot["simulator_status"], "snapshot": snapshot}

@app.post("/api/v1/simulation/reset")
async def reset_simulation():
    global analytics_engine, prediction_engine
    async with replay_control_lock:
        await _cancel_playback_task()
        simulator.reset()
        analytics_engine = AnalyticsEngine(match_id=simulator.ticks[0].match_id if simulator.ticks else "MATCH-DEFAULT")
        prediction_engine = PredictionEngine()
        processed_ticks.clear()
        change_points.clear()
        predictions.clear()
        snapshot = replay_snapshot()
        await ws_manager.broadcast_json(snapshot)
        return {"status": "reset", "snapshot": snapshot}

def parse_video_id(value: str) -> str:
    value = value.strip()
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", value):
        return value
    try:
        url = urllib.parse.urlsplit(value)
        if url.scheme not in {"http", "https"} or url.username or url.password or url.port is not None:
            raise ValueError
        if url.hostname == "youtu.be":
            candidate = url.path.strip("/")
        elif url.hostname in {"youtube.com", "www.youtube.com", "m.youtube.com"}:
            if url.path == "/watch":
                candidate = urllib.parse.parse_qs(url.query).get("v", [""])[0]
            else:
                match = re.fullmatch(r"/(?:embed|live|shorts)/([^/]+)", url.path)
                candidate = match.group(1) if match else ""
        else:
            raise ValueError
        if re.fullmatch(r"[A-Za-z0-9_-]{11}", candidate):
            return candidate
    except ValueError:
        pass
    raise HTTPException(422, "Enter a valid YouTube video URL or ID.")


def youtube_watch_url(value: str) -> str:
    return f"https://www.youtube.com/watch?v={parse_video_id(value)}"


def fetch_youtube_metadata(url: str) -> Dict[str, Any]:
    vid = parse_video_id(url)
    clean_url = f"https://www.youtube.com/watch?v={vid}"

    # 1. Attempt extraction via yt-dlp for rich stream & metadata details
    try:
        import yt_dlp

        class _QuietLogger:
            def debug(self, msg): pass
            def warning(self, msg): pass
            def error(self, msg): pass

        ydl_opts = {
            'skip_download': True,
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
            'socket_timeout': 3,
            'retries': 0,
            'noplaylist': True,
            'js_runtimes': {'deno': {}, 'node': {}},
            'extractor_retries': 0,
            'logger': _QuietLogger()
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=False)
            if info:
                title = info.get("title") or "YouTube reference video"
                return {
                    "video_id": vid,
                    "title": title,
                    "author": info.get("uploader") or info.get("channel") or "",
                    "thumbnail_url": info.get("thumbnail") or f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
                    "duration": info.get("duration", 1440),
                    "is_live": info.get("is_live", False)
                }
    except Exception as e:
        logger.debug(f"yt-dlp extract failed ({e}), falling back to oEmbed")

    # 2. Fallback to YouTube oEmbed API
    oembed_url = f"https://www.youtube.com/oembed?url={urllib.parse.quote(clean_url)}&format=json"
    req = urllib.request.Request(oembed_url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            return {
                "video_id": vid,
                "title": data.get("title", "YouTube reference video"),
                "author": data.get("author_name", ""),
                "thumbnail_url": data.get("thumbnail_url", f"https://img.youtube.com/vi/{vid}/hqdefault.jpg"),
                "duration": 1440,
                "is_live": False
            }
    except Exception:
        return {
            "video_id": vid,
            "title": "YouTube reference video",
            "author": "",
            "thumbnail_url": f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
            "duration": 1440,
            "is_live": False
        }

@app.get("/api/v1/broadcast/current")
def get_current_broadcast():
    if current_broadcast_meta:
        return {
            "is_initialized": True,
            **current_broadcast_meta
        }
    return {
        "is_initialized": False,
        "video_id": None,
        "title": None,
        "author": None,
        "thumbnail_url": None,
        "match_id": None
    }

@app.post("/api/v1/broadcast/init-youtube")
@app.post("/api/v1/simulation/analyze-youtube")
async def analyze_youtube(req: YouTubeAnalysisRequest):
    global simulator, analytics_engine, prediction_engine, current_broadcast_meta
    url = youtube_watch_url(req.url)
    meta = await asyncio.to_thread(fetch_youtube_metadata, url)
    async with replay_control_lock:
        await _cancel_playback_task()
        match_id = f"VALORANT-{meta['video_id']}"

        ticks = generate_valorant_telemetry(match_id=match_id, title=meta['title'])
        simulator = MatchSimulator(ticks=ticks)
        analytics_engine = AnalyticsEngine(match_id=match_id)
        prediction_engine = PredictionEngine()
        processed_ticks.clear()
        change_points.clear()
        predictions.clear()

        broadcast_data = {
            "video_id": meta["video_id"],
            "title": meta["title"],
            "author": meta["author"],
            "thumbnail_url": meta["thumbnail_url"],
            "match_id": match_id,
            "total_rounds": len(ticks),
            "telemetry_source": "synthetic",
            "duration": meta.get("duration", 1440),
            "is_live": meta.get("is_live", False)
        }
        current_broadcast_meta = broadcast_data

        snapshot = replay_snapshot()
        await ws_manager.broadcast_json(snapshot)
        return {"status": "ready", **broadcast_data, "snapshot": snapshot}


@app.post("/api/v1/simulation/seek")
async def seek_simulation(req: SeekRequest):
    global analytics_engine, prediction_engine
    async with replay_control_lock:
        target_idx = None
        for idx, t in enumerate(simulator.ticks):
            if t.sequence_id == req.sequence_id:
                target_idx = idx
                break

        if target_idx is None:
            return {"status": "not_found"}

        await _cancel_playback_task()

        # Resynchronize sequential analytics state by replaying up to target tick
        match_id = simulator.ticks[0].match_id if simulator.ticks else "MATCH-DEFAULT"
        analytics_engine = AnalyticsEngine(match_id=match_id)
        prediction_engine = PredictionEngine()
        processed_ticks.clear()
        change_points.clear()
        predictions.clear()

        last_packet = None
        for i in range(target_idx + 1):
            simulator.current_index = i + 1
            last_packet = _process_single_tick(simulator.ticks[i], include_segments=False)

        if last_packet:
            snapshot = replay_snapshot()
            await ws_manager.broadcast_json(snapshot)
            return {"status": "seeked", "packet": last_packet, "snapshot": snapshot}
        return {"status": "not_found"}

@app.get("/api/v1/analytics/pelt")
async def get_pelt_segments():
    segments = analytics_engine.run_pelt_segmentation()
    return {"status": "success", "segments": segments}

def replay_snapshot(event_type="REPLAY_SNAPSHOT"):
    return {
        "type": event_type,
        "ticks": list(processed_ticks),
        "predictions": list(predictions),
        "change_points": list(change_points),
        "simulator_status": simulator.get_status(),
        "broadcast_meta": current_broadcast_meta,
        "pelt_segments": analytics_engine.run_pelt_segmentation(),
    }


@app.websocket("/ws/live")
async def websocket_live_stream(websocket: WebSocket):
    if not allowed_origin(websocket.headers):
        await websocket.close(code=1008)
        return
    try:
        await websocket.accept()
        if ACCESS_KEY:
            try:
                key = await asyncio.wait_for(websocket.receive_text(), timeout=5)
            except asyncio.TimeoutError:
                key = ""
            if not valid_key(key):
                await websocket.send_json({"type": "ACCESS_DENIED"})
                await websocket.close(code=4401)
                return
        await ws_manager.connect(websocket, lambda: {
            **replay_snapshot("INITIAL_SNAPSHOT"),
            "live_status": {
                **live_status(),
                "current_live": current_live_state,
                "inflection_events": [
                    event for packet in reversed(live_history)
                    for event in reversed(packet["inflection_events"])
                ][:50],
            },
        })
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("WebSocket error")
    finally:
        ws_manager.disconnect(websocket)
