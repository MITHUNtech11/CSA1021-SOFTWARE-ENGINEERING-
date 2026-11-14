import sqlite3
import os
from contextlib import contextmanager
from datetime import datetime

DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "smart_campus.db")

def get_db_path():
    return os.getenv("DATABASE_PATH", DEFAULT_DB_PATH)

def get_connection(db_path=None):
    """Establishes an SQLite connection with WAL mode and foreign keys enabled."""
    target_path = db_path or get_db_path()
    conn = sqlite3.connect(target_path, timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA busy_timeout = 30000;")
    return conn

@contextmanager
def get_db(db_path=None):
    """Context manager for database operations with automatic commit/rollback."""
    conn = get_connection(db_path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db(db_path=None):
    """Initializes all 10 core entities and necessary indexes."""
    target_path = db_path or get_db_path()
    os.makedirs(os.path.dirname(os.path.abspath(target_path)), exist_ok=True)
    
    with get_db(target_path) as conn:
        cursor = conn.cursor()
        
        # 1. Users
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'technician', 'approver', 'facility_manager', 'admin')),
            department TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        """)

        # 2. Facilities
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS facilities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            building TEXT NOT NULL,
            room_number TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('laboratory', 'lecture_hall', 'seminar_room')),
            capacity INTEGER NOT NULL,
            is_restricted INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'maintenance', 'reserved'))
        );
        """)

        # 3. Bookings (Includes request_key for idempotency & version for consistency)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            facility_id INTEGER NOT NULL REFERENCES facilities(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            purpose TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'requested' CHECK(status IN ('requested', 'approved', 'confirmed', 'in_use', 'completed', 'cancelled')),
            request_key TEXT UNIQUE,
            version INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bookings_facility_time ON bookings(facility_id, start_time, end_time);")

        # 4. Sensor Events (Unique constraint on source + event_id for deduplication)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sensor_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            event_id TEXT NOT NULL,
            metric TEXT NOT NULL CHECK(metric IN ('temperature_c', 'hvac_power_kw', 'vibration_mm_s')),
            value REAL NOT NULL,
            threshold REAL NOT NULL,
            observed_at TEXT NOT NULL,
            processed INTEGER NOT NULL DEFAULT 0,
            created_ticket_id INTEGER REFERENCES tickets(id),
            UNIQUE(source, event_id)
        );
        """)

        # 5. Tickets (Includes version for optimistic locking & explainable triage fields)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_code TEXT UNIQUE NOT NULL,
            facility_id INTEGER NOT NULL REFERENCES facilities(id),
            source_alert_id INTEGER REFERENCES sensor_events(id),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL CHECK(category IN ('HVAC', 'Electrical', 'Plumbing', 'IT_Network', 'Structural')),
            urgency TEXT NOT NULL CHECK(urgency IN ('low', 'medium', 'high')),
            teaching_impact TEXT NOT NULL CHECK(teaching_impact IN ('low', 'medium', 'high')),
            priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high', 'critical')),
            priority_justification TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'intake' CHECK(status IN ('intake', 'assigned', 'inspection', 'in_progress', 'resolved', 'closed')),
            assigned_technician_id INTEGER REFERENCES users(id),
            inspection_notes TEXT,
            resolution_notes TEXT,
            version INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        """)

        # 6. Comments
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id INTEGER NOT NULL REFERENCES tickets(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            comment_text TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        """)

        # 7. SLA Policies
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sla_policies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            priority TEXT UNIQUE NOT NULL,
            response_target_hours INTEGER NOT NULL,
            resolution_target_hours INTEGER NOT NULL,
            escalation_level TEXT NOT NULL
        );
        """)

        # 8. Approvals (Restricted facilities and high-impact changes)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS approvals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_type TEXT NOT NULL CHECK(target_type IN ('booking', 'ticket_change', 'equipment_loan')),
            target_id INTEGER NOT NULL,
            approver_id INTEGER REFERENCES users(id),
            decision TEXT NOT NULL DEFAULT 'pending' CHECK(decision IN ('pending', 'approved', 'rejected')),
            reason TEXT,
            decided_at TEXT
        );
        """)

        # 9. Audit Events (Immutable chronological audit log)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            entity_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            performed_by TEXT NOT NULL,
            details TEXT NOT NULL,
            timestamp TEXT NOT NULL
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events(timestamp);")

        # 10. Integration Intents (Outbox pattern for DevOps / external issues)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS integration_intents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            correlation_key TEXT UNIQUE NOT NULL,
            service_name TEXT NOT NULL,
            payload TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'synced', 'failed')),
            attempts INTEGER NOT NULL DEFAULT 0,
            last_error TEXT,
            updated_at TEXT NOT NULL
        );
        """)
        
    print(f"Database initialized at: {target_path}")

if __name__ == "__main__":
    init_db()
