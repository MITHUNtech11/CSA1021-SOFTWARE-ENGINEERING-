import os
import sys
import json
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request, Response, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List

# Ensure current backend directory is in python path
sys.path.append(os.path.dirname(__file__))

from database import get_db, init_db
from schemas import (
    UserOut, FacilityOut, BookingCreate, BookingOut,
    TicketCreate, TicketUpdateState, TicketOut,
    SensorEventCreate, SensorEventOut,
    ApprovalDecision, ApprovalOut,
    AuditEventOut, DevOpsIntentOut
)
from services import (
    DomainConflictException, DomainValidationException, DomainForbiddenException,
    create_booking, update_ticket_state, process_sensor_event,
    process_approval, calculate_triage_priority, log_audit_event
)

app = FastAPI(
    title="Smart Campus Facility Booking & Maintenance Platform API",
    description="Full-stack containerized campus operations backend supporting facility bookings, "
                "sensor alert intake, explainable triage, optimistic concurrency, and audit traceability.",
    version="1.0.0"
)

# CORS Middleware allows easy local frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instance identification for multi-replica verification (Task 6)
INSTANCE_ID = os.getenv("INSTANCE_ID", f"backend-worker-{os.getpid()}")

@app.on_event("startup")
def startup_event():
    init_db()

# --- EXCEPTION HANDLERS ---
@app.exception_handler(DomainConflictException)
async def domain_conflict_handler(request: Request, exc: DomainConflictException):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"error": "Conflict", "message": exc.message, "details": exc.details, "instance_id": INSTANCE_ID}
    )

@app.exception_handler(DomainValidationException)
async def domain_validation_handler(request: Request, exc: DomainValidationException):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "Unprocessable Entity", "message": exc.message, "instance_id": INSTANCE_ID}
    )

@app.exception_handler(DomainForbiddenException)
async def domain_forbidden_handler(request: Request, exc: DomainForbiddenException):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"error": "Forbidden", "message": exc.message, "instance_id": INSTANCE_ID}
    )

# --- SYSTEM & HEALTH ENDPOINTS ---
@app.get("/api/health")
def health_check():
    """Healthcheck endpoint for Docker Compose and Load Balancer health probes."""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1;")
            db_ok = cursor.fetchone()[0] == 1
    except Exception as e:
        db_ok = False
        
    return {
        "status": "healthy" if db_ok else "unhealthy",
        "database_connected": db_ok,
        "instance_id": INSTANCE_ID,
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    """Aggregated stats for the operations dashboard."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM bookings WHERE status IN ('requested', 'approved', 'confirmed', 'in_use');")
        active_bookings = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tickets WHERE status NOT IN ('closed', 'cancelled');")
        open_tickets = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tickets WHERE priority = 'critical' AND status NOT IN ('closed', 'cancelled');")
        critical_tickets = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM sensor_events WHERE processed = 1;")
        sensor_alerts = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM approvals WHERE decision = 'pending';")
        pending_approvals = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM audit_events;")
        total_audit_events = cursor.fetchone()[0]
        
        return {
            "active_bookings": active_bookings,
            "open_tickets": open_tickets,
            "critical_tickets": critical_tickets,
            "sensor_alerts": sensor_alerts,
            "pending_approvals": pending_approvals,
            "total_audit_events": total_audit_events,
            "serving_instance": INSTANCE_ID
        }

# --- USER ENDPOINTS ---
@app.get("/api/users", response_model=List[UserOut])
def list_users():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users ORDER BY id ASC;")
        return [dict(row) for row in cursor.fetchall()]

# --- FACILITY ENDPOINTS ---
@app.get("/api/facilities", response_model=List[FacilityOut])
def list_facilities(type: Optional[str] = None, restricted: Optional[int] = None):
    query = "SELECT * FROM facilities WHERE 1=1"
    params = []
    if type:
        query += " AND type = ?"
        params.append(type)
    if restricted is not None:
        query += " AND is_restricted = ?"
        params.append(restricted)
    query += " ORDER BY id ASC;"
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]

@app.get("/api/facilities/{facility_id}", response_model=FacilityOut)
def get_facility(facility_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM facilities WHERE id = ?;", (facility_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Facility not found")
        return dict(row)

# --- BOOKING ENDPOINTS ---
@app.get("/api/bookings", response_model=List[BookingOut])
def list_bookings(facility_id: Optional[int] = None):
    query = """
    SELECT b.*, f.name as facility_name, u.name as user_name
    FROM bookings b
    JOIN facilities f ON b.facility_id = f.id
    JOIN users u ON b.user_id = u.id
    WHERE 1=1
    """
    params = []
    if facility_id:
        query += " AND b.facility_id = ?"
        params.append(facility_id)
    query += " ORDER BY b.start_time ASC;"
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]

@app.post("/api/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def make_booking(booking: BookingCreate, x_user_role: Optional[str] = Header("student")):
    """
    Reserves a facility slot. Performs server-side non-overlap check and idempotency deduplication.
    """
    performed_by = f"User-{booking.user_id} ({x_user_role})"
    created = create_booking(
        facility_id=booking.facility_id,
        user_id=booking.user_id,
        start_time=booking.start_time,
        end_time=booking.end_time,
        purpose=booking.purpose,
        request_key=booking.request_key,
        performed_by=performed_by
    )
    return created

# --- TICKET ENDPOINTS ---
@app.get("/api/tickets", response_model=List[TicketOut])
def list_tickets(status: Optional[str] = None, priority: Optional[str] = None):
    query = """
    SELECT t.*, f.name as facility_name, u.name as assigned_technician_name
    FROM tickets t
    JOIN facilities f ON t.facility_id = f.id
    LEFT JOIN users u ON t.assigned_technician_id = u.id
    WHERE 1=1
    """
    params = []
    if status:
        query += " AND t.status = ?"
        params.append(status)
    if priority:
        query += " AND t.priority = ?"
        params.append(priority)
    query += " ORDER BY t.id DESC;"
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]

@app.post("/api/tickets", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_manual_ticket(ticket: TicketCreate, x_user_role: Optional[str] = Header("faculty")):
    now_str = datetime.now().isoformat()
    priority, justification = calculate_triage_priority(ticket.urgency, ticket.teaching_impact)
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM tickets;")
        next_code = f"TKT-{1000 + cursor.fetchone()['cnt'] + 1}"
        
        cursor.execute("""
        INSERT INTO tickets (ticket_code, facility_id, source_alert_id, title, description, category,
                            urgency, teaching_impact, priority, priority_justification, status,
                            version, created_at, updated_at)
        VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, 'intake', 1, ?, ?);
        """, (next_code, ticket.facility_id, ticket.title, ticket.description, ticket.category,
              ticket.urgency, ticket.teaching_impact, priority, justification, now_str, now_str))
        ticket_id = cursor.lastrowid
        
        log_audit_event(
            conn, "ticket", ticket_id, "TICKET_MANUAL_CREATED", f"User-{ticket.created_by_user_id or 1} ({x_user_role})",
            {"ticket_code": next_code, "priority": priority, "category": ticket.category}
        )
        
        cursor.execute("""
        SELECT t.*, f.name as facility_name, NULL as assigned_technician_name
        FROM tickets t
        JOIN facilities f ON t.facility_id = f.id
        WHERE t.id = ?;
        """, (ticket_id,))
        return dict(cursor.fetchone())

@app.patch("/api/tickets/{ticket_id}/state", response_model=TicketOut)
def patch_ticket_state(ticket_id: int, payload: TicketUpdateState):
    """
    State-machine mutation endpoint enforcing valid transitions, notes requirements,
    and optimistic locking version checks.
    """
    updated = update_ticket_state(
        ticket_id=ticket_id,
        target_status=payload.target_status,
        expected_version=payload.expected_version,
        performed_by=payload.performed_by,
        assigned_technician_id=payload.assigned_technician_id,
        inspection_notes=payload.inspection_notes,
        resolution_notes=payload.resolution_notes
    )
    return updated

# --- SENSOR INTAKE & DEDUPLICATION ENDPOINTS ---
@app.post("/api/sensor-events", response_model=SensorEventOut, status_code=status.HTTP_200_OK)
def ingest_sensor_event(event: SensorEventCreate):
    """
    Telemetry intake endpoint. Deduplicates by (source, event_id). Automatically
    evaluates thresholds and creates prioritized tickets on breach.
    """
    result = process_sensor_event(
        source=event.source,
        event_id=event.event_id,
        metric=event.metric,
        value=event.value,
        threshold=event.threshold,
        observed_at=event.observed_at
    )
    return result

@app.get("/api/sensor-events", response_model=List[SensorEventOut])
def list_sensor_events():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sensor_events ORDER BY id DESC LIMIT 50;")
        return [dict(row) for row in cursor.fetchall()]

# --- APPROVAL ENDPOINTS ---
@app.get("/api/approvals", response_model=List[ApprovalOut])
def list_approvals(decision: Optional[str] = None):
    query = """
    SELECT a.*, u.name as approver_name
    FROM approvals a
    LEFT JOIN users u ON a.approver_id = u.id
    WHERE 1=1
    """
    params = []
    if decision:
        query += " AND a.decision = ?"
        params.append(decision)
    query += " ORDER BY a.id DESC;"
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]

@app.post("/api/approvals/{approval_id}/decide", response_model=ApprovalOut)
def decide_approval(approval_id: int, decision: ApprovalDecision, x_user_role: Optional[str] = Header("approver")):
    """
    Approves or rejects restricted operations. Server enforces role permissions.
    """
    result = process_approval(
        approval_id=approval_id,
        approver_id=decision.approver_id,
        decision=decision.decision,
        reason=decision.reason,
        performed_by_role=x_user_role
    )
    return result

# --- AUDIT & DEVOPS ENDPOINTS ---
@app.get("/api/audit", response_model=List[AuditEventOut])
def list_audit_events(limit: int = 100):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM audit_events ORDER BY id DESC LIMIT ?;", (limit,))
        return [dict(row) for row in cursor.fetchall()]

@app.get("/api/devops/intents", response_model=List[DevOpsIntentOut])
def list_devops_intents():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM integration_intents ORDER BY id DESC;")
        return [dict(row) for row in cursor.fetchall()]

@app.post("/api/devops/intents/{intent_id}/retry", response_model=DevOpsIntentOut)
def retry_devops_intent(intent_id: int):
    """Simulates idempotent external integration retry."""
    now_str = datetime.now().isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM integration_intents WHERE id = ?;", (intent_id,))
        intent = cursor.fetchone()
        if not intent:
            raise HTTPException(status_code=404, detail="Integration intent not found")
            
        cursor.execute("""
        UPDATE integration_intents
        SET status = 'synced', attempts = attempts + 1, last_error = NULL, updated_at = ?
        WHERE id = ?;
        """, (now_str, intent_id))
        
        log_audit_event(
            conn, "devops", intent_id, "INTEGRATION_RETRY_SYNCED", "SYSTEM_DEVOPS_WORKER",
            {"correlation_key": intent["correlation_key"], "service": intent["service_name"]}
        )
        
        cursor.execute("SELECT * FROM integration_intents WHERE id = ?;", (intent_id,))
        return dict(cursor.fetchone())

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
