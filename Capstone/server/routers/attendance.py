from datetime import datetime, timezone
from typing import Any, Dict
from fastapi import APIRouter, HTTPException

from server.database import get_db
from server.schemas import AttendanceUpdateSchema, TicketVerifySchema

router = APIRouter(prefix="/api", tags=["attendance"])


@router.patch("/registrations/{id}/attendance")
def update_attendance(id: str, payload: AttendanceUpdateSchema) -> Dict[str, Any]:
    if payload.status not in ["registered", "checked_in", "absent"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid status. Must be 'registered', 'checked_in', or 'absent'",
        )

    check_in_time = (
        datetime.now(timezone.utc).isoformat() if payload.status == "checked_in" else None
    )

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE attendance 
            SET status = ?, check_in_time = ?
            WHERE registration_id = ?
            """,
            (payload.status, check_in_time, id),
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Attendance record not found for this registration",
            )

        return {
            "message": f"Attendance marked as {payload.status}",
            "registration_id": id,
            "status": payload.status,
            "check_in_time": check_in_time,
        }


@router.post("/attendance/verify")
def verify_ticket(payload: TicketVerifySchema) -> Dict[str, Any]:
    if not payload.ticket_code or not payload.ticket_code.strip():
        raise HTTPException(status_code=400, detail="Ticket code is required")

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
                a.status as attendance_status,
                a.check_in_time
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            LEFT JOIN attendance a ON r.id = a.registration_id
            WHERE UPPER(r.ticket_code) = UPPER(?)
            """,
            (payload.ticket_code.strip(),),
        )
        registration = cursor.fetchone()

        if not registration:
            raise HTTPException(
                status_code=404,
                detail={
                    "verified": False,
                    "error": "Invalid Ticket! No registration found matching this code.",
                },
            )

        already_checked_in = registration["attendance_status"] == "checked_in"
        updated_status = registration["attendance_status"]
        check_in_time = registration["check_in_time"]

        # Auto mark checked in upon scan if not already checked in
        if payload.auto_check_in and not already_checked_in:
            check_in_time = datetime.now(timezone.utc).isoformat()
            cursor.execute(
                """
                UPDATE attendance SET status = 'checked_in', check_in_time = ?
                WHERE registration_id = ?
                """,
                (check_in_time, registration["id"]),
            )
            updated_status = "checked_in"

        reg_data = dict(registration)
        reg_data["attendance_status"] = updated_status
        reg_data["check_in_time"] = check_in_time

        return {
            "verified": True,
            "message": "Ticket Verified & Checked In!"
            if updated_status == "checked_in"
            else "Valid Ticket Verified",
            "already_checked_in": already_checked_in,
            "registration": reg_data,
        }
