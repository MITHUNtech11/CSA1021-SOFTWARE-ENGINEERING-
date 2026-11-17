import pytest
from fastapi.testclient import TestClient
from services.gateway.app.main import app

@pytest.fixture
def client():
    # Reset simulation state before running e2e test
    c = TestClient(app)
    c.post("/api/v1/simulation/reset")
    return c

def test_full_match_simulation_e2e(client):
    # Step through all 24 ticks of the match
    for _ in range(24):
        res = client.post("/api/v1/simulation/step")
        assert res.status_code == 200

    # Query full match state from gateway
    state_res = client.get("/api/v1/matches/current")
    assert state_res.status_code == 200
    data = state_res.json()

    assert len(data["ticks"]) == 24
    assert len(data["predictions"]) == 24
    assert len(data["change_points"]) >= 1

    # Verify win probability progression
    first_pred = data["predictions"][0]
    last_pred = data["predictions"][-1]
    
    assert pytest.approx(first_pred["win_probability_blue"], 0.05) == 0.50
    # By minute 24, T1 has massive gold lead, barons, and turrets
    assert last_pred["win_probability_blue"] > 0.85
    assert last_pred["win_probability_red"] < 0.15

    # Verify that turning point was flagged
    inflections = [p for p in data["predictions"] if p["is_inflection_point"]]
    assert len(inflections) >= 1

    # Verify PELT segmentation
    pelt_res = client.get("/api/v1/analytics/pelt")
    assert pelt_res.status_code == 200
    segments = pelt_res.json()["segments"]
    assert isinstance(segments, list)
