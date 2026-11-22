import pytest
from fastapi.testclient import TestClient
from services.gateway.app.main import app

@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client

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

def test_gateway_simulation_seek(client):
    response = client.post("/api/v1/simulation/seek", json={"sequence_id": 5})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "seeked"
    assert data["packet"]["tick"]["sequence_id"] == 5

    # Verify history replay synchronization
    state_res = client.get("/api/v1/matches/current")
    assert state_res.status_code == 200
    ticks = state_res.json()["ticks"]
    assert len(ticks) == 6
    assert [t["sequence_id"] for t in ticks] == [0, 1, 2, 3, 4, 5]

def test_gateway_simulation_seek_invalid(client):
    response = client.post("/api/v1/simulation/seek", json={"sequence_id": 9999})
    assert response.status_code == 200
    assert response.json()["status"] == "not_found"

def test_gateway_broadcast_current_and_init(client, monkeypatch):
    from services.gateway.app import main as gw_main
    monkeypatch.setattr(gw_main, "fetch_youtube_metadata", lambda url: {
        "video_id": "s9pB4sD8QxM",
        "title": "VALORANT VCT Champions Ascent [s9pB4sD8QxM]",
        "author": "VALORANT Champions Tour",
        "thumbnail_url": "https://img.youtube.com/vi/s9pB4sD8QxM/hqdefault.jpg",
        "duration": 1440,
        "is_live": False
    })

    # Check initial broadcast state
    res = client.get("/api/v1/broadcast/current")
    assert res.status_code == 200
    assert "is_initialized" in res.json()

    # Initialize with YouTube URL
    init_res = client.post("/api/v1/broadcast/init-youtube", json={
        "url": "https://www.youtube.com/watch?v=s9pB4sD8QxM"
    })
    assert init_res.status_code == 200
    data = init_res.json()
    assert data["status"] == "ready"
    assert data["video_id"] == "s9pB4sD8QxM"
    assert "total_rounds" in data

    # Verify current broadcast endpoint reports initialized
    cur_res = client.get("/api/v1/broadcast/current")
    assert cur_res.status_code == 200
    cur_data = cur_res.json()
    assert cur_data["is_initialized"] is True
    assert cur_data["video_id"] == "s9pB4sD8QxM"


def test_websocket_replay_step_reconnect_and_backward_seek(client):
    client.post("/api/v1/simulation/reset").raise_for_status()
    with client.websocket_connect("/ws/live") as socket:
        assert socket.receive_json()["type"] == "INITIAL_SNAPSHOT"
        for sequence in range(4):
            client.post("/api/v1/simulation/step").raise_for_status()
            packet = socket.receive_json()
            assert packet["type"] == "TICK_UPDATE"
            assert packet["tick"]["sequence_id"] == sequence
            assert packet["prediction"]["timestamp"]
    with client.websocket_connect("/ws/live") as first, client.websocket_connect("/ws/live") as second:
        for socket in (first, second):
            snapshot = socket.receive_json()
            assert len(snapshot["ticks"]) == 4
            assert snapshot["ticks"][-1]["timestamp"]
        result = client.post("/api/v1/simulation/seek", json={"sequence_id": 1}).json()
        for socket in (first, second):
            snapshot = socket.receive_json()
            assert snapshot == result["snapshot"]
            assert [tick["sequence_id"] for tick in snapshot["ticks"]] == [0, 1]
            assert snapshot["simulator_status"]["current_index"] == 2
            assert snapshot["simulator_status"]["is_playing"] is False


def test_replay_and_live_input_validation(client):
    assert client.post("/api/v1/simulation/play", params={"speed": 0}).status_code == 422
    assert client.post("/api/v1/simulation/analyze-youtube", json={"url": "invalid"}).status_code == 422
    assert client.post("/api/v1/live/start", json={"source_type": "unsupported"}).status_code == 422


def test_browser_write_and_socket_require_same_origin(client):
    origin = {"origin": "http://testserver"}
    assert client.post("/api/v1/simulation/reset", headers=origin).status_code == 200
    assert client.post("/api/v1/simulation/reset", headers={"origin": "null"}).status_code == 403
    with client.websocket_connect("/ws/live", headers=origin) as socket:
        assert socket.receive_json()["type"] == "INITIAL_SNAPSHOT"
