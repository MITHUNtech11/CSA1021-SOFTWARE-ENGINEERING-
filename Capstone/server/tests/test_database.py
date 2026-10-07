import os
import pytest
from server.database import get_db, init_schema, seed_if_empty, resolve_db_path

def test_database_init_and_seed(tmp_path):
    test_db = str(tmp_path / "test.db")
    with get_db(test_db) as conn:
        init_schema(conn)
        seed_if_empty(conn)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM events")
        assert cursor.fetchone()["count"] >= 5
        cursor.execute("SELECT COUNT(*) as count FROM organizers")
        assert cursor.fetchone()["count"] >= 1
        cursor.execute("SELECT COUNT(*) as count FROM event_sessions")
        assert cursor.fetchone()["count"] >= 1
        cursor.execute("SELECT COUNT(*) as count FROM announcements")
        assert cursor.fetchone()["count"] >= 1

def test_row_factory_dict_access(tmp_path):
    test_db = str(tmp_path / "test_dict.db")
    with get_db(test_db) as conn:
        init_schema(conn)
        seed_if_empty(conn)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM events LIMIT 1")
        row = cursor.fetchone()
        assert row["title"] is not None
        assert dict(row)["category"] is not None

def test_rollback_on_error(tmp_path):
    test_db = str(tmp_path / "test_rollback.db")
    with get_db(test_db) as conn:
        init_schema(conn)

    with pytest.raises(RuntimeError):
        with get_db(test_db) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO organizers (id, name, email, department) VALUES ('tmp', 'Tmp', 'tmp@test.com', 'CS')"
            )
            raise RuntimeError("Forced error")

    with get_db(test_db) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM organizers WHERE id = 'tmp'")
        assert cursor.fetchone()["count"] == 0

def test_seed_if_empty_idempotent(tmp_path):
    test_db = str(tmp_path / "test_idempotent.db")
    with get_db(test_db) as conn:
        init_schema(conn)
        seed_if_empty(conn)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM events")
        count_first = cursor.fetchone()["count"]
        # Call again
        seed_if_empty(conn)
        cursor.execute("SELECT COUNT(*) as count FROM events")
        count_second = cursor.fetchone()["count"]
        assert count_first == count_second

def test_cascade_delete(tmp_path):
    test_db = str(tmp_path / "test_cascade.db")
    with get_db(test_db) as conn:
        init_schema(conn)
        seed_if_empty(conn)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM events WHERE id = 'evt-1'")
        cursor.execute("SELECT COUNT(*) as count FROM event_sessions WHERE event_id = 'evt-1'")
        assert cursor.fetchone()["count"] == 0
        cursor.execute("SELECT COUNT(*) as count FROM registrations WHERE event_id = 'evt-1'")
        assert cursor.fetchone()["count"] == 0
