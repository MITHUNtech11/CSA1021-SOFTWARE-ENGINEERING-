# Smart Campus Facility Booking and Maintenance Platform
**Course:** CSA10 / CSA1021 - Software Engineering | **Outcome Assessed:** CO3 (Full-Stack & Containers)  
**Student:** S Mithun Senthil | **Register Number:** 192324056 | **Department:** CSE, SIMATS Engineering  

---

## 1. Executive Summary & Application Scope
This repository houses the working, production-grade reference implementation for the **Containerized Full-Stack Smart Campus Facility Booking and Maintenance Platform**. The release supports:
* **Facility & Laboratory Catalogue:** 6 campus facilities with room capacities, building locations, and restricted access governance.
* **Slot Booking with Non-Overlap Validation:** Database and server-level non-overlap constraints, idempotency keys, and instant rejection of conflicting reservation attempts (HTTP 409).
* **Controlled Sensor-Alert Intake & Deduplication:** Real-time telemetry ingestion with `(source, event_id)` deduplication and automated ticket generation with Critical SLA escalation on safety threshold breach.
* **Explainable Maintenance Triage:** Deterministic rule matrix combining Urgency and Teaching Impact to assign priorities and calculate response/resolution SLAs.
* **Maintenance Ticket State Machine:** Full lifecycle enforcement (`intake` → `assigned` → `inspection` → `in_progress` → `resolved` → `closed`) with mandatory technical inspection notes, resolution sign-off, and optimistic concurrency version checking.
* **Role-Based Approvals:** Server-enforced authorization restricting high-impact lab access and changes to Approver/Dean roles (HTTP 403 for unauthorized users).
* **DevOps Integration Outbox:** Idempotent correlation keys for external issue tracking (GitHub/Jira) ensuring local data is never corrupted by third-party timeouts.
* **Audit Trail:** Immutable, chronological audit log capturing every state change with actor, action, and JSON payload.

---

## 2. Architecture & Data Model (10 Core Entities)
1. **Users:** User directory with 6 role tiers (`student`, `faculty`, `technician`, `approver`, `facility_manager`, `admin`).
2. **Facilities:** Physical rooms and laboratories with capacity and restricted access flags.
3. **Bookings:** Reservations with time ranges, idempotency keys, and optimistic concurrency versions.
4. **Sensor Events:** Telemetry intake with unique `(source, event_id)` deduplication constraints.
5. **Tickets:** Incident tracking with explainable triage justification and state machine transitions.
6. **Comments:** Granular technical communication thread for active tickets.
7. **SLA Policies:** Contractual targets for response and resolution times by priority tier.
8. **Approvals:** Governance checkpoint for restricted facilities and equipment loans.
9. **Audit Events:** Append-only transaction and lifecycle event log.
10. **Integration Intents:** Transactional outbox decoupling external issue sync from internal ACID operations.

---

## 3. Quickstart & Deployment Instructions

### Option A: Native Execution (Zero-dependency on Windows)
1. Navigate to the backend directory and seed the database:
   ```powershell
   cd backend
   python seed_data.py
   ```
2. Start the FastAPI backend server:
   ```powershell
   python main.py
   # Serves API at http://localhost:8000
   # Interactive Swagger docs at http://localhost:8000/docs
   ```
3. Open the frontend:
   Open `frontend/index.html` in any web browser, or serve it via Python:
   ```powershell
   cd ../frontend
   python -m http.server 3000
   # Access UI at http://localhost:3000
   ```

### Option B: Containerized Deployment (Docker Compose)
1. Single-Instance Core Release (Task 5):
   ```bash
   docker compose up --build -d
   docker compose ps
   docker compose logs backend
   ```
2. Multi-Instance Concurrency Release (Task 6 - Two Replicas behind Nginx Load Balancer):
   ```bash
   docker compose -f docker-compose.concurrency.yml up --build -d
   ```

---

## 4. Automated Verification & Evidence Test Suite
Run the comprehensive test runner to verify functional correctness, overlap prevention, deduplication, optimistic concurrency, and stepped load testing:
```powershell
python tests/run_all_tests.py
```
This script executes:
1. Unit tests for explainable triage matrix and schema validation.
2. Integration tests for booking creation, status transitions, and role enforcement.
3. Concurrency tests for simultaneous overlapping bookings (proves 1 accepted [201], 1 rejected [409]).
4. Concurrency tests for simultaneous stale ticket updates (proves optimistic locking [409]).
5. Replay deduplication tests (5 identical sensor event IDs produce exactly 1 ticket).
6. Stepped load tests (10, 25, 50 concurrent requests) reporting empirical latencies.
