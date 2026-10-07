import csv
import io
import random
import re
import time
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, Response

from server.database import get_db
from server.schemas import RegistrationCreateSchema

router = APIRouter(prefix="/api", tags=["registrations"])

TICKET_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_ticket_code() -> str:
    random_str = "".join(random.choices(TICKET_CHARS, k=4))
    return f"EVF-2026-{random_str}"


@router.post("/events/{id}/register", status_code=201)
def register_for_event(id: str, payload: RegistrationCreateSchema) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()

        # Validate event existence and capacity
        cursor.execute("SELECT * FROM events WHERE id = ?", (id,))
        event = cursor.fetchone()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        if event["registered_count"] >= event["capacity"]:
            raise HTTPException(
                status_code=400,
                detail="This event has reached its maximum participant limit.",
            )

        # Check for duplicate registration by email
        cursor.execute(
            "SELECT * FROM registrations WHERE event_id = ? AND LOWER(email) = LOWER(?)",
            (id, payload.email.strip()),
        )
        existing = cursor.fetchone()
        if existing:
            raise HTTPException(
                status_code=409,
                detail={
                    "error": "You are already registered for this event with this email address.",
                    "ticket_code": existing["ticket_code"],
                    "registration_id": existing["id"],
                },
            )

        # Generate unique ticket code
        ticket_code = generate_ticket_code()
        while True:
            cursor.execute("SELECT id FROM registrations WHERE ticket_code = ?", (ticket_code,))
            if not cursor.fetchone():
                break
            ticket_code = generate_ticket_code()

        reg_id = f"reg-{int(time.time() * 1000)}-{random.randint(0, 999)}"
        att_id = f"att-{reg_id}"

        # 1. Insert registration
        cursor.execute(
            """
            INSERT INTO registrations (
                id, event_id, ticket_code, participant_name, email, phone, college, department, year_of_study
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                reg_id,
                id,
                ticket_code,
                payload.participant_name.strip(),
                payload.email.strip(),
                payload.phone.strip(),
                payload.college.strip() if payload.college else "TechTrove University",
                payload.department.strip(),
                payload.year_of_study or "1st Year",
            ),
        )

        # 2. Insert attendance record
        cursor.execute(
            """
            INSERT INTO attendance (id, registration_id, event_id, status)
            VALUES (?, ?, ?, 'registered')
            """,
            (att_id, reg_id, id),
        )

        # 3. Increment registered_count
        cursor.execute(
            "UPDATE events SET registered_count = registered_count + 1 WHERE id = ?",
            (id,),
        )

        return {
            "message": "Registration successful!",
            "id": reg_id,
            "ticket_code": ticket_code,
            "event_id": id,
            "event_title": event["title"],
            "event_date": event["date"],
            "event_time": f"{event['start_time']} - {event['end_time']}",
            "event_venue": event["venue"],
            "participant_name": payload.participant_name.strip(),
            "email": payload.email.strip(),
            "department": payload.department.strip(),
            "college": payload.college.strip() if payload.college else "TechTrove University",
            "year_of_study": payload.year_of_study or "1st Year",
        }


@router.get("/registrations/my")
def get_my_registrations(email: Optional[str] = Query(None)) -> List[Dict[str, Any]]:
    if not email or not email.strip():
        raise HTTPException(status_code=400, detail="Email parameter is required")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT 
                r.*,
                e.title as event_title,
                e.category as event_category,
                e.venue as event_venue,
                e.date as event_date,
                e.start_time as event_start_time,
                e.end_time as event_end_time,
                e.coordinator_name,
                e.coordinator_contact,
                e.banner_url,
                a.status as attendance_status,
                a.check_in_time
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            LEFT JOIN attendance a ON r.id = a.registration_id
            WHERE LOWER(r.email) = LOWER(?)
            ORDER BY e.date ASC
            """,
            (email.strip(),),
        )
        return [dict(row) for row in cursor.fetchall()]


@router.get("/events/{id}/registrations")
def get_event_registrations(
    id: str,
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT 
                r.*,
                a.status as attendance_status,
                a.check_in_time
            FROM registrations r
            LEFT JOIN attendance a ON r.id = a.registration_id
            WHERE r.event_id = ?
        """
        params = [id]

        if status and status != "All":
            query += " AND a.status = ?"
            params.append(status)

        if search and search.strip():
            query += " AND (r.participant_name LIKE ? OR r.email LIKE ? OR r.ticket_code LIKE ? OR r.department LIKE ?)"
            search_param = f"%{search.strip()}%"
            params.extend([search_param, search_param, search_param, search_param])

        query += " ORDER BY r.registered_at DESC"
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


@router.get("/events/{id}/registrations/export")
def export_event_registrations(id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT title FROM events WHERE id = ?", (id,))
        event = cursor.fetchone()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        cursor.execute(
            """
            SELECT 
                r.ticket_code,
                r.participant_name,
                r.email,
                r.phone,
                r.college,
                r.department,
                r.year_of_study,
                r.registered_at,
                COALESCE(a.status, 'registered') as attendance_status,
                COALESCE(a.check_in_time, 'N/A') as check_in_time
            FROM registrations r
            LEFT JOIN attendance a ON r.id = a.registration_id
            WHERE r.event_id = ?
            ORDER BY r.registered_at ASC
            """,
            (id,),
        )
        attendees = cursor.fetchall()

        output = io.StringIO()
        writer = csv.writer(output, lineterminator="\r\n", quoting=csv.QUOTE_ALL)
        headers = [
            "Ticket Code",
            "Participant Name",
            "Email",
            "Phone",
            "College",
            "Department",
            "Year of Study",
            "Registered At",
            "Attendance Status",
            "Check-In Time",
        ]
        writer.writerow(headers)
        for a in attendees:
            writer.writerow(
                [
                    a["ticket_code"],
                    a["participant_name"],
                    a["email"],
                    a["phone"],
                    a["college"],
                    a["department"],
                    a["year_of_study"],
                    a["registered_at"],
                    a["attendance_status"],
                    a["check_in_time"],
                ]
            )

        safe_title = re.sub(r"[^a-zA-Z0-9]", "_", event["title"])
        filename = f"eventflow-{safe_title}-attendees.csv"

        return Response(
            content=output.getvalue(),
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )


@router.get("/registrations")
def get_all_registrations(
    event_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100),
) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT 
                r.*,
                e.title as event_title,
                e.category as event_category,
                e.date as event_date,
                a.status as attendance_status,
                a.check_in_time
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            LEFT JOIN attendance a ON r.id = a.registration_id
            WHERE 1=1
        """
        params = []

        if event_id and event_id != "All":
            query += " AND r.event_id = ?"
            params.append(event_id)

        if search and search.strip():
            query += " AND (r.participant_name LIKE ? OR r.email LIKE ? OR r.ticket_code LIKE ? OR e.title LIKE ?)"
            search_param = f"%{search.strip()}%"
            params.extend([search_param, search_param, search_param, search_param])

        query += " ORDER BY r.registered_at DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]
