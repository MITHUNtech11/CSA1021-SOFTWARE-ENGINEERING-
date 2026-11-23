from pathlib import Path
import runpy
import secrets

import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect


ORIGIN = "https://dashboard.example.org"
GATEWAY = Path(__file__).resolve().parents[1] / "app" / "main.py"


def test_hosted_dashboard_controls_and_updates(monkeypatch):
    key = secrets.token_urlsafe(32)
    monkeypatch.setenv("ESPORTECHO_ACCESS_KEY", key)
    monkeypatch.setenv("ESPORTECHO_DASHBOARD_ORIGIN", ORIGIN)
    # Load a separate gateway with the same startup configuration as the container.
    with TestClient(runpy.run_path(str(GATEWAY))["app"]) as client:
        assert client.get("/health").status_code == 200
        assert client.get("/api/v1/matches/current").status_code == 401
        assert client.post("/api/v1/simulation/step").status_code == 401
        preflight = client.options("/api/v1/simulation/step", headers={
            "Origin": ORIGIN, "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        })
        assert preflight.status_code == 200
        assert preflight.headers["access-control-allow-origin"] == ORIGIN
        headers = {"Authorization": f"Bearer {key}", "Origin": ORIGIN}
        other = {**headers, "Origin": ORIGIN + ".example.net"}
        assert client.post("/api/v1/simulation/step", headers=other).status_code == 403
        with pytest.raises(WebSocketDisconnect):
            with client.websocket_connect("/ws/live", headers=other):
                pytest.fail("Gateway accepted an unexpected origin")
        with client.websocket_connect("/ws/live", headers={"Origin": ORIGIN}) as ws:
            ws.send_text("wrong")
            assert ws.receive_json() == {"type": "ACCESS_DENIED"}
            with pytest.raises(WebSocketDisconnect) as exc:
                ws.receive_json()
            assert exc.value.code == 4401
        with client.websocket_connect("/ws/live", headers={"Origin": ORIGIN}) as ws:
            ws.send_text(key)
            assert ws.receive_json()["type"] == "INITIAL_SNAPSHOT"
            response = client.post("/api/v1/simulation/step", headers=headers)
            assert response.status_code == 200
            assert response.headers["access-control-allow-origin"] == ORIGIN
            assert ws.receive_json()["type"] == "TICK_UPDATE"


def test_hosted_startup_requires_access_key(monkeypatch):
    monkeypatch.setenv("RENDER", "true")
    monkeypatch.setenv("ESPORTECHO_DASHBOARD_ORIGIN", ORIGIN)
    monkeypatch.delenv("ESPORTECHO_ACCESS_KEY", raising=False)
    with pytest.raises(RuntimeError, match="ESPORTECHO_ACCESS_KEY"):
        runpy.run_path(str(GATEWAY))
