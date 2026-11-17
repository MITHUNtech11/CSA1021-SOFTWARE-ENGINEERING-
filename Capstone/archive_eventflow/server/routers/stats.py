from typing import Any, Dict, List
from fastapi import APIRouter

from server.database import get_db

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/overview")
def get_overview_stats() -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT 
                COUNT(*) as total_events,
                SUM(CASE WHEN status IN ('upcoming', 'ongoing') THEN 1 ELSE 0 END) as active_events,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_events,
                COALESCE(SUM(capacity), 0) as total_capacity,
                COALESCE(SUM(registered_count), 0) as total_event_registrations
            FROM events
            """
        )
        event_counts = cursor.fetchone()

        cursor.execute(
            """
            SELECT 
                COUNT(*) as total_registrations,
                COUNT(DISTINCT LOWER(email)) as unique_participants
            FROM registrations
            """
        )
        reg_counts = cursor.fetchone()

        cursor.execute(
            """
            SELECT COUNT(*) as checked_in_count
            FROM attendance
            WHERE status = 'checked_in'
            """
        )
        check_in_counts = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as count FROM announcements")
        anc_count = cursor.fetchone()

        total_reg = (reg_counts["total_registrations"] or 0) if reg_counts else 0
        total_cap = (event_counts["total_capacity"] or 0) if event_counts else 0
        effective_cap = total_cap if total_cap > 0 else 1

        capacity_rate = min(100, round((total_reg / effective_cap) * 100))
        checked_in = (check_in_counts["checked_in_count"] or 0) if check_in_counts else 0
        attendance_rate = round((checked_in / total_reg) * 100) if total_reg > 0 else 0

        return {
            "total_events": (event_counts["total_events"] or 0) if event_counts else 0,
            "active_events": (event_counts["active_events"] or 0) if event_counts else 0,
            "completed_events": (event_counts["completed_events"] or 0) if event_counts else 0,
            "total_capacity": total_cap,
            "total_registrations": total_reg,
            "unique_participants": (reg_counts["unique_participants"] or 0) if reg_counts else 0,
            "checked_in_count": checked_in,
            "capacity_utilization_rate": capacity_rate,
            "attendance_rate": attendance_rate,
            "total_announcements": (anc_count["count"] or 0) if anc_count else 0,
        }


@router.get("/department-breakdown")
def get_department_breakdown() -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT 
                department,
                COUNT(*) as count
            FROM registrations
            GROUP BY department
            ORDER BY count DESC
            LIMIT 6
            """
        )
        return [dict(row) for row in cursor.fetchall()]


@router.get("/category-breakdown")
def get_category_breakdown() -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT 
                category,
                COUNT(id) as event_count,
                COALESCE(SUM(registered_count), 0) as total_registered,
                COALESCE(SUM(capacity), 0) as total_capacity
            FROM events
            GROUP BY category
            ORDER BY event_count DESC
            """
        )
        return [dict(row) for row in cursor.fetchall()]


@router.get("/activity-log")
def get_activity_log() -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()

        # Recent registrations
        cursor.execute(
            """
            SELECT 
                'registration' as type,
                r.id,
                r.participant_name as title,
                e.title as subtitle,
                r.registered_at as timestamp
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            ORDER BY r.registered_at DESC
            LIMIT 5
            """
        )
        recent_regs = [dict(row) for row in cursor.fetchall()]

        # Recent announcements
        cursor.execute(
            """
            SELECT 
                'announcement' as type,
                id,
                title,
                priority as subtitle,
                created_at as timestamp
            FROM announcements
            ORDER BY created_at DESC
            LIMIT 3
            """
        )
        recent_ancs = [dict(row) for row in cursor.fetchall()]

        # Combined sorted stream
        combined = recent_regs + recent_ancs
        combined.sort(key=lambda x: str(x.get("timestamp", "")), reverse=True)
        return combined
