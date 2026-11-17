import pytest
from fastapi.testclient import TestClient
from services.ingestion.app.main import app
from services.ingestion.app.validator import OutOfOrderBuffer
from shared.models.telemetry import TelemetryTick, TeamState

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def sample_tick():
    return {
        "match_id": "TEST-MATCH-101",
        "sequence_id": 1,
        "game_time_seconds": 60.0,
        "blue_team": {
            "team_name": "T1",
            "total_gold": 2500,
            "total_kills": 0,
            "total_deaths": 0,
            "turrets_destroyed": 0,
            "dragons": 0,
            "barons": 0,
            "vision_score": 5.0
        },
        "red_team": {
            "team_name": "WBG",
            "total_gold": 2400,
            "total_kills": 0,
            "total_deaths": 0,
            "turrets_destroyed": 0,
            "dragons": 0,
            "barons": 0,
            "vision_score": 4.5
        }
    }

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_ingest_valid_tick(client, sample_tick):
    response = client.post("/api/v1/telemetry/ingest", json=sample_tick)
    assert response.status_code == 202
    data = response.json()
    assert data["status"] == "accepted"
    assert data["sequence_id"] == 1
    assert data["gold_diff"] == 100

def test_ingest_invalid_tick_rejected(client):
    bad_tick = {"match_id": "TEST"} # missing required fields
    response = client.post("/api/v1/telemetry/ingest", json=bad_tick)
    assert response.status_code == 422

def test_out_of_order_buffer():
    buf = OutOfOrderBuffer(window_size=5)
    def make_tick(seq):
        return TelemetryTick(
            match_id="TEST",
            sequence_id=seq,
            game_time_seconds=float(seq * 60),
            blue_team=TeamState(team_name="B", total_gold=seq*1000, total_kills=0, total_deaths=0),
            red_team=TeamState(team_name="R", total_gold=seq*1000, total_kills=0, total_deaths=0)
        )
    # Feed ticks out-of-order: seq 2, then seq 0, then seq 1
    out0 = buf.push(make_tick(2))
    assert out0 == [] # Cannot release yet because seq 0 and 1 are missing
    out1 = buf.push(make_tick(0))
    # seq 0 is the expected next sequence!
    assert len(out1) == 1
    assert out1[0].sequence_id == 0
    # Now feed seq 1, which should release seq 1 and seq 2 in order
    out2 = buf.push(make_tick(1))
    assert len(out2) == 2
    assert out2[0].sequence_id == 1
    assert out2[1].sequence_id == 2
