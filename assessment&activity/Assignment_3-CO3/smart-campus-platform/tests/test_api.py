import os
import sys
import unittest
import json
from datetime import datetime, timedelta

# Add backend directory to sys.path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, BACKEND_DIR)

# Set test database path before importing app
TEST_DB_PATH = os.path.join(os.path.dirname(__file__), "test_campus.db")
os.environ["DATABASE_PATH"] = TEST_DB_PATH

from fastapi.testclient import TestClient
from main import app
from database import init_db
from seed_data import seed_database

class TestSmartCampusPlatform(unittest.TestCase):
    @classmethod
    def clean_db_files(cls):
        base = os.path.join(os.path.dirname(__file__), "test_campus.db")
        for f in [base, f"{base}-wal", f"{base}-shm"]:
            if os.path.exists(f):
                try:
                    os.remove(f)
                except Exception:
                    pass

    @classmethod
    def setUpClass(cls):
        # Create an isolated test database
        cls.test_db = os.path.join(os.path.dirname(__file__), "test_campus.db")
        os.environ["DATABASE_PATH"] = cls.test_db
        cls.clean_db_files()
        seed_database(cls.test_db)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        cls.clean_db_files()

    # 1. Health & Dashboard Tests
    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["database_connected"])

    def test_02_dashboard_stats(self):
        res = self.client.get("/api/dashboard/stats")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["active_bookings"], 1)
        self.assertGreaterEqual(data["open_tickets"], 1)

    # 2. Facility Catalogue Tests
    def test_03_list_facilities(self):
        res = self.client.get("/api/facilities")
        self.assertEqual(res.status_code, 200)
        facilities = res.json()
        self.assertGreaterEqual(len(facilities), 5)
        # Verify restricted lab flag
        robotics_lab = next(f for f in facilities if f["id"] == 1)
        self.assertEqual(robotics_lab["is_restricted"], 1)

    # 3. Booking Overlap Prevention Tests (Story 1 & Story 2)
    def test_04_booking_valid_creation(self):
        t_start = (datetime.now() + timedelta(days=5)).replace(hour=9, minute=0).isoformat()
        t_end = (datetime.now() + timedelta(days=5)).replace(hour=11, minute=0).isoformat()
        
        res = self.client.post("/api/bookings", json={
            "facility_id": 3, # Turing Lecture Hall (unrestricted)
            "user_id": 1,
            "start_time": t_start,
            "end_time": t_end,
            "purpose": "Advanced Software Architecture Lecture",
            "request_key": "REQ-TEST-VALID-01"
        })
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["status"], "confirmed")
        self.assertEqual(data["version"], 1)

    def test_05_booking_overlap_rejection(self):
        # Attempt to book an overlapping slot for the exact same facility and day
        t_overlap_start = (datetime.now() + timedelta(days=5)).replace(hour=10, minute=0).isoformat()
        t_overlap_end = (datetime.now() + timedelta(days=5)).replace(hour=12, minute=0).isoformat()

        res = self.client.post("/api/bookings", json={
            "facility_id": 3,
            "user_id": 2,
            "start_time": t_overlap_start,
            "end_time": t_overlap_end,
            "purpose": "Conflicting Seminar Reservation",
            "request_key": "REQ-TEST-OVERLAP-02"
        })
        self.assertEqual(res.status_code, 409)
        data = res.json()
        self.assertEqual(data["error"], "Conflict")
        self.assertIn("already reserved", data["message"])

    def test_06_booking_idempotency_replay(self):
        # Replaying identical request_key returns original booking without error
        res1 = self.client.post("/api/bookings", json={
            "facility_id": 4,
            "user_id": 1,
            "start_time": (datetime.now() + timedelta(days=6)).replace(hour=14, minute=0).isoformat(),
            "end_time": (datetime.now() + timedelta(days=6)).replace(hour=16, minute=0).isoformat(),
            "purpose": "Idempotency Test Slot",
            "request_key": "REQ-IDEMPOTENT-UNIQUE-99"
        })
        self.assertEqual(res1.status_code, 201)
        b1_id = res1.json()["id"]

        # Replay identical key
        res2 = self.client.post("/api/bookings", json={
            "facility_id": 4,
            "user_id": 1,
            "start_time": (datetime.now() + timedelta(days=6)).replace(hour=14, minute=0).isoformat(),
            "end_time": (datetime.now() + timedelta(days=6)).replace(hour=16, minute=0).isoformat(),
            "purpose": "Idempotency Test Slot",
            "request_key": "REQ-IDEMPOTENT-UNIQUE-99"
        })
        self.assertEqual(res2.status_code, 201)
        self.assertEqual(res2.json()["id"], b1_id)

    # 4. Sensor Ingestion & Deduplication Tests (Story 4)
    def test_07_sensor_alert_trigger(self):
        # Trigger sensor event with threshold breach
        res = self.client.post("/api/sensor-events", json={
            "source": "HVAC-LAB-301",
            "event_id": "EVT-TEST-BREACH-01",
            "metric": "temperature_c",
            "value": 36.5,
            "threshold": 28.0
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["is_duplicate"])
        self.assertIsNotNone(data["created_ticket_id"])

        # Verify created ticket has Critical SLA priority
        ticket_res = self.client.get(f"/api/tickets")
        tickets = ticket_res.json()
        ticket = next(t for t in tickets if t["id"] == data["created_ticket_id"])
        self.assertEqual(ticket["priority"], "critical")
        self.assertIn("Deterministic Rule", ticket["priority_justification"])

    def test_08_sensor_deduplication(self):
        # Sending identical (source, event_id) 4 more times
        for i in range(4):
            res = self.client.post("/api/sensor-events", json={
                "source": "HVAC-LAB-301",
                "event_id": "EVT-TEST-BREACH-01",
                "metric": "temperature_c",
                "value": 36.5,
                "threshold": 28.0
            })
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data["is_duplicate"])

    # 5. Ticket Lifecycle & Optimistic Locking Tests (Story 5 & 6)
    def test_09_ticket_valid_lifecycle_transitions(self):
        # Create a fresh ticket in 'intake'
        create_res = self.client.post("/api/tickets", json={
            "facility_id": 1,
            "title": "Robotics Power Converter Flicker",
            "description": "DC power rail voltage dropping below 23V under motor load.",
            "category": "Electrical",
            "urgency": "high",
            "teaching_impact": "medium"
        })
        self.assertEqual(create_res.status_code, 201)
        ticket = create_res.json()
        t_id = ticket["id"]
        self.assertEqual(ticket["status"], "intake")
        self.assertEqual(ticket["version"], 1)

        # Transition 1: intake -> assigned
        r1 = self.client.patch(f"/api/tickets/{t_id}/state", json={
            "target_status": "assigned",
            "expected_version": 1,
            "assigned_technician_id": 4,
            "performed_by": "Facility Manager"
        })
        self.assertEqual(r1.status_code, 200)
        self.assertEqual(r1.json()["status"], "assigned")
        self.assertEqual(r1.json()["version"], 2)

        # Transition 2: assigned -> in_progress
        r2 = self.client.patch(f"/api/tickets/{t_id}/state", json={
            "target_status": "in_progress",
            "expected_version": 2,
            "inspection_notes": "Capacitor bank visually intact; testing transformer secondary winding.",
            "performed_by": "Dave Miller (Technician)"
        })
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(r2.json()["status"], "in_progress")
        self.assertEqual(r2.json()["version"], 3)

        # Transition 3: in_progress -> resolved
        r3 = self.client.patch(f"/api/tickets/{t_id}/state", json={
            "target_status": "resolved",
            "expected_version": 3,
            "resolution_notes": "Tightened loose screw terminal on 24V supply and verified 24.1V under 15A load.",
            "performed_by": "Dave Miller (Technician)"
        })
        self.assertEqual(r3.status_code, 200)
        self.assertEqual(r3.json()["status"], "resolved")
        self.assertEqual(r3.json()["version"], 4)

        # Transition 4: resolved -> closed
        r4 = self.client.patch(f"/api/tickets/{t_id}/state", json={
            "target_status": "closed",
            "expected_version": 4,
            "performed_by": "Marcus Vance (Facility Manager)"
        })
        self.assertEqual(r4.status_code, 200)
        self.assertEqual(r4.json()["status"], "closed")
        self.assertEqual(r4.json()["version"], 5)

    def test_10_ticket_optimistic_locking_conflict(self):
        # Find an open ticket in 'assigned' or 'intake' status
        tickets = self.client.get("/api/tickets").json()
        open_ticket = next(t for t in tickets if t["status"] in ["intake", "assigned"])
        
        # Valid transition for intake is 'assigned', but we pass a stale expected_version
        stale_version = open_ticket["version"] - 1
        target_status = "assigned" if open_ticket["status"] == "intake" else "in_progress"
        
        res = self.client.patch(f"/api/tickets/{open_ticket['id']}/state", json={
            "target_status": target_status,
            "expected_version": stale_version,
            "assigned_technician_id": 4,
            "performed_by": "Conflicting Concurrent Worker"
        })
        self.assertEqual(res.status_code, 409)
        self.assertEqual(res.json()["error"], "Conflict")
        self.assertIn("Optimistic Concurrency Conflict", res.json()["message"])

    def test_11_ticket_invalid_state_transition(self):
        # Attempt illegal transition: closed -> in_progress directly
        # Find closed ticket
        closed_ticket = next(t for t in self.client.get("/api/tickets").json() if t["status"] == "closed")
        res = self.client.patch(f"/api/tickets/{closed_ticket['id']}/state", json={
            "target_status": "in_progress",
            "expected_version": closed_ticket["version"],
            "performed_by": "Technician"
        })
        self.assertEqual(res.status_code, 422)
        self.assertIn("Invalid state transition", res.json()["message"])

    # 6. Role-Based Approvals Tests (Story 3)
    def test_12_approval_role_enforcement(self):
        # 1. Prohibited role: student trying to approve
        res_forbidden = self.client.post("/api/approvals/1/decide", 
            headers={"x-user-role": "student"},
            json={"approver_id": 3, "decision": "approved", "reason": "Self-approval attempt"}
        )
        self.assertEqual(res_forbidden.status_code, 403)
        self.assertIn("Unauthorized: Role 'student' is not authorized", res_forbidden.json()["message"])

        # 2. Authorized role: approver
        res_ok = self.client.post("/api/approvals/1/decide", 
            headers={"x-user-role": "approver"},
            json={"approver_id": 6, "decision": "approved", "reason": "Authorized by Dean Jenkins for academic project."}
        )
        self.assertEqual(res_ok.status_code, 200)
        self.assertEqual(res_ok.json()["decision"], "approved")

    # 7. Audit Trail & DevOps Outbox
    def test_13_audit_trail_populated(self):
        res = self.client.get("/api/audit")
        self.assertEqual(res.status_code, 200)
        logs = res.json()
        self.assertGreater(len(logs), 5)
        # Ensure latest audit log reflects recent actions
        actions = [l["action"] for l in logs]
        self.assertIn("STATUS_TRANSITION", actions)

    def test_14_devops_retry_sync(self):
        res = self.client.get("/api/devops/intents")
        self.assertEqual(res.status_code, 200)
        intents = res.json()
        self.assertGreater(len(intents), 0)
        target_intent = intents[0]

        retry_res = self.client.post(f"/api/devops/intents/{target_intent['id']}/retry")
        self.assertEqual(retry_res.status_code, 200)
        self.assertEqual(retry_res.json()["status"], "synced")

if __name__ == "__main__":
    unittest.main()
