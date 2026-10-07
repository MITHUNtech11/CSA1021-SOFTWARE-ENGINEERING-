"""
SQLite database manager, schema definitions, and seed logic for EventFlow.
"""

from contextlib import contextmanager
from datetime import datetime, timezone
import os
from pathlib import Path
import sqlite3
from typing import Generator, Optional, Union

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS organizers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Club Lead',
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  organizer_id TEXT REFERENCES organizers(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  venue TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  registration_deadline TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  registered_count INTEGER NOT NULL DEFAULT 0,
  banner_url TEXT,
  coordinator_name TEXT NOT NULL,
  coordinator_contact TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_sessions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  round_name TEXT NOT NULL,
  venue_room TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_code TEXT NOT NULL UNIQUE,
  participant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  department TEXT NOT NULL,
  year_of_study TEXT NOT NULL,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered',
  check_in_time DATETIME
);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'info',
  published_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""


def resolve_db_path(custom_path: Optional[Union[str, Path]] = None) -> str:
    """
    Resolve database path in priority order:
    1. custom_path argument
    2. DB_PATH environment variable
    3. server/eventflow.db default path
    """
    if custom_path:
        return str(custom_path)
    env_path = os.getenv("DB_PATH")
    if env_path:
        return env_path
    return str(Path(__file__).parent / "eventflow.db")


@contextmanager
def get_db(custom_path: Optional[Union[str, Path]] = None) -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager yielding a SQLite connection configured with:
    - row_factory = sqlite3.Row
    - PRAGMA foreign_keys = ON
    - PRAGMA journal_mode = WAL
    Commits on successful exit, rolls back on exception, closes connection.
    """
    db_path = resolve_db_path(custom_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")

    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_schema(conn: sqlite3.Connection) -> None:
    """
    Execute DDL script creating all required tables if they do not already exist.
    """
    conn.executescript(SCHEMA_SQL)


def seed_if_empty(conn: sqlite3.Connection) -> None:
    """
    Populate database tables with seed data if events table is empty.
    """
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM events")
    row = cursor.fetchone()
    count = row["count"] if isinstance(row, sqlite3.Row) else row[0]
    if count > 0:
        return

    from server.seed_data import (
        organizers,
        events,
        event_sessions,
        sample_registrations,
        announcements,
    )

    cursor.executemany(
        """
        INSERT INTO organizers (id, name, email, department, role, avatar_url)
        VALUES (:id, :name, :email, :department, :role, :avatar_url)
        """,
        organizers,
    )

    cursor.executemany(
        """
        INSERT INTO events (
            id, organizer_id, title, description, category, venue, date,
            start_time, end_time, registration_deadline, capacity, registered_count,
            banner_url, coordinator_name, coordinator_contact, status
        )
        VALUES (
            :id, :organizer_id, :title, :description, :category, :venue, :date,
            :start_time, :end_time, :registration_deadline, :capacity, :registered_count,
            :banner_url, :coordinator_name, :coordinator_contact, :status
        )
        """,
        events,
    )

    cursor.executemany(
        """
        INSERT INTO event_sessions (
            id, event_id, round_name, venue_room, start_time, end_time, description, order_index
        )
        VALUES (
            :id, :event_id, :round_name, :venue_room, :start_time, :end_time, :description, :order_index
        )
        """,
        event_sessions,
    )

    for reg in sample_registrations:
        cursor.execute(
            """
            INSERT INTO registrations (
                id, event_id, ticket_code, participant_name, email, phone,
                college, department, year_of_study
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                reg["id"],
                reg["event_id"],
                reg["ticket_code"],
                reg["participant_name"],
                reg["email"],
                reg["phone"],
                reg["college"],
                reg["department"],
                reg["year_of_study"],
            ),
        )
        status = reg.get("status", "registered")
        check_in_time = (
            datetime.now(timezone.utc).isoformat()
            if status == "checked_in"
            else None
        )
        cursor.execute(
            """
            INSERT INTO attendance (id, registration_id, event_id, status, check_in_time)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                f"att-{reg['id']}",
                reg["id"],
                reg["event_id"],
                status,
                check_in_time,
            ),
        )

    cursor.executemany(
        """
        INSERT INTO announcements (id, event_id, title, message, priority, published_by)
        VALUES (:id, :event_id, :title, :message, :priority, :published_by)
        """,
        announcements,
    )
    conn.commit()
