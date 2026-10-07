import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query

from server.database import get_db
from server.schemas import AnnouncementCreateSchema

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


@router.get("")
def list_announcements(event_id: Optional[str] = Query(None)) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT 
                a.*,
                e.title as event_title
            FROM announcements a
            LEFT JOIN events e ON a.event_id = e.id
            WHERE 1=1
        """
        params = []

        if event_id:
            query += " AND (a.event_id = ? OR a.event_id IS NULL)"
            params.append(event_id)

        query += """
            ORDER BY 
                CASE a.priority 
                    WHEN 'urgent' THEN 1 
                    WHEN 'update' THEN 2 
                    ELSE 3 
                END, 
                a.created_at DESC
        """

        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


@router.post("", status_code=201)
def create_announcement(payload: AnnouncementCreateSchema) -> Dict[str, Any]:
    if not payload.title.strip() or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Title and message are required")

    anc_id = f"anc-{int(time.time() * 1000)}"
    created_at = datetime.now(timezone.utc).isoformat()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO announcements (id, event_id, title, message, priority, published_by)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                anc_id,
                payload.event_id or None,
                payload.title.strip(),
                payload.message.strip(),
                payload.priority or "info",
                payload.published_by.strip() if payload.published_by else "Admin Coordinator",
            ),
        )

        return {
            "id": anc_id,
            "event_id": payload.event_id or None,
            "title": payload.title.strip(),
            "message": payload.message.strip(),
            "priority": payload.priority or "info",
            "published_by": payload.published_by.strip()
            if payload.published_by
            else "Admin Coordinator",
            "created_at": created_at,
        }


@router.delete("/{id}")
def delete_announcement(id: str) -> Dict[str, str]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM announcements WHERE id = ?", (id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Announcement not found")
        return {"message": "Announcement deleted successfully"}
