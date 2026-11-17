import pytest
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_announcements_crud_and_priority():
    # 1. Fetch existing
    res = client.get("/api/announcements")
    assert res.status_code == 200
    initial_list = res.json()
    assert isinstance(initial_list, list)

    # 2. Create announcement
    payload = {
        "title": "TDD Urgent Alert",
        "message": "Testing urgent priority sorting",
        "priority": "urgent",
        "published_by": "Test Suite Coordinator"
    }
    create_res = client.post("/api/announcements", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    anc_id = created_data["id"]
    assert anc_id.startswith("anc-")

    # 3. Check priority ordering (urgent must appear first)
    list_res = client.get("/api/announcements")
    assert list_res.status_code == 200
    sorted_ancs = list_res.json()
    assert sorted_ancs[0]["priority"] == "urgent"

    # 4. Delete announcement
    del_res = client.delete(f"/api/announcements/{anc_id}")
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "Announcement deleted successfully"

    # 5. Delete non-existent
    del_404 = client.delete(f"/api/announcements/{anc_id}")
    assert del_404.status_code == 404

def test_stats_overview():
    res = client.get("/api/stats/overview")
    assert res.status_code == 200
    data = res.json()
    assert "total_events" in data
    assert "active_events" in data
    assert "total_capacity" in data
    assert "total_registrations" in data
    assert "attendance_rate" in data
    assert data["total_events"] >= 5

def test_stats_department_breakdown():
    res = client.get("/api/stats/department-breakdown")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "department" in data[0]
    assert "count" in data[0]

def test_stats_category_breakdown():
    res = client.get("/api/stats/category-breakdown")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "category" in data[0]
    assert "event_count" in data[0]

def test_stats_activity_log():
    res = client.get("/api/stats/activity-log")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "type" in data[0]
    assert "timestamp" in data[0]
