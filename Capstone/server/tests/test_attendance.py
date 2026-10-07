import pytest
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_update_attendance_status():
    # Update attendance for seeded registration reg-2 (Meera Krishnan)
    res = client.patch("/api/registrations/reg-2/attendance", json={"status": "checked_in"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "checked_in"
    assert data["check_in_time"] is not None

def test_update_attendance_invalid_status():
    res = client.patch("/api/registrations/reg-2/attendance", json={"status": "invalid_status"})
    assert res.status_code == 400
    assert "error" in res.json()

def test_verify_ticket_valid_and_auto_checkin():
    # Verify seeded ticket EVF-2026-X802
    res = client.post("/api/attendance/verify", json={"ticket_code": "EVF-2026-X802", "auto_check_in": True})
    assert res.status_code == 200
    data = res.json()
    assert data["verified"] is True
    assert "registration" in data
    assert data["registration"]["ticket_code"] == "EVF-2026-X802"

def test_verify_ticket_invalid():
    res = client.post("/api/attendance/verify", json={"ticket_code": "EVF-INVALID-CODE"})
    assert res.status_code == 404
    data = res.json()
    assert data["verified"] is False
    assert "error" in data
