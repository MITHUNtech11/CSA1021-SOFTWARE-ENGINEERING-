# EventFlow: Smart Campus Event Coordination Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg)](https://www.sqlite.org/)
[![Tests](https://img.shields.io/badge/Pytest-28%20Passed-brightgreen.svg)](server/tests)

**EventFlow** is an end-to-end, full-stack digital event coordination and management ecosystem engineered specifically for university campuses. It bridges the operational divide between student event organizers, academic departments, and attendees by streamlining event discovery, automated multi-round registration, digital QR ticketing, interactive venue navigation, live campus broadcasts, and real-time administrative analytics.

---

## 📌 Problem Statement

### 1. Context & Background
University campuses host a myriad of extracurricular and co-curricular activities every semester—including national hackathons, technical symposiums, research workshops, guest lectures, cultural fests, and athletic tournaments. These events involve hundreds to thousands of student participants across multiple departments, venues, and time slots.

### 2. The Core Problem & Challenges
Despite the volume and importance of campus events, traditional coordination mechanisms remain severely fragmented, inefficient, and manual:
- **Disjointed Discovery & Missed Opportunities**: Event notifications are typically scattered across disparate WhatsApp groups, Instagram stories, physical notice boards, and unstructured mass emails. Students frequently miss registration deadlines or overlap conflicting schedules.
- **Manual, Cumbersome Registration**: Organizers rely on generic Google Forms that do not support automated capacity capping, real-time ticket generation, or validation against duplicate entries.
- **Physical Ticket Inefficiencies & Long Queues**: Paper passes or PDF screenshots cause bottlenecks at venue check-in counters. Verifying registrant eligibility manually is time-consuming and error-prone.
- **Multi-Round / Multi-Session Tracking Difficulties**: Technical hackathons and multi-day conferences often feature multiple rounds (e.g., screening quizzes, prototype demos, final presentations) hosted across various campus rooms and labs. Participants struggle to track when and where they need to report.
- **Lack of Unified Real-Time Communication**: In the event of emergency schedule changes, venue shifts, or round delays, organizers lack an instantaneous broadcast channel targeted to specific event attendees or the campus community.
- **Absent Administrative Analytics**: Department heads and faculty coordinators lack unified visibility into participant turnout, department-wise participation ratios, capacity utilization, and attendance validation without laborious manual spreadsheet reconciliation.

### 3. The Solution: EventFlow
**EventFlow** solves these challenges by providing a centralized, resilient web platform featuring:
1. **Public Participant Portal**: A categorized, searchable event hub with real-time seat availability, multi-round agenda visualization, instant registration, and downloadable digital QR passes.
2. **Organizer Command Center**: A comprehensive administrative dashboard featuring dynamic event and round builders, attendee roster management with 1-click CSV export, priority broadcast notifications, and a simulated QR check-in verification scanner.
3. **High-Performance Architecture**: Powered by a Python FastAPI asynchronous backend, lightweight SQLite relational database with WAL mode and self-healing schema migration, and a React + Vite frontend styled with Tailwind CSS.

---

## 🚀 Key Features

### 🧑‍🎓 Public Participant Portal
- **Centralized Event Discovery**: Search and filter events by keyword, category (*Technical*, *Hackathon*, *Cultural*, *Sports*, *Workshop*, *Seminar*), and status (*Upcoming*, *Ongoing*).
- **Interactive Multi-Round Timeline**: Dynamic breakdown of event rounds and workshop sessions displaying room allocations, start/end times, and round descriptions.
- **Automated Digital QR Passes**: Instant verifiable SVG/Canvas QR ticket generation (`EVF-2026-XXXX`) containing participant and event metadata upon successful registration.
- **"My Tickets" Portal**: Quick retrieval of all active and past registered passes by entering student email.
- **Real-Time Capacity Guards**: Live capacity meters displaying remaining seats; prevents over-registration once full.

### 🛠️ Organizer & Admin Dashboard
- **Executive Analytics Overview**: High-level KPIs tracking total events, active registrations, checked-in attendees, remaining capacity, department distributions, and category breakdowns.
- **Event Lifecycle Management**: Full CRUD operations for creating, updating, and archiving events with custom banners, coordinators, and multi-round sessions.
- **Attendee Roster & 1-Click CSV Export**: Comprehensive registrant table with search, attendance state toggles (`Registered` ↔ `Checked In`), and instant UTF-8 CSV roster download.
- **QR Check-In Scanner Simulation**: Fast ticket verification interface that validates ticket codes and records timestamps automatically.
- **Campus Broadcast Center**: Push campus-wide announcements or event-specific notifications categorized by priority (*Info*, *Update*, *Urgent*).

---

## 🏗️ System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                        Client Application (React + Vite)                         |
|                                                                                   |
|  - Framework: React 18 (Vite 6)                                                   |
|  - UI & Styling: Tailwind CSS v3, Lucide React Icons                             |
|  - Typography: Akira Expanded (Brand/Logo), Poppins (Headings), Inter (Data/Body) |
|  - Modules: QR Canvas Generator, Schedule Timeline, CSV Exporter, Chart Engine   |
|  - Portals: Participant Portal <---> Organizer & Admin Dashboard (Top Switcher)   |
+----------------------------------------+------------------------------------------+
                                         |
                                         | HTTP REST API via Vite Proxy (:5000)
                                         v
+----------------------------------------+------------------------------------------+
|                     FastAPI REST API Server (Python 3.11+)                        |
|                                                                                   |
|  - Framework: FastAPI + Uvicorn (Asynchronous REST API)                           |
|  - Validation: Pydantic v2 Models & Schema Serialization                          |
|  - Database: SQLite 3 with WAL Mode, Foreign Keys & Row-Dict Factory              |
|  - Lifespan Engine: Automated schema initialization & rich demo seeding on boot   |
|  - Routers: /api/events, /api/registrations, /api/attendance, /api/stats, etc.   |
+-----------------------------------------------------------------------------------+
```

### Component Stack
| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Lucide React, Canvas QR Engine |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | SQLite 3 (`server/eventflow.db` with WAL mode & Foreign Keys enabled) |
| **Testing** | Pytest 9+, HTTPX TestClient (28 integration & unit tests) |
| **Tooling** | Concurrently, PostCSS, Autoprefixer |

---

## 🗄️ Database Schema & Entities

The SQLite database schema enforces relational integrity with cascading deletes:

```
organizers (1) ───< events (N)
events (1) ───< event_sessions (N) [Multi-round schedule]
events (1) ───< registrations (N)
events (1) ───< announcements (N)
registrations (1) ─── (1) attendance
```

### Table Specifications
- **`organizers`**: Manages club heads and faculty coordinators (`id`, `name`, `email`, `department`, `role`, `avatar_url`, `created_at`).
- **`events`**: Core event records (`id`, `organizer_id`, `title`, `description`, `category`, `venue`, `date`, `start_time`, `end_time`, `registration_deadline`, `capacity`, `registered_count`, `banner_url`, `coordinator_name`, `coordinator_contact`, `status`, `created_at`).
- **`event_sessions`**: Sequential rounds and workshop sessions (`id`, `event_id`, `round_name`, `venue_room`, `start_time`, `end_time`, `description`, `order_index`).
- **`registrations`**: Attendee registrations (`id`, `event_id`, `ticket_code`, `participant_name`, `email`, `phone`, `college`, `department`, `year_of_study`, `registered_at`).
- **`attendance`**: Verification and check-in audit (`id`, `registration_id`, `event_id`, `status`, `check_in_time`).
- **`announcements`**: Event or campus broadcasts (`id`, `event_id`, `title`, `message`, `priority`, `published_by`, `created_at`).

---

## 🔌 API Reference Overview

All REST API endpoints are prefixed with `/api` and return standardized JSON payloads:

### Events (`/api/events`)
- `GET /api/events` - Retrieve all events (supports `?category=`, `?status=`, `?search=`).
- `GET /api/events/{id}` - Fetch detailed event record with nested sessions and announcements.
- `POST /api/events` - Create a new event with atomic session rounds.
- `PUT /api/events/{id}` - Update event details and rounds.
- `DELETE /api/events/{id}` - Delete event and cascade associated records.

### Registrations & Ticketing (`/api/registrations`)
- `POST /api/events/{id}/register` - Register for an event; returns unique `EVF-2026-XXXX` ticket pass.
- `GET /api/registrations/my?email={email}` - Fetch all tickets associated with an email.
- `GET /api/events/{id}/registrations` - Fetch complete attendee roster for an event.
- `GET /api/events/{id}/registrations/export` - Download attendee roster as a UTF-8 CSV attachment.

### Attendance Verification (`/api/attendance`)
- `POST /api/attendance/verify` - Validate a ticket code and optionally check in the attendee.
- `PATCH /api/registrations/{id}/attendance` - Toggle attendance status (`registered` ↔ `checked_in`).

### Announcements (`/api/announcements`)
- `GET /api/announcements` - Retrieve broadcasts (optional filter `?eventId=`).
- `POST /api/announcements` - Publish a new announcement (*Info*, *Update*, or *Urgent*).
- `DELETE /api/announcements/{id}` - Delete an announcement.

### Analytics & Reporting (`/api/stats`)
- `GET /api/stats/overview` - Aggregate platform metrics and capacity utilization.
- `GET /api/stats/department-breakdown` - Registrations grouped by student department.
- `GET /api/stats/category-breakdown` - Event and registration counts by event type.
- `GET /api/stats/activity-log` - Real-time stream of latest registrations, check-ins, and notices.

---

## 📁 Repository Directory Structure

```text
Capstone/
├── client/                     # Frontend Single Page Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI widgets & modals
│   │   │   ├── admin/          # Admin dashboard & management components
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── AnalyticsOverview.jsx
│   │   │   │   ├── AnnouncementBroadcast.jsx
│   │   │   │   ├── EventFormModal.jsx
│   │   │   │   ├── EventManager.jsx
│   │   │   │   ├── RegistrationsManager.jsx
│   │   │   │   └── TicketScannerModal.jsx
│   │   │   ├── AnnouncementTicker.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── EventDetailModal.jsx
│   │   │   ├── EventFilters.jsx
│   │   │   ├── MyTicketsModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ParticipantPortal.jsx
│   │   │   ├── RegistrationModal.jsx
│   │   │   └── TicketPassModal.jsx
│   │   ├── services/           # API integration layer (Axios/Fetch wrapper)
│   │   ├── styles/             # Typography and custom styling definitions
│   │   ├── utils/              # Client-side QR generation & CSV export helpers
│   │   ├── App.jsx             # Top-level portal controller & state router
│   │   ├── index.css           # Tailwind directives & theme configuration
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Backend REST API Server (Python FastAPI)
│   ├── routers/                # Modular APIRouters
│   │   ├── announcements.py    # Announcement endpoints
│   │   ├── attendance.py       # Check-in and verification endpoints
│   │   ├── events.py           # Event CRUD and session management
│   │   ├── registrations.py    # Registration handling & CSV streaming
│   │   └── stats.py            # Aggregated analytics and reporting
│   ├── tests/                  # Pytest automated test suite
│   │   ├── conftest.py
│   │   ├── test_api.py         # Full end-to-end integration flows
│   │   ├── test_attendance.py
│   │   ├── test_database.py
│   │   ├── test_events.py
│   │   ├── test_health.py
│   │   ├── test_registrations.py
│   │   └── test_stats_announcements.py
│   ├── database.py             # SQLite connection manager, schema & migrations
│   ├── eventflow.db            # Embedded SQLite database file
│   ├── main.py                 # FastAPI application instance & middleware
│   ├── requirements.txt        # Python backend dependencies
│   ├── run.py                  # Uvicorn launcher script
│   ├── schemas.py              # Pydantic v2 data models
│   └── seed_data.py            # Initial dataset (events, rounds, attendees)
├── docs/                       # Project specifications and implementation plans
├── package.json                # Root orchestration scripts
└── README.md                   # Capstone project documentation
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or later & `npm`
- **Python**: v3.11 or later

---

### Step 1: Clone and Navigate to Capstone Directory
```bash
cd Capstone
```

### Step 2: Set Up Backend (Python Virtual Environment)
```bash
# Create Python virtual environment
python -m venv .venv

# Activate the virtual environment
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Windows Command Prompt:
.venv\Scripts\activate.bat
# On macOS / Linux:
source .venv/bin/activate

# Install backend dependencies
pip install -r server/requirements.txt
```

### Step 3: Set Up Frontend (Client Dependencies)
```bash
cd client
npm install
cd ..
```

### Step 4: Run the Full Application Concurrently
From the `Capstone/` root directory, launch both backend and frontend with a single command:
```bash
npm run dev
```

This concurrently boots:
- **Backend API**: `http://localhost:5000`
- **Interactive Swagger Docs**: `http://localhost:5000/docs`
- **Frontend Web App**: `http://localhost:5173`

> **Note**: Database schema initialization and sample event seeding occur automatically upon the first backend launch.

---

## 🧪 Testing & Verification

The project includes an automated test suite with **28 tests** covering all API endpoints, database constraints, registration validation, and analytics calculations.

To execute the test suite:
```bash
# Using root npm command
npm test

# Or directly with pytest
.venv\Scripts\pytest server/tests -v
```

### Test Coverage Highlights
- ✅ **Health Check**: Service health endpoint verification.
- ✅ **Database Layer**: Schema creation, table constraints, foreign key enforcement, WAL mode, transaction rollback.
- ✅ **Events Router**: Event creation, session ordering, update, retrieval, search filters, and cascading deletion.
- ✅ **Registrations Router**: Successful registration, duplicate registration rejection (409 Conflict), capacity overflow protection (400 Bad Request), and UTF-8 CSV roster export.
- ✅ **Attendance Router**: Ticket verification (`EVF-2026-XXXX`), idempotent check-in timestamps, invalid code rejection.
- ✅ **Stats & Announcements**: Department breakdowns, category aggregations, zero-division resilience, and broadcast management.

---

## 👥 Contributors & Course Context

- **Course**: CSA1021 - Software Engineering
- **Project**: Capstone Project - EventFlow
- **Academic Year**: 2026
