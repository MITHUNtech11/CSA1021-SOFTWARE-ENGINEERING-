from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "service" in data
    assert "timestamp" in data

def test_not_found_error_format():
    res = client.get("/api/non-existent-endpoint")
    assert res.status_code == 404
    data = res.json()
    assert "error" in data
