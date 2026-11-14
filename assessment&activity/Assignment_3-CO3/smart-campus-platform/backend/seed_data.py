import json
from datetime import datetime, timedelta
from database import get_db, init_db

def seed_database(db_path=None):
    init_db(db_path)
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        
        # Check if already seeded
        cursor.execute("SELECT COUNT(*) as count FROM users;")
        if cursor.fetchone()["count"] > 0:
            print("Database already contains data. Skipping initial seeding.")
            return

        now = datetime.now()
        now_str = now.isoformat()

        # 1. Seed Users
        users = [
            ("Dr. Aris Thorne", "aris.thorne@campus.edu", "faculty", "Computer Science & Engineering", now_str),
            ("Prof. Clara Oswald", "clara.oswald@campus.edu", "faculty", "Electrical & Electronics", now_str),
            ("Mithun Senthil", "mithun.senthil@campus.edu", "student", "Computer Science (192324056)", now_str),
            ("Dave Miller", "dave.miller@campus.edu", "technician", "Facilities Maintenance", now_str),
            ("Elena Rostova", "elena.rostova@campus.edu", "technician", "HVAC & Mechanical", now_str),
            ("Dean Sarah Jenkins", "sarah.jenkins@campus.edu", "approver", "Academic Affairs & Approvals", now_str),
            ("Marcus Vance", "marcus.vance@campus.edu", "facility_manager", "Campus Operations", now_str),
            ("System Admin", "admin@campus.edu", "admin", "IT Infrastructure", now_str)
        ]
        cursor.executemany("""
        INSERT INTO users (name, email, role, department, created_at)
        VALUES (?, ?, ?, ?, ?);
        """, users)

        # 2. Seed Facilities
        facilities = [
            ("Advanced Robotics & AI Lab 301", "Science Block", "301", "laboratory", 35, 1, "available"),
            ("High-Throughput IoT Testing Lab 204", "Tech Wing", "204", "laboratory", 40, 1, "available"),
            ("Turing Grand Lecture Hall 101", "Main Block", "101", "lecture_hall", 180, 0, "available"),
            ("Von Neumann Seminar Room B", "Research Block", "B-12", "seminar_room", 60, 0, "available"),
            ("Microcontroller Systems Lab 102", "Science Block", "102", "laboratory", 30, 0, "available"),
            ("Quantum Computing Simulation Center", "Innovation Complex", "501", "laboratory", 25, 1, "maintenance")
        ]
        cursor.executemany("""
        INSERT INTO facilities (name, building, room_number, type, capacity, is_restricted, status)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """, facilities)

        # 3. Seed SLA Policies
        sla_policies = [
            ("critical", 1, 4, "Campus Director & Facilities Lead"),
            ("high", 2, 8, "Senior Facility Engineer"),
            ("medium", 4, 24, "Maintenance Dispatch Lead"),
            ("low", 8, 72, "Standard Technician Queue")
        ]
        cursor.executemany("""
        INSERT INTO sla_policies (priority, response_target_hours, resolution_target_hours, escalation_level)
        VALUES (?, ?, ?, ?);
        """, sla_policies)

        # 4. Seed Bookings
        t_tomorrow = (now + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        t_tomorrow_end = t_tomorrow + timedelta(hours=2)
        
        t_day_after = (now + timedelta(days=2)).replace(hour=14, minute=0, second=0, microsecond=0)
        t_day_after_end = t_day_after + timedelta(hours=3)

        bookings = [
            (1, 1, t_tomorrow.isoformat(), t_tomorrow_end.isoformat(), "Autonomous Navigation Project Demo", "confirmed", "REQ-SEED-001", 1, now_str),
            (3, 2, t_day_after.isoformat(), t_day_after_end.isoformat(), "Guest Lecture on Distributed Cloud Systems", "confirmed", "REQ-SEED-002", 1, now_str),
            (2, 3, (now + timedelta(days=3)).replace(hour=9, minute=0).isoformat(), (now + timedelta(days=3)).replace(hour=11, minute=0).isoformat(), "Capstone IoT Prototype Testing", "requested", "REQ-SEED-003", 1, now_str)
        ]
        cursor.executemany("""
        INSERT INTO bookings (facility_id, user_id, start_time, end_time, purpose, status, request_key, version, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, bookings)

        # 5. Seed Sensor Event (initially without ticket reference)
        cursor.execute("""
        INSERT INTO sensor_events (source, event_id, metric, value, threshold, observed_at, processed, created_ticket_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, ("HVAC-LAB-301", "EVT-SEED-901", "temperature_c", 33.4, 28.0, (now - timedelta(hours=3)).isoformat(), 1, None))
        sensor_event_id = cursor.lastrowid

        # 6. Seed Tickets (with explainable triage justification & optimistic locking version)
        tickets = [
            ("TKT-1001", 1, sensor_event_id, "Critical Ambient Overheating in Robotics Server Enclosure", 
             "Acoustic and temperature sensors detected HVAC cooling failure. Temperature measured 33.4°C against 28.0°C safety ceiling.",
             "HVAC", "high", "high", "critical", 
             "Deterministic Triage: High Urgency (temperature breach) x High Teaching Impact (active robotics server) => Critical SLA (4h resolution).",
             "in_progress", 5, "Refrigerant line pressure nominal; inspecting thermal expansion valve solenoid.", None, 1, 
             (now - timedelta(hours=3)).isoformat(), (now - timedelta(hours=1)).isoformat()),
             
            ("TKT-1002", 3, None, "Main Projector HDMI Matrix Audio Desynchronization",
             "Lecture Hall 101 ceiling projector cuts audio feed intermittently during multi-source presentations.",
             "IT_Network", "medium", "medium", "medium",
             "Deterministic Triage: Medium Urgency x Medium Impact => Medium Priority (24h resolution target).",
             "assigned", 4, None, None, 1,
             (now - timedelta(days=1)).isoformat(), (now - timedelta(days=1)).isoformat())
        ]
        cursor.executemany("""
        INSERT INTO tickets (ticket_code, facility_id, source_alert_id, title, description, category, urgency, 
                            teaching_impact, priority, priority_justification, status, assigned_technician_id, 
                            inspection_notes, resolution_notes, version, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, tickets)

        # Update sensor event with created ticket ID
        cursor.execute("UPDATE sensor_events SET created_ticket_id = 1 WHERE id = ?;", (sensor_event_id,))

        # 7. Seed Initial Approvals
        cursor.execute("""
        INSERT INTO approvals (target_type, target_id, approver_id, decision, reason, decided_at)
        VALUES (?, ?, ?, ?, ?, ?);
        """, ("booking", 3, 6, "pending", "Awaiting Dean confirmation for after-hours restricted laboratory access.", None))

        # 8. Seed Audit Events
        audit_records = [
            ("facility", 1, "SEED_INITIALIZE", "SYSTEM", json.dumps({"facility": "Robotics Lab 301", "status": "available"}), now_str),
            ("booking", 1, "BOOKING_CONFIRMED", "Dr. Aris Thorne", json.dumps({"slot": t_tomorrow.isoformat(), "purpose": "Autonomous Demo"}), now_str),
            ("sensor", 1, "THRESHOLD_BREACH", "HVAC-LAB-301", json.dumps({"metric": "temperature_c", "value": 33.4, "threshold": 28.0}), (now - timedelta(hours=3)).isoformat()),
            ("ticket", 1, "TICKET_CREATED_AUTO", "SYSTEM_TRIAGE", json.dumps({"ticket": "TKT-1001", "priority": "critical"}), (now - timedelta(hours=3)).isoformat()),
            ("ticket", 1, "STATUS_UPDATE", "Elena Rostova", json.dumps({"from": "intake", "to": "in_progress", "technician": "Elena Rostova"}), (now - timedelta(hours=1)).isoformat())
        ]
        cursor.executemany("""
        INSERT INTO audit_events (entity_type, entity_id, action, performed_by, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?);
        """, audit_records)

        # 9. Seed Integration Intent (Outbox for DevOps integration with GitHub/Jira)
        cursor.execute("""
        INSERT INTO integration_intents (correlation_key, service_name, payload, status, attempts, last_error, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """, ("DEVOPS-TKT-1001", "GitHub_Issues", json.dumps({"issue_title": "CAMP-318: HVAC Thermal Sensor Tripped in Robotics Lab 301", "ticket_ref": "TKT-1001"}), "synced", 1, None, now_str))

    print(f"Database successfully seeded with realistic campus operations data at: {db_path or 'default'}")

if __name__ == "__main__":
    seed_database()
