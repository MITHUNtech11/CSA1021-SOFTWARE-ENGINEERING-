import pytest
from fastapi.testclient import TestClient
from services.gateway.app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_live_gateway_status_initial(client):
    response = client.get("/api/v1/live/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_running" in data
    assert "source_type" in data

def test_live_gateway_start_and_stop_synthetic(client):
    # Start synthetic broadcast analysis
    start_res = client.post("/api/v1/live/start", json={
        "source": "SYNTHETIC",
        "source_type": "SYNTHETIC",
        "fps": 2.0
    })
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "live_started"

    # Query status
    status_res = client.get("/api/v1/live/status")
    assert status_res.status_code == 200
    assert status_res.json()["is_running"] is True

    # Stop analysis
    stop_res = client.post("/api/v1/live/stop")
    assert stop_res.status_code == 200
    assert stop_res.json()["status"] == "live_stopped"

    # Verify status is stopped
    status_after = client.get("/api/v1/live/status")
    assert status_after.json()["is_running"] is False

def test_live_gateway_state_endpoint(client):
    response = client.get("/api/v1/live/state")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "history_count" in data
