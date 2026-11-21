import asyncio
import logging
import re
import json
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from shared.models.telemetry import TelemetryTick
from services.ingestion.app.simulator import MatchSimulator
from services.ingestion.app.stream_reader import LiveStreamWorker, StreamSourceType
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
    url: str

class SeekRequest(BaseModel):
    sequence_id: int

class LiveAnalysisRequest(BaseModel):
    source: str = "SYNTHETIC"
    source_type: str = "SYNTHETIC"  # SYNTHETIC | LOCAL_VIDEO | YOUTUBE_LIVE
    fps: float = Field(1.0, ge=0.2, le=10.0)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gateway")

app = FastAPI(
    title="EsportEcho Predict API Gateway",
    description="Unified API Gateway, Telemetry Orchestrator & Live Broadcast HUD Analyzer",
    version="2.0.0"
)

# Standard compliant CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
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

# State memory for Live Broadcast Analysis
live_worker: Optional[LiveStreamWorker] = None
live_hud_analyzer = ValorantHUDAnalyzer()
live_valorant_model = ValorantTacticalWinProbability()
live_inflection_tagger = ValorantInflectionTagger()
live_task: Optional[asyncio.Task] = None
current_live_state: Optional[Dict[str, Any]] = None
live_history: List[Dict[str, Any]] = []
prev_live_hud_state: Optional[ValorantHUDState] = None
prev_prob_blue: float = 0.50
current_broadcast_meta: Optional[Dict[str, Any]] = None

async def _cancel_playback_task():
    global playback_task
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

def _process_single_tick(tick: TelemetryTick) -> Dict[str, Any]:
    # 1. Pass through analytics engine
    cp, momentum, behavior = analytics_engine.process_tick(tick)
    
    # 2. Pass through prediction engine
    pred = prediction_engine.predict(tick=tick, momentum=momentum, change_point=cp)
    
    tick_dict = tick.model_dump()
    pred_dict = pred.model_dump()
    cp_dict = cp.model_dump() if cp else None
    
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
    return packet

async def _playback_loop():
    logger.info("Playback loop started.")
    try:
        while simulator.is_playing:
            tick = simulator.step()
            if tick is None:
                logger.info("Match simulation reached the end.")
                simulator.is_playing = False
                await ws_manager.broadcast_json({"type": "SIMULATION_FINISHED"})
                break
            
            packet = _process_single_tick(tick)
            await ws_manager.broadcast_json(packet)
            
            delay = max(0.15, 1.5 / max(0.1, simulator.playback_speed))
            await asyncio.sleep(delay)
    except asyncio.CancelledError:
        logger.info("Playback loop task cancelled.")

async def _live_analysis_loop():
    global live_worker, current_live_state, prev_live_hud_state, prev_prob_blue
    logger.info("Live broadcast analysis loop started.")
    try:
        while live_worker and live_worker.is_running:
            frame = live_worker.read_frame()
            if frame is None:
                await asyncio.sleep(0.5)
                continue

            hud_state = live_hud_analyzer.analyze_frame(frame)
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

            hud_dict = hud_state.model_dump()
            # Convert datetime to ISO string for JSON serialization
            if "timestamp" in hud_dict and hasattr(hud_dict["timestamp"], "isoformat"):
                hud_dict["timestamp"] = hud_dict["timestamp"].isoformat()

            events_dict = []
            for ev in events:
                ed = ev.model_dump()
                if "timestamp" in ed and hasattr(ed["timestamp"], "isoformat"):
                    ed["timestamp"] = ed["timestamp"].isoformat()
                events_dict.append(ed)

            packet = {
                "type": "LIVE_HUD_UPDATE",
                "hud_state": hud_dict,
                "win_probability": {
                    "round_blue": p_blue_rnd,
                    "round_red": p_red_rnd,
                    "match_blue": p_blue_match,
                    "match_red": p_red_match
                },
                "inflection_events": events_dict
            }
            current_live_state = packet
            live_history.append(packet)
            # Bound live history memory
            if len(live_history) > 300:
                live_history.pop(0)

            await ws_manager.broadcast_json(packet)

            delay = max(0.2, 1.0 / max(0.1, live_worker.fps))
            await asyncio.sleep(delay)
    except asyncio.CancelledError:
        logger.info("Live analysis loop task cancelled.")

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "api-gateway",
        "active_ws_clients": len(ws_manager.active_connections),
        "total_processed_ticks": len(processed_ticks),
        "is_live_broadcasting": live_worker.is_running if live_worker else False
    }

# ----------------- LIVE BROADCAST ANALYSIS ENDPOINTS -----------------

@app.post("/api/v1/live/start")
async def start_live_analysis(req: LiveAnalysisRequest):
    global live_worker, live_task
    await _cancel_live_task()

    source_type_enum = StreamSourceType(req.source_type)
    live_worker = LiveStreamWorker(
        source=req.source,
        source_type=source_type_enum,
        fps=req.fps
    )
    live_worker.start()
    live_task = asyncio.create_task(_live_analysis_loop())

    return {
        "status": "live_started",
        "source": req.source,
        "source_type": req.source_type,
        "fps": req.fps
    }

@app.post("/api/v1/live/stop")
async def stop_live_analysis():
    await _cancel_live_task()
    await ws_manager.broadcast_json({"type": "LIVE_STOPPED"})
    return {"status": "live_stopped"}

@app.get("/api/v1/live/status")
def get_live_status():
    return {
        "is_running": live_worker.is_running if live_worker else False,
        "source_type": live_worker.source_type.value if live_worker else "NONE",
        "fps": live_worker.fps if live_worker else 1.0,
        "processed_frames": len(live_history)
    }

@app.get("/api/v1/live/state")
def get_live_state():
    return {
        "status": "success",
        "current": current_live_state,
        "history_count": len(live_history)
    }

# ----------------- SIMULATION REPLAY ENDPOINTS -----------------

@app.get("/api/v1/matches/current")
def get_current_match():
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
    tick = simulator.step()
    if tick:
        packet = _process_single_tick(tick)
        await ws_manager.broadcast_json(packet)
        return {"status": "stepped", "packet": packet}
    return {"status": "finished"}

@app.post("/api/v1/simulation/play")
async def play_simulation(speed: float = 1.0):
    global playback_task
    simulator.playback_speed = speed
    simulator.is_playing = True
    if playback_task is None or playback_task.done():
        playback_task = asyncio.create_task(_playback_loop())
    return {"status": "playing", "speed": simulator.playback_speed}

@app.post("/api/v1/simulation/pause")
async def pause_simulation():
    simulator.is_playing = False
    await _cancel_playback_task()
    return {"status": "paused"}

@app.post("/api/v1/simulation/reset")
async def reset_simulation():
    global simulator, analytics_engine, prediction_engine
    await _cancel_playback_task()
    simulator.reset()
    analytics_engine = AnalyticsEngine(match_id=simulator.ticks[0].match_id if simulator.ticks else "MATCH-DEFAULT")
    prediction_engine = PredictionEngine()
    processed_ticks.clear()
    change_points.clear()
    predictions.clear()
    await ws_manager.broadcast_json({"type": "SIMULATION_RESET"})
    return {"status": "reset"}

def parse_video_id(url: str) -> str:
    m = re.search(r'(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11})', url)
    return m.group(1) if m else url.strip()

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
            'logger': _QuietLogger()
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=False)
            if info:
                title = info.get("title") or f"VALORANT VCT Champions [{vid}]"
                return {
                    "video_id": vid,
                    "title": title,
                    "author": info.get("uploader") or info.get("channel") or "VALORANT Champions Tour",
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
                "title": data.get("title", f"VALORANT VCT Champions [{vid}]"),
                "author": data.get("author_name", "VALORANT Champions Tour"),
                "thumbnail_url": data.get("thumbnail_url", f"https://img.youtube.com/vi/{vid}/hqdefault.jpg"),
                "duration": 1440,
                "is_live": False
            }
    except Exception:
        return {
            "video_id": vid,
            "title": f"VALORANT VCT Champions Ascent [{vid}]",
            "author": "VALORANT Champions Tour",
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
    global simulator, analytics_engine, prediction_engine, processed_ticks, change_points, predictions, current_broadcast_meta
    await _cancel_playback_task()

    meta = fetch_youtube_metadata(req.url)
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
        "duration": meta.get("duration", 1440),
        "is_live": meta.get("is_live", False)
    }
    current_broadcast_meta = broadcast_data

    await ws_manager.broadcast_json({
        "type": "YOUTUBE_ANALYZED",
        **broadcast_data,
        "total_ticks": len(ticks),
        "simulator_status": simulator.get_status()
    })

    return {
        "status": "ready",
        **broadcast_data
    }

@app.post("/api/v1/simulation/seek")
async def seek_simulation(req: SeekRequest):
    global simulator, analytics_engine, prediction_engine, processed_ticks, change_points, predictions
    await _cancel_playback_task()

    target_idx = None
    for idx, t in enumerate(simulator.ticks):
        if t.sequence_id == req.sequence_id:
            target_idx = idx
            break

    if target_idx is None:
        return {"status": "not_found"}

    # Resynchronize sequential analytics state by replaying up to target tick
    match_id = simulator.ticks[0].match_id if simulator.ticks else "MATCH-DEFAULT"
    analytics_engine = AnalyticsEngine(match_id=match_id)
    prediction_engine = PredictionEngine()
    processed_ticks.clear()
    change_points.clear()
    predictions.clear()

    last_packet = None
    for i in range(target_idx + 1):
        tick = simulator.ticks[i]
        last_packet = _process_single_tick(tick)

    simulator.current_index = target_idx + 1
    if last_packet:
        await ws_manager.broadcast_json(last_packet)
        return {"status": "seeked", "packet": last_packet}
    return {"status": "not_found"}

@app.get("/api/v1/analytics/pelt")
def get_pelt_segments():
    segments = analytics_engine.run_pelt_segmentation()
    return {"status": "success", "segments": segments}

@app.websocket("/ws/live")
async def websocket_live_stream(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        await websocket.send_json({
            "type": "INITIAL_SNAPSHOT",
            "ticks": processed_ticks,
            "predictions": predictions,
            "change_points": change_points,
            "simulator_status": simulator.get_status(),
            "broadcast_meta": current_broadcast_meta,
            "live_status": {
                "is_running": live_worker.is_running if live_worker else False,
                "current_live": current_live_state
            }
        })
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
