# FastAPI Backend Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the EventFlow backend from Node.js/Express to Python/FastAPI while maintaining 100% API compatibility with the React frontend and SQLite database.

**Architecture:** A modular FastAPI application featuring dedicated APIRouters for events, registrations, attendance, announcements, and statistics. Direct SQLite access via Python's standard `sqlite3` with WAL mode and foreign key constraints, automatic schema migration and sample data seeding on startup, and Pydantic v2 schemas for payload validation.

**Tech Stack:** Python 3.11+, FastAPI, Uvicorn, Pydantic v2, SQLite 3, HTTPX, Pytest.

**Spec:** `docs/superpowers/specs/2026-10-05-fastapi-backend-design.md`

## Global Constraints

- Backend must bind to port 5000 (`http://localhost:5000`) so the React + Vite proxy `/api` works without changes.
- Database engine is direct SQLite via Python standard library `sqlite3` without ORM bloat.
- All JSON error responses must include an `error` key: `{"error": "<message>"}`.
- Ticket codes must match format `EVF-2026-XXXX` where XXXX are uppercase alphanumeric characters.
- All existing endpoints, method signatures, parameter names, and return schemas must match 1:1.

## Review Focus

1. Duplicate registration attempts with same email for the same event must return HTTP 409 Conflict with `ticket_code` and `registration_id`.
2. Event capacity overflow must reject new registrations with HTTP 400 Bad Request.
3. Ticket verification endpoint `/api/attendance/verify` with `auto_check_in=True` must set attendance status to `checked_in` and store current timestamp if not already checked in.
4. CSV export endpoint `/api/events/{id}/registrations/export` must return `text/csv; charset=utf-8` with Content-Disposition attachment header.
5. Overview stats `/api/stats/overview` must accurately handle division by zero (e.g. 0 total events or registrations) returning 0 rather than failing.

---

### Task 1: Environment Setup & Python Scaffolding

**Files:**
- Create: `server/requirements.txt`
- Create: `server/run.py`
- Test: `.venv/Scripts/python -c "import fastapi, uvicorn, pydantic, httpx, pytest; print('OK')"`

**Interfaces:**
- Consumes: Python 3.11+
- Produces: `.venv` virtual environment with FastAPI and testing tooling installed

- [ ] **Step 1: Create `server/requirements.txt`**
```text
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0
httpx>=0.27.0
pytest>=8.0.0
```

- [ ] **Step 2: Create virtual environment `.venv` and install requirements**
Run: `python -m venv .venv` followed by `.venv/Scripts/pip install -r server/requirements.txt`

- [ ] **Step 3: Create `server/run.py` launcher**
Launcher invokes `uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True, app_dir="server")`.

- [ ] **Step 4: Verify environment setup**
Run: `.venv/Scripts/python -c "import fastapi, uvicorn, pydantic, httpx, pytest; print('ENV_OK')"`
Expected: `ENV_OK`

- [ ] **Step 5: Commit**
```bash
git add server/requirements.txt server/run.py
git commit -m "chore(server): setup python virtual environment and launcher"
```

---

### Task 2: Database Connection, Schema Migration & Seed Engine

**Files:**
- Create: `server/database.py`
- Create: `server/seed_data.py`
- Test: `server/tests/test_database.py`

**Interfaces:**
- Consumes: SQLite 3
- Produces: `get_db(custom_path=None)` context manager returning dict-row connection; `init_schema(conn)`; `seed_if_empty(conn)`

- [ ] **Step 1: Write test for schema initialization and seeding**
In `server/tests/test_database.py`:
```python
import os
import pytest
from server.database import get_db, init_schema, seed_if_empty

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
```

- [ ] **Step 2: Run test to verify it fails**
Run: `.venv/Scripts/pytest server/tests/test_database.py`
Expected: FAIL (ModuleNotFoundError: No module named 'server.database')

- [ ] **Step 3: Implement `server/database.py` and `server/seed_data.py`**
- In `server/database.py`: Define `get_db()` context manager with `sqlite3.Row`, WAL mode, foreign keys, `init_schema()`, and `seed_if_empty()`.
- In `server/seed_data.py`: Port `organizers`, `events`, `eventSessions`, `sampleRegistrations`, and `announcements` datasets from `server/seedData.js`.

- [ ] **Step 4: Run test to verify it passes**
Run: `.venv/Scripts/pytest server/tests/test_database.py`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/database.py server/seed_data.py server/tests/test_database.py
git commit -m "feat(server): implement SQLite database manager, schema, and seeding"
```

---

### Task 3: Schemas, Exception Handlers & Core App Scaffolding

**Files:**
- Create: `server/schemas.py`
- Create: `server/main.py`
- Test: `server/tests/test_health.py`

**Interfaces:**
- Consumes: `get_db`, `init_schema`, `seed_if_empty`
- Produces: FastAPI app with CORS middleware, lifespan setup, standard exception handling, and `/api/health`

- [ ] **Step 1: Write test for health check and error format**
In `server/tests/test_health.py`:
```python
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "timestamp" in data
```

- [ ] **Step 2: Run test to verify it fails**
Run: `.venv/Scripts/pytest server/tests/test_health.py`
Expected: FAIL (No module named 'server.main')

- [ ] **Step 3: Implement `server/schemas.py` and `server/main.py`**
- `server/schemas.py`: Pydantic models for Event, Session, Registration, Attendance, and Announcement.
- `server/main.py`: FastAPI app, lifespan function calling DB init & seed on startup, CORS allowing `*`, and custom HTTPException handler returning `{"error": detail}`.

- [ ] **Step 4: Run test to verify it passes**
Run: `.venv/Scripts/pytest server/tests/test_health.py`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/schemas.py server/main.py server/tests/test_health.py
git commit -m "feat(server): implement pydantic schemas and core app lifespan"
```

---

### Task 4: Events Router & Multi-Round Sessions

**Files:**
- Create: `server/routers/__init__.py`
- Create: `server/routers/events.py`
- Modify: `server/main.py` (include router)
- Test: `server/tests/test_events.py`

**Interfaces:**
- Consumes: `get_db`, `EventCreateSchema`, `EventUpdateSchema`
- Produces: `/api/events` router endpoints:
  - `GET /api/events` (with query filters `category`, `status`, `search`)
  - `GET /api/events/{id}` (with joined sessions and announcements)
  - `POST /api/events` (creates event and sessions, returns 201)
  - `PUT /api/events/{id}` (updates fields and replaces sessions)
  - `DELETE /api/events/{id}` (deletes event and cascade)

- [ ] **Step 1: Write tests for event operations**
In `server/tests/test_events.py`:
- Test listing events and verifying category filter (`?category=Hackathon`).
- Test getting event details with sessions.
- Test creating a new event with sessions returning 201 Created.
- Test updating and deleting an event.

- [ ] **Step 2: Run test to verify it fails**
Run: `.venv/Scripts/pytest server/tests/test_events.py`
Expected: FAIL (404 Not Found on `/api/events`)

- [ ] **Step 3: Implement `server/routers/events.py` and mount in `server/main.py`**
Implement query parsing, SQLite transactions for sessions, error handling for missing events.

- [ ] **Step 4: Run test to verify it passes**
Run: `.venv/Scripts/pytest server/tests/test_events.py`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/routers/__init__.py server/routers/events.py server/main.py server/tests/test_events.py
git commit -m "feat(server): implement events router with session handling and search"
```

---

### Task 5: Registrations Router & CSV Export

**Files:**
- Create: `server/routers/registrations.py`
- Modify: `server/main.py` (include router)
- Test: `server/tests/test_registrations.py`

**Interfaces:**
- Consumes: `get_db`, `RegistrationCreateSchema`
- Produces:
  - `POST /api/events/{id}/register` (ticket generation, capacity check, duplicate check)
  - `GET /api/registrations/my` (lookup by email)
  - `GET /api/events/{id}/registrations` (organizer event attendee roster)
  - `GET /api/events/{id}/registrations/export` (CSV file download)
  - `GET /api/registrations` (global registrations)

- [ ] **Step 1: Write tests for registrations and CSV export**
In `server/tests/test_registrations.py`:
- Test successful registration generating `EVF-2026-XXXX` ticket.
- Test duplicate registration returns 409 Conflict.
- Test capacity overflow returns 400.
- Test `GET /api/registrations/my?email=...`.
- Test CSV export contains header `Ticket Code` and correct MIME type.

- [ ] **Step 2: Run test to verify it fails**
Run: `.venv/Scripts/pytest server/tests/test_registrations.py`
Expected: FAIL (404 Not Found)

- [ ] **Step 3: Implement `server/routers/registrations.py` and mount in `server/main.py`**
Include ticket code generator, transaction with attendance creation and count increment, and CSV generation helper.

- [ ] **Step 4: Run test to verify it passes**
Run: `.venv/Scripts/pytest server/tests/test_registrations.py`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/routers/registrations.py server/main.py server/tests/test_registrations.py
git commit -m "feat(server): implement registrations router, ticket generation, and CSV export"
```

---

### Task 6: Attendance Router & QR Verification Simulator

**Files:**
- Create: `server/routers/attendance.py`
- Modify: `server/main.py` (include router)
- Test: `server/tests/test_attendance.py`

**Interfaces:**
- Consumes: `get_db`, `AttendanceUpdateSchema`, `TicketVerifySchema`
- Produces:
  - `PATCH /api/registrations/{id}/attendance`
  - `POST /api/attendance/verify`

- [ ] **Step 1: Write tests for attendance update and QR verification**
In `server/tests/test_attendance.py`:
- Test status update to `checked_in` sets `check_in_time`.
- Test invalid status returns 400.
- Test ticket verification with `auto_check_in=True` updates status and returns 200.
- Test invalid ticket returns 404 with `verified: false`.

- [ ] **Step 2: Run test to verify it fails**
Run: `.venv/Scripts/pytest server/tests/test_attendance.py`
Expected: FAIL (404 Not Found)

- [ ] **Step 3: Implement `server/routers/attendance.py` and mount in `server/main.py`**
Implement status patch logic, case-insensitive ticket code lookup, and conditional auto-check-in update.

- [ ] **Step 4: Run test to verify it passes**
Run: `.venv/Scripts/pytest server/tests/test_attendance.py`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/routers/attendance.py server/main.py server/tests/test_attendance.py
git commit -m "feat(server): implement attendance tracking and QR ticket verification"
```

---

### Task 7: Announcements & Statistics Routers

**Files:**
- Create: `server/routers/announcements.py`
- Create: `server/routers/stats.py`
- Modify: `server/main.py` (include routers)
- Test: `server/tests/test_stats_announcements.py`

**Interfaces:**
- Consumes: `get_db`, `AnnouncementCreateSchema`
- Produces:
  - `GET /api/announcements`, `POST /api/announcements`, `DELETE /api/announcements/{id}`
  - `GET /api/stats/overview`, `/api/stats/department-breakdown`, `/api/stats/category-breakdown`, `/api/stats/activity-log`

- [ ] **Step 1: Write tests for announcements and analytics stats**
In `server/tests/test_stats_announcements.py`:
- Test creating and deleting announcements.
- Test announcement query priority sorting.
- Test overview stats calculation (`total_events >= 5`, rates correctly computed).
- Test department and category breakdowns and activity stream.

- [ ] **Step 2: Run test to verify it fails**
Run: `.venv/Scripts/pytest server/tests/test_stats_announcements.py`
Expected: FAIL (404 Not Found)

- [ ] **Step 3: Implement `server/routers/announcements.py` and `server/routers/stats.py`**
Implement priority sorting, SQL aggregation for metrics with zero-division protection, and activity union.

- [ ] **Step 4: Run test to verify it passes**
Run: `.venv/Scripts/pytest server/tests/test_stats_announcements.py`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/routers/announcements.py server/routers/stats.py server/main.py server/tests/test_stats_announcements.py
git commit -m "feat(server): implement announcements and analytics stats routers"
```

---

### Task 8: Comprehensive Integration Suite, Package Scripts & Express Cleanup

**Files:**
- Create: `server/tests/test_api.py` (all-in-one integration suite replicating `server/tests/api.test.js`)
- Modify: `package.json` (update dev/server/test commands to use python / uvicorn / pytest)
- Remove: `server/index.js`, `server/db.js`, `server/seedData.js`, `server/routes/`, `server/tests/api.test.js`, `server/tests/db.test.js`
- Test: Full integration test execution and live dev server verification

**Interfaces:**
- Consumes: Full FastAPI app stack
- Produces: Cleaned Python-only `server/` directory and updated root npm workflow

- [ ] **Step 1: Write all-in-one integration test suite in `server/tests/test_api.py`**
Replicate all 10 integration test steps from the original Express test file into a clean pytest test case.

- [ ] **Step 2: Run pytest to verify all tests pass**
Run: `.venv/Scripts/pytest server/tests/test_api.py -v`
Expected: All 10 integration assertions PASS.

- [ ] **Step 3: Update root `package.json` scripts**
Update `server` and `test` scripts to invoke the Python virtual environment:
```json
"server": ".venv\\Scripts\\python server/run.py",
"test": ".venv\\Scripts\\pytest server/tests"
```

- [ ] **Step 4: Remove obsolete Node.js Express server files**
Remove `server/index.js`, `server/db.js`, `server/seedData.js`, `server/routes/`, `server/package.json`, `server/package-lock.json`, and `server/tests/*.js`.

- [ ] **Step 5: Test root integration**
Run: `npm test`
Expected: Pytest executes and all tests pass.

- [ ] **Step 6: Commit**
```bash
git add package.json server/
git commit -m "refactor(server): finalize FastAPI migration, update npm scripts, and cleanup express files"
```
