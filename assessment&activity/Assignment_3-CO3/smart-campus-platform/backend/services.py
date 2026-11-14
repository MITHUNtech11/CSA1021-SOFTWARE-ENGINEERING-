import json
from datetime import datetime
from database import get_db

class DomainConflictException(Exception):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}

class DomainValidationException(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

class DomainForbiddenException(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

# --- 1. EXPLAINABLE TRIAGE SERVICE ---
def calculate_triage_priority(urgency: str, teaching_impact: str) -> tuple[str, str]:
    """
    Deterministic rule-based triage matrix for facility maintenance.
    Returns (priority, priority_justification).
    """
    urgency = urgency.lower()
    teaching_impact = teaching_impact.lower()
    
    if urgency == "high" and teaching_impact == "high":
        priority = "critical"
        justification = (
            "Deterministic Rule: High Urgency (Severe equipment risk/environmental breach) combined with "
            "High Teaching Impact (Active student laboratory or examination venue) mandates CRITICAL priority "
            "(1-hour response SLA, 4-hour resolution target)."
        )
    elif (urgency == "high" and teaching_impact == "medium") or (urgency == "medium" and teaching_impact == "high"):
        priority = "high"
        justification = (
            f"Deterministic Rule: Elevated operational friction ({urgency.capitalize()} Urgency, "
            f"{teaching_impact.capitalize()} Impact) establishes HIGH priority (2-hour response, 8-hour resolution)."
        )
    elif (urgency == "medium" and teaching_impact == "medium") or (urgency == "high" and teaching_impact == "low") or (urgency == "low" and teaching_impact == "high"):
        priority = "medium"
        justification = (
            f"Deterministic Rule: Balanced operational constraint ({urgency.capitalize()} Urgency, "
            f"{teaching_impact.capitalize()} Impact) sets MEDIUM priority (4-hour response, 24-hour resolution)."
        )
    else:
        priority = "low"
        justification = (
            "Deterministic Rule: Low Urgency and Low Teaching Impact allows routine maintenance scheduling "
            "under LOW priority (8-hour response, 72-hour resolution target)."
        )
        
    return priority, justification

# --- 2. AUDIT LOGGING HELPER ---
def log_audit_event(conn, entity_type: str, entity_id: int, action: str, performed_by: str, details: dict):
    now_str = datetime.now().isoformat()
    conn.execute("""
    INSERT INTO audit_events (entity_type, entity_id, action, performed_by, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?);
    """, (entity_type, entity_id, action, performed_by, json.dumps(details), now_str))

# --- 3. BOOKING SERVICE (With Overlap Prevention & Idempotency) ---
def create_booking(facility_id: int, user_id: int, start_time: str, end_time: str, purpose: str, request_key: str = None, performed_by: str = "System"):
    now_str = datetime.now().isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Idempotency check via request_key
        if request_key:
            cursor.execute("SELECT * FROM bookings WHERE request_key = ?;", (request_key,))
            existing = cursor.fetchone()
            if existing:
                return dict(existing)
        
        # Check facility existence and restricted status
        cursor.execute("SELECT * FROM facilities WHERE id = ?;", (facility_id,))
        facility = cursor.fetchone()
        if not facility:
            raise DomainValidationException(f"Facility with ID {facility_id} does not exist.")
            
        if facility["status"] == "maintenance":
            raise DomainConflictException(
                f"Facility '{facility['name']}' is currently under active maintenance and cannot accept bookings.",
                {"facility_id": facility_id, "status": "maintenance"}
            )
            
        # Overlap Prevention Query (Checks active conflicting reservations)
        cursor.execute("""
        SELECT b.*, u.name as booked_by_user
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.facility_id = ?
          AND b.status IN ('requested', 'approved', 'confirmed', 'in_use')
          AND (b.start_time < ? AND b.end_time > ?);
        """, (facility_id, end_time, start_time))
        
        conflicts = cursor.fetchall()
        if conflicts:
            conflict = conflicts[0]
            raise DomainConflictException(
                f"Booking conflict detected: Facility '{facility['name']}' is already reserved by "
                f"{conflict['booked_by_user']} from {conflict['start_time']} to {conflict['end_time']}.",
                {
                    "conflict_booking_id": conflict["id"],
                    "conflicting_slot": f"{conflict['start_time']} - {conflict['end_time']}",
                    "booked_by": conflict["booked_by_user"]
                }
            )
            
        # Determine status: restricted facilities require approval first
        is_restricted = facility["is_restricted"] == 1
        initial_status = "requested" if is_restricted else "confirmed"
        
        cursor.execute("""
        INSERT INTO bookings (facility_id, user_id, start_time, end_time, purpose, status, request_key, version, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?);
        """, (facility_id, user_id, start_time, end_time, purpose, initial_status, request_key, now_str))
        booking_id = cursor.lastrowid
        
        # If restricted, create a pending approval record
        if is_restricted:
            cursor.execute("""
            INSERT INTO approvals (target_type, target_id, approver_id, decision, reason, decided_at)
            VALUES ('booking', ?, NULL, 'pending', 'Awaiting Dean or Department Approver sign-off for restricted lab access.', NULL);
            """, (booking_id,))
            
        log_audit_event(
            conn, "booking", booking_id, 
            "BOOKING_REQUESTED" if is_restricted else "BOOKING_CONFIRMED",
            performed_by,
            {"facility_id": facility_id, "start": start_time, "end": end_time, "restricted": is_restricted}
        )
        
        cursor.execute("""
        SELECT b.*, f.name as facility_name, u.name as user_name
        FROM bookings b
        JOIN facilities f ON b.facility_id = f.id
        JOIN users u ON b.user_id = u.id
        WHERE b.id = ?;
        """, (booking_id,))
        return dict(cursor.fetchone())

# --- 4. TICKET LIFECYCLE SERVICE (With State Machine & Optimistic Locking) ---
VALID_TRANSITIONS = {
    "intake": ["assigned", "cancelled"],
    "assigned": ["inspection", "in_progress", "cancelled"],
    "inspection": ["in_progress", "cancelled"],
    "in_progress": ["resolved", "cancelled"],
    "resolved": ["closed", "in_progress"],  # Reopen if verification fails
    "closed": [],  # Terminal state
    "cancelled": []
}

def update_ticket_state(ticket_id: int, target_status: str, expected_version: int, performed_by: str,
                        assigned_technician_id: int = None, inspection_notes: str = None, resolution_notes: str = None):
    now_str = datetime.now().isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Fetch current ticket
        cursor.execute("SELECT * FROM tickets WHERE id = ?;", (ticket_id,))
        ticket = cursor.fetchone()
        if not ticket:
            raise DomainValidationException(f"Ticket with ID {ticket_id} not found.")
            
        current_status = ticket["status"]
        current_version = ticket["version"]
        
        # 1. Optimistic Locking Version Check (Catches concurrent modifications immediately)
        if expected_version != current_version:
            raise DomainConflictException(
                f"Optimistic Concurrency Conflict: Ticket {ticket['ticket_code']} was modified by another user "
                f"(current server version: {current_version}, your expected version: {expected_version}). "
                "Update aborted to prevent lost updates. Please refresh and retry.",
                {"ticket_id": ticket_id, "current_version": current_version, "expected_version": expected_version}
            )

        # 2. State Machine Validity Check
        if target_status not in VALID_TRANSITIONS.get(current_status, []):
            raise DomainValidationException(
                f"Invalid state transition: Cannot transition ticket {ticket['ticket_code']} from '{current_status}' to '{target_status}'. "
                f"Allowed target states from '{current_status}': {VALID_TRANSITIONS.get(current_status, [])}."
            )
            
        # 2. Transition-specific requirements
        if target_status == "assigned" and not (assigned_technician_id or ticket["assigned_technician_id"]):
            raise DomainValidationException("Assigning a ticket requires selecting an assigned technician.")
            
        if target_status == "resolved" and not (resolution_notes or ticket["resolution_notes"]):
            raise DomainValidationException("Resolving a ticket requires providing complete technical resolution notes.")
            
        # 3. Optimistic Locking Version Check
        tech_id = assigned_technician_id or ticket["assigned_technician_id"]
        insp_notes = inspection_notes or ticket["inspection_notes"]
        res_notes = resolution_notes or ticket["resolution_notes"]
        
        cursor.execute("""
        UPDATE tickets
        SET status = ?,
            assigned_technician_id = ?,
            inspection_notes = ?,
            resolution_notes = ?,
            version = version + 1,
            updated_at = ?
        WHERE id = ? AND version = ?;
        """, (target_status, tech_id, insp_notes, res_notes, now_str, ticket_id, expected_version))
        
        if cursor.rowcount == 0:
            raise DomainConflictException(
                f"Optimistic Concurrency Conflict: Ticket {ticket['ticket_code']} was modified by another user "
                f"(current server version: {current_version}, your expected version: {expected_version}). "
                "Update aborted to prevent lost updates. Please refresh and retry.",
                {"ticket_id": ticket_id, "current_version": current_version, "expected_version": expected_version}
            )
            
        log_audit_event(
            conn, "ticket", ticket_id, "STATUS_TRANSITION", performed_by,
            {"from": current_status, "to": target_status, "version": current_version + 1, "notes": resolution_notes or inspection_notes}
        )
        
        cursor.execute("""
        SELECT t.*, f.name as facility_name, u.name as assigned_technician_name
        FROM tickets t
        JOIN facilities f ON t.facility_id = f.id
        LEFT JOIN users u ON t.assigned_technician_id = u.id
        WHERE t.id = ?;
        """, (ticket_id,))
        return dict(cursor.fetchone())

# --- 5. SENSOR INTAKE & DEDUPLICATION SERVICE ---
def process_sensor_event(source: str, event_id: str, metric: str, value: float, threshold: float, observed_at: str = None):
    now_str = observed_at or datetime.now().isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. First check if it already exists
        cursor.execute("SELECT * FROM sensor_events WHERE source = ? AND event_id = ?;", (source, event_id))
        existing = cursor.fetchone()
        if existing:
            event_dict = dict(existing)
            event_dict["is_duplicate"] = True
            return event_dict
            
        breach = value > threshold
        created_ticket_id = None
        
        # 2. Attempt insert with concurrency collision safety
        try:
            cursor.execute("""
            INSERT INTO sensor_events (source, event_id, metric, value, threshold, observed_at, processed, created_ticket_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, NULL);
            """, (source, event_id, metric, value, threshold, now_str, 1 if breach else 0))
            event_db_id = cursor.lastrowid
        except Exception as e:
            # Caught concurrent collision on UNIQUE(source, event_id)
            cursor.execute("SELECT * FROM sensor_events WHERE source = ? AND event_id = ?;", (source, event_id))
            collision_row = cursor.fetchone()
            if collision_row:
                event_dict = dict(collision_row)
                event_dict["is_duplicate"] = True
                return event_dict
            raise
        
        if breach:
            # Map source to facility (e.g. "HVAC-LAB-301" -> Lab 301)
            facility_id = 1  # Default to primary robotics lab for simulation
            category = "HVAC" if "HVAC" in source or "temperature" in metric else "Electrical"
            urgency = "high" if value > (threshold * 1.15) else "medium"
            teaching_impact = "high"
            
            priority, justification = calculate_triage_priority(urgency, teaching_impact)
            
            # Generate next ticket code
            cursor.execute("SELECT COUNT(*) as cnt FROM tickets;")
            next_num = 1000 + cursor.fetchone()["cnt"] + 1
            ticket_code = f"TKT-{next_num}"
            
            title = f"Automated Alert: {metric.replace('_', ' ').title()} breach on {source}"
            description = (
                f"Telemetry event {event_id} from {source} exceeded threshold: Measured {value} (Safety Threshold: {threshold}). "
                "Automated triage triggered and dispatched to facility queue."
            )
            
            cursor.execute("""
            INSERT INTO tickets (ticket_code, facility_id, source_alert_id, title, description, category,
                                urgency, teaching_impact, priority, priority_justification, status,
                                version, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'intake', 1, ?, ?);
            """, (ticket_code, facility_id, event_db_id, title, description, category, urgency, teaching_impact, priority, justification, now_str, now_str))
            created_ticket_id = cursor.lastrowid
            
            # Update sensor event with created ticket ID
            cursor.execute("UPDATE sensor_events SET created_ticket_id = ? WHERE id = ?;", (created_ticket_id, event_db_id))
            
            log_audit_event(
                conn, "sensor", event_db_id, "SENSOR_BREACH_TICKET_CREATED", source,
                {"metric": metric, "value": value, "threshold": threshold, "ticket_id": created_ticket_id, "priority": priority}
            )
            
            # Register integration intent for DevOps external issue tracker
            cursor.execute("""
            INSERT INTO integration_intents (correlation_key, service_name, payload, status, attempts, last_error, updated_at)
            VALUES (?, 'GitHub_Issues', ?, 'pending', 0, NULL, ?);
            """, (f"DEVOPS-{ticket_code}", json.dumps({"title": f"DevOps Incident {ticket_code}: {title}", "source": source, "value": value}), now_str))
            
        cursor.execute("SELECT * FROM sensor_events WHERE id = ?;", (event_db_id,))
        event_dict = dict(cursor.fetchone())
        event_dict["is_duplicate"] = False
        return event_dict

# --- 6. APPROVAL WORKFLOW SERVICE ---
def process_approval(approval_id: int, approver_id: int, decision: str, reason: str, performed_by_role: str):
    if performed_by_role not in ["approver", "admin", "facility_manager"]:
        raise DomainForbiddenException(
            f"Unauthorized: Role '{performed_by_role}' is not authorized to approve requests. Requires 'approver' or 'admin' role."
        )
        
    now_str = datetime.now().isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM approvals WHERE id = ?;", (approval_id,))
        approval = cursor.fetchone()
        if not approval:
            raise DomainValidationException(f"Approval record {approval_id} not found.")
            
        cursor.execute("""
        UPDATE approvals
        SET approver_id = ?, decision = ?, reason = ?, decided_at = ?
        WHERE id = ?;
        """, (approver_id, decision, reason, now_str, approval_id))
        
        # If target was a booking, update booking status accordingly
        if approval["target_type"] == "booking":
            new_booking_status = "confirmed" if decision == "approved" else "cancelled"
            cursor.execute("UPDATE bookings SET status = ? WHERE id = ?;", (new_booking_status, approval["target_id"]))
            
        log_audit_event(
            conn, "approval", approval_id, f"APPROVAL_{decision.upper()}", f"User-{approver_id}",
            {"decision": decision, "reason": reason, "target_type": approval["target_type"], "target_id": approval["target_id"]}
        )
        
        cursor.execute("""
        SELECT a.*, u.name as approver_name
        FROM approvals a
        LEFT JOIN users u ON a.approver_id = u.id
        WHERE a.id = ?;
        """, (approval_id,))
        return dict(cursor.fetchone())
