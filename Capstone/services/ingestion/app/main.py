from fastapi import FastAPI, HTTPException, status
from typing import List, Dict, Any, Optional
from shared.models.telemetry import TelemetryTick
from services.ingestion.app.validator import OutOfOrderBuffer
from services.ingestion.app.simulator import MatchSimulator

app = FastAPI(
    title="EsportEcho Ingestion Service",
    description="High-Throughput Match Telemetry Ingestion & Replay Service",
    version="1.0.0"
)

# In-memory buffer and state for standalone testing & development
buffer = OutOfOrderBuffer(window_size=10)
simulator = MatchSimulator()
ingested_ticks: List[TelemetryTick] = []

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ingestion-service",
        "buffered_ticks": len(buffer.buffer),
        "total_ingested": len(ingested_ticks)
    }

@app.post("/api/v1/telemetry/ingest", status_code=status.HTTP_202_ACCEPTED)
def ingest_telemetry_tick(tick: TelemetryTick):
    """
    Ingest a telemetry tick, pass through jitter buffer, and output sequenced stream.
    """
    released = buffer.push(tick)
    for t in released:
        ingested_ticks.append(t)
    return {
        "status": "accepted",
        "sequence_id": tick.sequence_id,
        "match_id": tick.match_id,
        "game_time_seconds": tick.game_time_seconds,
        "gold_diff": tick.gold_diff,
        "kill_diff": tick.kill_diff,
        "released_count": len(released)
    }

@app.get("/api/v1/telemetry/history", response_model=List[TelemetryTick])
def get_telemetry_history():
    return ingested_ticks

@app.get("/api/v1/simulation/status")
def simulation_status():
    return simulator.get_status()

@app.post("/api/v1/simulation/step")
def simulation_step():
    tick = simulator.step()
    if tick:
        buffer.push(tick)
        ingested_ticks.append(tick)
        return {"status": "success", "tick": tick}
    return {"status": "finished", "tick": None}

@app.post("/api/v1/simulation/reset")
def simulation_reset():
    simulator.reset()
    buffer.buffer.clear()
    ingested_ticks.clear()
    return {"status": "reset"}
