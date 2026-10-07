# EventFlow: FastAPI Backend Migration - Design Specification

**Date:** 2026-10-05  
**Status:** Approved  
**Target:** EventFlow Backend Architecture Migration (Node.js/Express -> Python/FastAPI)  

---

## 1. Overview & Objectives

This specification details the migration of the EventFlow backend from Node.js/Express to Python/FastAPI. The new FastAPI backend delivers high-performance asynchronous request handling, strict Pydantic payload validation, native interactive documentation (OpenAPI / Swagger UI), and modular routing while preserving 100% API compatibility with the React + Vite frontend and existing SQLite schema.

### Core Objectives
1. **1:1 API Parity:** All endpoints across events, registrations, attendance, announcements, and statistics must maintain identical HTTP methods, URL patterns, query parameters, request bodies, and JSON response formats.
2. **Direct SQLite Persistence:** Use Python's standard `sqlite3` engine with WAL mode, foreign key enforcement, row-to-dictionary mapping, and transaction management to match existing database performance without ORM bloat.
3. **Automated Schema & Seeding:** Maintain automated schema initialization and rich sample data seeding on startup so developers can clone and run immediately.
4. **Seamless Full-Stack Orchestration:** Enable concurrent startup of both FastAPI backend (`http://localhost:5000`) and React frontend (`http://localhost:5173`) via standard `npm run dev`.
5. **Comprehensive Automated Testing:** Port the 10-step integration test suite to `pytest` + `httpx.TestClient` validating full API functionality.

---

## 2. Directory Layout & Architecture

```
server/
├── main.py              # FastAPI app instance, CORS middleware, lifespan events, router mounting
├── database.py          # SQLite connection manager, row-to-dict factory, schema setup & transactions
├── seed_data.py         # Seed dataset (organizers, events, sessions, registrations, announcements)
├── schemas.py           # Pydantic schemas for request payloads and response models
├── run.py               # Uvicorn launcher script executing server on 0.0.0.0:5000
├── requirements.txt     # Python dependencies (fastapi, uvicorn, pydantic, httpx, pytest)
├── routers/
│   ├── __init__.py
│   ├── events.py        # /api/events (CRUD, multi-round sessions, search/filter)
│   ├── registrations.py # /api/events/{id}/register, /api/registrations/my, CSV export
│   ├── attendance.py    # /api/registrations/{id}/attendance, /api/attendance/verify
│   ├── announcements.py # /api/announcements (broadcast, event/campus list, delete)
│   └── stats.py         # /api/stats (overview metrics, breakdowns, activity stream)
└── tests/
    ├── __init__.py
    └── test_api.py      # Pytest integration suite replicating all 10 API test scenarios
```

### Full-Stack Proxy Architecture
```
+-------------------------------------------------------------+
|               Client Application (React + Vite)             |
|                  Running on http://localhost:5173            |
+------------------------------+------------------------------+
                               |
                               | HTTP Proxy: /api -> :5000
                               v
+-------------------------------------------------------------+
|             Python FastAPI REST API Server                  |
|                  Running on http://localhost:5000            |
|                                                             |
|  - Framework: FastAPI + Uvicorn                             |
|  - Data Validation: Pydantic v2                             |
|  - Storage Engine: SQLite 3 (WAL mode, Foreign Keys ON)     |
|  - Lifespan: Auto schema migration & seed on startup        |
+-------------------------------------------------------------+
```

---

## 3. Data Schema & Persistence Strategy

### 3.1 SQLite Tables
The database maintains the exact schema defined in `server/eventflow.db`:
- `organizers`: `id` (PK), `name`, `email` (UNIQUE), `department`, `role`, `avatar_url`, `created_at`
- `events`: `id` (PK), `organizer_id` (FK), `title`, `description`, `category`, `venue`, `date`, `start_time`, `end_time`, `registration_deadline`, `capacity`, `registered_count`, `banner_url`, `coordinator_name`, `coordinator_contact`, `status`, `created_at`
- `event_sessions`: `id` (PK), `event_id` (FK CASCADE), `round_name`, `venue_room`, `start_time`, `end_time`, `description`, `order_index`
- `registrations`: `id` (PK), `event_id` (FK CASCADE), `ticket_code` (UNIQUE), `participant_name`, `email`, `phone`, `college`, `department`, `year_of_study`, `registered_at`
- `attendance`: `id` (PK), `registration_id` (FK UNIQUE CASCADE), `event_id` (FK CASCADE), `status`, `check_in_time`
- `announcements`: `id` (PK), `event_id` (FK nullable), `title`, `message`, `priority`, `published_by`, `created_at`

### 3.2 Database Manager (`server/database.py`)
- Standard library `sqlite3` is initialized with `PRAGMA foreign_keys = ON;` and `PRAGMA journal_mode = WAL;`.
- `conn.row_factory = sqlite3.Row` transforms queries into dictionaries for direct JSON serialization.
- Context manager `get_db(db_path=None)` provides automatic transaction committing and rollback on error.
- Default path is loaded from `os.getenv("DB_PATH", "server/eventflow.db")`.

### 3.3 Auto-Seeding (`server/seed_data.py`)
During application startup via the FastAPI `lifespan` handler, `seed_if_empty()` checks if `SELECT COUNT(*) FROM events` is 0. If empty, it populates initial organizers, events, session rounds, registrations, attendance records, and announcements within a single atomic transaction.

---

## 4. API Endpoints & Request/Response Contracts

### 4.1 Health Check
- `GET /api/health`
  - Response: `{"status": "ok", "service": "EventFlow FastAPI REST Server", "timestamp": "ISO8601"}`

### 4.2 Events (`/api/events`)
- `GET /api/events`
  - Query params: `category` (str, optional), `status` (str, optional), `search` (str, optional)
  - Returns: Array of event objects including `organizer_name`, `organizer_department`, `sessions_count`.
- `GET /api/events/{id}`
  - Returns: Event object with nested `sessions: [...]` and `announcements: [...]`.
  - Error: `404` if not found (`{"error": "Event not found"}`).
- `POST /api/events`
  - Payload: `EventCreateSchema` (`title`, `description`, `category`, `venue`, `date`, `start_time`, `end_time`, `registration_deadline`, `capacity`, `coordinator_name`, `coordinator_contact`, `banner_url`, `sessions: [...]`).
  - Returns: `201 Created` with created event object and generated sessions.
- `PUT /api/events/{id}`
  - Payload: `EventUpdateSchema`
  - Behavior: Updates event attributes; if `sessions` array is provided, replaces event sessions.
  - Returns: `{"message": "Event updated successfully"}`.
- `DELETE /api/events/{id}`
  - Behavior: Deletes event and cascade-deletes related sessions, registrations, attendance.
  - Returns: `{"message": "Event deleted successfully"}`.

### 4.3 Registrations (`/api`)
- `POST /api/events/{id}/register`
  - Payload: `RegistrationCreateSchema` (`participant_name`, `email`, `phone`, `college`, `department`, `year_of_study`).
  - Validation:
    - Validates event existence (404).
    - Checks capacity (400 `{"error": "This event has reached its maximum participant limit."}`).
    - Checks duplicate registration by email (409 `{"error": "You are already registered...", "ticket_code": "...", "registration_id": "..."}`).
  - Action: Generates unique code `EVF-2026-XXXX`, inserts registration, inserts attendance record (`status: 'registered'`), increments event `registered_count`.
  - Returns: `201 Created` with full registration details and ticket code.
- `GET /api/registrations/my`
  - Query param: `email` (required)
  - Returns: Array of registration objects joined with event details and attendance status.
- `GET /api/events/{id}/registrations`
  - Query params: `search` (optional), `status` (optional)
  - Returns: Attendee roster for organizer dashboard.
- `GET /api/events/{id}/registrations/export`
  - Returns: `text/csv` attachment named `eventflow-<event_title>-attendees.csv` with standard columns.
- `GET /api/registrations`
  - Query params: `event_id` (optional), `search` (optional), `limit` (default 100)
  - Returns: Global registrations list for admin dashboard.

### 4.4 Attendance (`/api`)
- `PATCH /api/registrations/{id}/attendance`
  - Payload: `AttendanceUpdateSchema` (`status` in `['registered', 'checked_in', 'absent']`)
  - Action: Updates status; sets `check_in_time` to current ISO timestamp if status is `checked_in`.
  - Returns: `{"message": "Attendance marked as ...", "registration_id": "...", "status": "...", "check_in_time": "..."}`.
- `POST /api/attendance/verify`
  - Payload: `TicketVerifySchema` (`ticket_code`, `auto_check_in=True`)
  - Action: Finds registration by ticket code (case-insensitive). If found and `auto_check_in` is True and status is not yet `checked_in`, marks `checked_in` with timestamp.
  - Returns: `{"verified": true, "message": "...", "already_checked_in": bool, "registration": {...}}` (or 404 with `{"verified": false, "error": "..."}`).

### 4.5 Announcements (`/api/announcements`)
- `GET /api/announcements`
  - Query param: `event_id` (optional - if provided, returns event announcements + campus-wide announcements where `event_id` is null).
  - Returns: Array ordered by priority (`urgent` -> `update` -> `info`) then date desc.
- `POST /api/announcements`
  - Payload: `AnnouncementCreateSchema` (`title`, `message`, `priority`, `event_id`, `published_by`).
  - Returns: `201 Created` with created announcement object.
- `DELETE /api/announcements/{id}`
  - Returns: `{"message": "Announcement deleted successfully"}`.

### 4.6 Analytics & Stats (`/api/stats`)
- `GET /api/stats/overview`: Returns `total_events`, `active_events`, `completed_events`, `total_capacity`, `total_registrations`, `unique_participants`, `checked_in_count`, `capacity_utilization_rate`, `attendance_rate`, `total_announcements`.
- `GET /api/stats/department-breakdown`: Registrations grouped by student department.
- `GET /api/stats/category-breakdown`: Event count, total registrations, and total capacity grouped by category.
- `GET /api/stats/activity-log`: Unified timeline of latest registrations and announcements sorted by timestamp desc.

---

## 5. Development Workflow & Root Orchestration

### 5.1 Environment Setup
1. A local virtual environment is created at `.venv/`.
2. Python dependencies installed from `server/requirements.txt`:
   - `fastapi>=0.110.0`
   - `uvicorn[standard]>=0.28.0`
   - `pydantic>=2.6.0`
   - `httpx>=0.27.0`
   - `pytest>=8.0.0`

### 5.2 Root Package Scripts (`package.json`)
```json
{
  "scripts": {
    "dev": "concurrently -n \"SERVER,CLIENT\" -c \"blue,magenta\" \"npm run server\" \"npm run client\"",
    "server": ".venv\\Scripts\\python server/run.py",
    "client": "npm --prefix client run dev",
    "build": "npm --prefix client run build",
    "test": ".venv\\Scripts\\pytest server/tests"
  }
}
```

---

## 6. Testing & Quality Assurance

### 6.1 Pytest Integration Suite (`server/tests/test_api.py`)
An automated suite using `httpx.TestClient` against an ephemeral `test_api.db` SQLite database verifies:
1. `GET /api/events` returns list >= 5 events.
2. `GET /api/events?category=Hackathon` filters accurately.
3. `GET /api/events/{id}` includes nested `sessions` and `announcements`.
4. `POST /api/events` creates event and session records with 201 Created.
5. `POST /api/events/{id}/register` creates registration, generates `EVF-2026-XXXX` ticket, and increments count.
6. `GET /api/registrations/my?email=...` retrieves the student's registered passes.
7. `PATCH /api/registrations/{id}/attendance` updates attendance status.
8. `POST /api/attendance/verify` validates valid ticket and returns verification metadata.
9. `GET /api/events/{id}/registrations/export` outputs valid CSV with required headers.
10. `GET /api/stats/overview` accurately computes overview metrics and rates.

---

## 7. Migration Execution Steps
1. Create virtual environment `.venv` and install `server/requirements.txt`.
2. Create `server/database.py`, `server/seed_data.py`, `server/schemas.py`.
3. Create `server/routers/events.py`, `registrations.py`, `attendance.py`, `announcements.py`, `stats.py`.
4. Create `server/main.py` and `server/run.py`.
5. Implement `server/tests/test_api.py` and run tests until 100% pass.
6. Update root `package.json` scripts and test `npm run dev` with the React frontend.
7. Clean up deprecated Node.js server files from `server/`.
