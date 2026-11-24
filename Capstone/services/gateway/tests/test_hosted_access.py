from pathlib import Path
import runpy

import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect


ORIGIN = "https://dashboard.example.org"
GATEWAY = Path(__file__).resolve().parents[1] / "app" / "main.py"


@pytest.mark.parametrize("legacy_key", [None, "previous-deployment-secret"])
def test_hosted_dashboard_controls_and_updates(monkeypatch, legacy_key):
    monkeypatch.setenv("RENDER", "true")
    if legacy_key is None:
        monkeypatch.delenv("ESPORTECHO_ACCESS_KEY", raising=False)
    else:
        monkeypatch.setenv("ESPORTECHO_ACCESS_KEY", legacy_key)
    monkeypatch.setenv("ESPORTECHO_DASHBOARD_ORIGIN", ORIGIN)
    # Load a separate gateway with the same startup configuration as the container.
    with TestClient(runpy.run_path(str(GATEWAY))["app"]) as client:
        assert client.get("/health").status_code == 200
        assert client.get("/api/v1/matches/current").status_code == 200
        preflight = client.options("/api/v1/simulation/step", headers={
            "Origin": ORIGIN, "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        })
        assert preflight.status_code == 200
        assert preflight.headers["access-control-allow-origin"] == ORIGIN
        headers = {"Origin": ORIGIN}
        other = {**headers, "Origin": ORIGIN + ".example.net"}
        assert client.post("/api/v1/simulation/step", headers=other).status_code == 403
        with pytest.raises(WebSocketDisconnect):
            with client.websocket_connect("/ws/live", headers=other):
                pytest.fail("Gateway accepted an unexpected origin")
        with client.websocket_connect("/ws/live", headers=headers) as ws:
            assert ws.receive_json()["type"] == "INITIAL_SNAPSHOT"
            response = client.post("/api/v1/simulation/step", headers=headers)
            assert response.status_code == 200
            assert response.headers["access-control-allow-origin"] == ORIGIN
            assert ws.receive_json()["type"] == "TICK_UPDATE"
        with client.websocket_connect("/ws/live", headers=headers) as ws:
            assert ws.receive_json()["simulator_status"]["current_index"] == 1
