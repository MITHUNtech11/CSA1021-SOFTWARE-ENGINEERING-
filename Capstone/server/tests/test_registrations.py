import time
import pytest
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_register_for_event_success_and_duplicate():
    test_email = f"alice.{int(time.time() * 1000)}@campus.edu"
    payload = {
        "participant_name": "Alice Tester",
        "email": test_email,
        "phone": "+91 91234 56789",
        "college": "TechTrove University",
        "department": "Computer Science",
        "year_of_study": "3rd Year"
    }
    # 1. Successful registration
    res = client.post("/api/events/evt-1/register", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["message"] == "Registration successful!"
    assert data["ticket_code"].startswith("EVF-2026-")
    assert data["participant_name"] == "Alice Tester"
    ticket = data["ticket_code"]
    reg_id = data["id"]

    # 2. Duplicate registration attempt with same email
    dup_res = client.post("/api/events/evt-1/register", json=payload)
    assert dup_res.status_code == 409
    dup_data = dup_res.json()
    assert "already registered" in dup_data["error"]
    assert dup_data["ticket_code"] == ticket
    assert dup_data["registration_id"] == reg_id

def test_register_non_existent_event():
    res = client.post("/api/events/evt-does-not-exist/register", json={
        "participant_name": "Bob",
        "email": "bob@campus.edu",
        "phone": "12345",
        "department": "IT",
        "year_of_study": "1st Year"
    })
    assert res.status_code == 404
    assert res.json()["error"] == "Event not found"

def test_get_my_registrations():
    res = client.get("/api/registrations/my?email=aditya.nair@college.edu")
    assert res.status_code == 200
    regs = res.json()
    assert isinstance(regs, list)
    assert len(regs) >= 1
    assert regs[0]["email"].lower() == "aditya.nair@college.edu"
    assert regs[0]["event_title"] is not None

def test_get_my_registrations_missing_email():
    res = client.get("/api/registrations/my")
    assert res.status_code == 400

def test_event_attendees_and_export():
    # Attendees roster
    res = client.get("/api/events/evt-1/registrations")
    assert res.status_code == 200
    attendees = res.json()
    assert isinstance(attendees, list)
    assert len(attendees) >= 1

    # CSV Export
    csv_res = client.get("/api/events/evt-1/registrations/export")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "attachment;" in csv_res.headers.get("content-disposition", "")
    content = csv_res.text
    assert "Ticket Code" in content
    assert "Aditya Nair" in content

def test_global_registrations():
    res = client.get("/api/registrations")
    assert res.status_code == 200
    regs = res.json()
    assert isinstance(regs, list)
    assert len(regs) >= 1
