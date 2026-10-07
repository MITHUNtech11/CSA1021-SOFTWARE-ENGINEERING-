import os
import pytest
from fastapi.testclient import TestClient

from server.database import get_db, init_schema, seed_if_empty
from server.main import app


@pytest.fixture(scope="module")
def api_client(tmp_path_factory):
    test_db = str(tmp_path_factory.mktemp("api_data") / "test_api_runner.db")
    old_db = os.environ.get("DB_PATH")
    os.environ["DB_PATH"] = test_db

    with get_db(test_db) as conn:
        init_schema(conn)
        seed_if_empty(conn)

    with TestClient(app) as client:
        yield client

    if old_db is not None:
        os.environ["DB_PATH"] = old_db
    else:
        os.environ.pop("DB_PATH", None)

    if os.path.exists(test_db):
        try:
            os.remove(test_db)
        except OSError:
            pass


def test_full_api_integration_suite(api_client):
    # 1. GET /api/events
    res_events = api_client.get("/api/events")
    assert res_events.status_code == 200
    events = res_events.json()
    assert isinstance(events, list) and len(events) >= 5, "Should return at least 5 events"

    # 2. Filter /api/events?category=Hackathon
    res_hackathons = api_client.get("/api/events?category=Hackathon")
    assert res_hackathons.status_code == 200
    hackathons = res_hackathons.json()
    assert len(hackathons) >= 1 and hackathons[0]["category"] == "Hackathon"

    # 3. GET /api/events/:id
    target_id = events[0]["id"]
    res_single = api_client.get(f"/api/events/{target_id}")
    assert res_single.status_code == 200
    event_details = res_single.json()
    assert event_details["id"] == target_id
    assert isinstance(event_details.get("sessions"), list)

    # 4. POST /api/events (Create Event)
    new_event_payload = {
        "title": "Autonomous Drone Grand Prix",
        "description": "Autonomous indoor drone obstacle racing league.",
        "category": "Technical",
        "venue": "Indoor Arena Court 3",
        "date": "2026-11-10",
        "start_time": "10:00 AM",
        "end_time": "04:00 PM",
        "registration_deadline": "2026-11-08",
        "capacity": 40,
        "coordinator_name": "Sameer Khan",
        "coordinator_contact": "+91 99000 11223",
        "sessions": [
            {
                "round_name": "Time Trials",
                "venue_room": "Court 3A",
                "start_time": "10:00 AM",
                "end_time": "12:00 PM",
                "order_index": 1,
            },
            {
                "round_name": "Championship Circuit",
                "venue_room": "Court 3B",
                "start_time": "01:30 PM",
                "end_time": "04:00 PM",
                "order_index": 2,
            },
        ],
    }
    res_create = api_client.post("/api/events", json=new_event_payload)
    assert res_create.status_code == 201
    created_event = res_create.json()
    assert created_event["id"] and created_event["title"] == new_event_payload["title"]
    assert len(created_event["sessions"]) == 2

    # 5. POST /api/events/:id/register
    reg_payload = {
        "participant_name": "Riya Sen",
        "email": "riya.sen@testcollege.edu",
        "phone": "+91 98888 77665",
        "college": "IIT Madras",
        "department": "Computer Science",
        "year_of_study": "3rd Year",
    }
    res_reg = api_client.post(f"/api/events/{created_event['id']}/register", json=reg_payload)
    assert res_reg.status_code == 201
    reg_data = res_reg.json()
    assert reg_data.get("ticket_code") and reg_data["ticket_code"].startswith("EVF-")

    # 6. GET /api/registrations/my?email=...
    res_my = api_client.get(f"/api/registrations/my?email={reg_payload['email']}")
    assert res_my.status_code == 200
    my_passes = res_my.json()
    assert len(my_passes) >= 1 and my_passes[0]["ticket_code"] == reg_data["ticket_code"]

    # 7. PATCH /api/registrations/:id/attendance
    res_att = api_client.patch(
        f"/api/registrations/{reg_data['id']}/attendance",
        json={"status": "checked_in"},
    )
    assert res_att.status_code == 200
    att_data = res_att.json()
    assert att_data["status"] == "checked_in"

    # 8. POST /api/attendance/verify
    res_verify = api_client.post(
        "/api/attendance/verify",
        json={"ticket_code": reg_data["ticket_code"]},
    )
    assert res_verify.status_code == 200
    verify_data = res_verify.json()
    assert verify_data["verified"] is True
    assert verify_data["registration"]["ticket_code"] == reg_data["ticket_code"]

    # 9. GET /api/events/:id/registrations/export (CSV)
    res_csv = api_client.get(f"/api/events/{created_event['id']}/registrations/export")
    assert res_csv.status_code == 200
    csv_text = res_csv.text
    assert "Ticket Code" in csv_text and reg_data["ticket_code"] in csv_text

    # 10. GET /api/stats/overview
    res_stats = api_client.get("/api/stats/overview")
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert stats["total_events"] >= 6
    assert stats["total_registrations"] >= 9
