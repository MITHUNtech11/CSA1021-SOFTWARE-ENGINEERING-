import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from shared.models.telemetry import TelemetryTick
from shared.models.change_point import ChangePointRecord
from shared.models.prediction import PredictionRecord
from services.ingestion.app.simulator import MatchSimulator
from services.analytics.app.engine import AnalyticsEngine
from services.prediction.app.service import PredictionEngine
from services.gateway.app.ws_manager import WebSocketManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gateway")

app = FastAPI(
    title="EsportEcho Predict API Gateway",
    description="Unified API Gateway, Telemetry Orchestrator & WebSocket Multiplexer",
    version="1.0.0"
)

# Enable CORS for React Vite client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ws_manager = WebSocketManager()

# Default match path
DEFAULT_MATCH_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "sample_matches" / "match_t1_vs_wbg_worlds_finals.json"

simulator = MatchSimulator.load_from_file(DEFAULT_MATCH_PATH) if DEFAULT_MATCH_PATH.exists() else MatchSimulator()
analytics_engine = AnalyticsEngine(match_id=simulator.ticks[0].match_id if simulator.ticks else "MATCH-DEFAULT")
prediction_engine = PredictionEngine()

# State memory
processed_ticks: List[Dict[str, Any]] = []
change_points: List[Dict[str, Any]] = []
predictions: List[Dict[str, Any]] = []
playback_task: Optional[asyncio.Task] = None

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
    while simulator.is_playing:
        tick = simulator.step()
        if tick is None:
            logger.info("Match simulation reached the end.")
            simulator.is_playing = False
            await ws_manager.broadcast_json({"type": "SIMULATION_FINISHED"})
            break
        
        packet = _process_single_tick(tick)
        await ws_manager.broadcast_json(packet)
        
        # Pacing: base delay 1.5s scaled by playback speed (1x to 10x)
        delay = max(0.15, 1.5 / max(0.1, simulator.playback_speed))
        await asyncio.sleep(delay)

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "api-gateway",
        "active_ws_clients": len(ws_manager.active_connections),
        "total_processed_ticks": len(processed_ticks),
        "total_change_points": len(change_points)
    }

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
def pause_simulation():
    simulator.is_playing = False
    return {"status": "paused"}

@app.post("/api/v1/simulation/reset")
async def reset_simulation():
    global simulator, analytics_engine, prediction_engine
    simulator.reset()
    analytics_engine = AnalyticsEngine(match_id=simulator.ticks[0].match_id if simulator.ticks else "MATCH-DEFAULT")
    prediction_engine = PredictionEngine()
    processed_ticks.clear()
    change_points.clear()
    predictions.clear()
    await ws_manager.broadcast_json({"type": "SIMULATION_RESET"})
    return {"status": "reset"}

@app.get("/api/v1/analytics/pelt")
def get_pelt_segments():
    segments = analytics_engine.run_pelt_segmentation()
    return {"status": "success", "segments": segments}

@app.websocket("/ws/live")
async def websocket_live_stream(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial snapshot upon connection
        await websocket.send_json({
            "type": "INITIAL_SNAPSHOT",
            "ticks": processed_ticks,
            "predictions": predictions,
            "change_points": change_points,
            "simulator_status": simulator.get_status()
        })
        while True:
            # Keep-alive heartbeat receiver
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
