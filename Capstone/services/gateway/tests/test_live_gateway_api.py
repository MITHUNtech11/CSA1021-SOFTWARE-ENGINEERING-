import pytest
from fastapi.testclient import TestClient
from services.gateway.app.main import app

@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client

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


def test_video_start_failure_is_reported_without_synthetic_fallback(client, monkeypatch, tmp_path):
    from services.ingestion.app import stream_reader

    recording = tmp_path / "fixture.mp4"
    recording.touch()
    monkeypatch.setenv("ESPORTECHO_VIDEO_DIR", str(tmp_path))
    monkeypatch.setattr(stream_reader.shutil, "which", lambda name: None)

    response = client.post("/api/v1/live/start", json={
        "source": recording.name, "source_type": "LOCAL_VIDEO",
    })

    assert response.status_code == 503
    status = client.get("/api/v1/live/status").json()
    assert status["is_running"] is False
    assert status["error"]
    assert client.get("/api/v1/live/state").json()["current"] is None


def test_synthetic_updates_include_source_and_clear_state_on_stop(client):
    with client.websocket_connect("/ws/live") as socket:
        assert socket.receive_json()["type"] == "INITIAL_SNAPSHOT"
        assert client.post("/api/v1/live/start", json={}).status_code == 200
        assert socket.receive_json()["type"] == "LIVE_STARTED"
        update = socket.receive_json()
        assert update["type"] == "LIVE_HUD_UPDATE"
        assert update["source_type"] == "SYNTHETIC"
        assert update["hud_state"]["timestamp"]
        assert client.post("/api/v1/live/stop").status_code == 200
        assert socket.receive_json()["type"] == "LIVE_STOPPED"
        assert client.get("/api/v1/live/status").json()["is_running"] is False


def test_live_gateway_reports_decoder_error_through_rest_and_socket(client, monkeypatch):
    from services.ingestion.app.stream_reader import LiveStreamWorker, VideoSourceError

    def fail_to_decode(self):
        raise VideoSourceError("YouTube media rejected access (HTTP 403).")

    monkeypatch.setattr(LiveStreamWorker, "prepare", lambda self: None)
    monkeypatch.setattr(LiveStreamWorker, "start", lambda self: None)
    monkeypatch.setattr(LiveStreamWorker, "read_frame", fail_to_decode)

    with client.websocket_connect("/ws/live") as socket:
        assert socket.receive_json()["type"] == "INITIAL_SNAPSHOT"
        response = client.post("/api/v1/live/start", json={
            "source": "BaW_jenozKc", "source_type": "YOUTUBE_LIVE",
        })
        assert response.status_code == 502
        message = response.json()["detail"]
        assert "HTTP 403" in message
        assert socket.receive_json() == {"type": "LIVE_STOPPED", "error": message}
        assert not client.get("/api/v1/live/status").json()["is_running"]


def test_youtube_session_shares_player_id_and_analysis_clock(client, monkeypatch):
    from services.ingestion.app.stream_reader import LiveStreamWorker

    def start_fixture(worker):
        worker.is_running = True

    def read_fixture(worker):
        if not worker.is_running:
            return None
        worker._frame_count += 1
        return worker._generate_synthetic_broadcast_frame(worker._frame_count)

    monkeypatch.setattr(LiveStreamWorker, "prepare", lambda self: None)
    monkeypatch.setattr(LiveStreamWorker, "start", start_fixture)
    monkeypatch.setattr(LiveStreamWorker, "read_frame", read_fixture)

    with client.websocket_connect("/ws/live") as socket:
        assert socket.receive_json()["type"] == "INITIAL_SNAPSHOT"
        response = client.post("/api/v1/live/start", json={
            "source": "https://youtu.be/BaW_jenozKc", "source_type": "YOUTUBE_LIVE", "fps": 2,
        })
        response.raise_for_status()
        assert response.json()["video_id"] == "BaW_jenozKc"
        started = socket.receive_json()
        assert started["type"] == "LIVE_STARTED"
        assert started["video_id"] == "BaW_jenozKc"
        for index in range(4):
            update = socket.receive_json()
            assert update["type"] == "LIVE_HUD_UPDATE"
            assert update["analysis_seconds"] == index / 2
        assert update["inflection_events"][0]["analysis_seconds"] == 1.5
        with client.websocket_connect("/ws/live") as reconnect:
            snapshot = reconnect.receive_json()
            assert snapshot["live_status"]["video_id"] == "BaW_jenozKc"
            assert snapshot["live_status"]["current_live"]["analysis_seconds"] >= 1.5

    client.post("/api/v1/live/stop").raise_for_status()
    assert client.get("/api/v1/live/status").json()["video_id"] is None
