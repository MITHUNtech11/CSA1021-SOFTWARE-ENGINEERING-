import pytest
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_get_events_list():
    res = client.get("/api/events")
    assert res.status_code == 200
    events = res.json()
    assert isinstance(events, list)
    assert len(events) >= 5
    first = events[0]
    assert "id" in first
    assert "title" in first
    assert "category" in first
    assert "sessions_count" in first

def test_get_events_category_filter():
    res = client.get("/api/events?category=Hackathon")
    assert res.status_code == 200
    events = res.json()
    assert isinstance(events, list)
    assert all(e["category"] == "Hackathon" for e in events)

def test_get_single_event_with_sessions_and_announcements():
    res = client.get("/api/events/evt-1")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "evt-1"
    assert "sessions" in data
    assert isinstance(data["sessions"], list)
    assert len(data["sessions"]) == 3
    assert "announcements" in data

def test_get_single_event_not_found():
    res = client.get("/api/events/evt-non-existent")
    assert res.status_code == 404
    data = res.json()
    assert data["error"] == "Event not found"

def test_create_update_delete_event():
    # 1. Create
    payload = {
        "title": "TDD Test Hackathon",
        "description": "Building cool stuff",
        "category": "Hackathon",
        "venue": "Lab 101",
        "date": "2026-11-20",
        "start_time": "09:00 AM",
        "end_time": "05:00 PM",
        "registration_deadline": "2026-11-19",
        "capacity": 50,
        "coordinator_name": "Dr. Test",
        "coordinator_contact": "+91 98765 43210",
        "sessions": [
            {
                "round_name": "Round 1",
                "venue_room": "Room A",
                "start_time": "09:00 AM",
                "end_time": "12:00 PM",
                "description": "Initial Round",
                "order_index": 1
            }
        ]
    }
    create_res = client.post("/api/events", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    event_id = created_data["id"]
    assert event_id.startswith("evt-")
    assert len(created_data["sessions"]) == 1

    # 2. Update
    update_res = client.put(f"/api/events/{event_id}", json={"title": "Updated TDD Hackathon"})
    assert update_res.status_code == 200
    assert update_res.json()["message"] == "Event updated successfully"

    # Verify update
    get_res = client.get(f"/api/events/{event_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Updated TDD Hackathon"

    # 3. Delete
    del_res = client.delete(f"/api/events/{event_id}")
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "Event deleted successfully"

    # Verify deleted
    get_res404 = client.get(f"/api/events/{event_id}")
    assert get_res404.status_code == 404
