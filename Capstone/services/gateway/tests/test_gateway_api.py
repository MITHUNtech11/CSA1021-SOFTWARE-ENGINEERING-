import pytest
from fastapi.testclient import TestClient
from services.gateway.app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_gateway_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["service"] == "api-gateway"

def test_gateway_get_match_state(client):
    response = client.get("/api/v1/matches/current")
    assert response.status_code == 200
    data = response.json()
    assert "match_id" in data
    assert "ticks" in data
    assert "predictions" in data
    assert "change_points" in data

def test_gateway_simulation_step(client):
    response = client.post("/api/v1/simulation/step")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["stepped", "finished", "idle"]

def test_gateway_pelt_endpoint(client):
    # Step several times to build history
    for _ in range(8):
        client.post("/api/v1/simulation/step")
    response = client.get("/api/v1/analytics/pelt")
    assert response.status_code == 200
    assert "segments" in response.json()
