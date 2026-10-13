# EventFlow: Smart Campus Event Coordination Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud%20Postgres-3ECF8E.svg)](https://supabase.com/)
[![Typography](https://img.shields.io/badge/Typography-Poppins%20(300--900)-indigo.svg)](https://fonts.google.com/specimen/Poppins)
[![Tests](https://img.shields.io/badge/Pytest-28%20Passed-brightgreen.svg)](server/tests)

**EventFlow** is an enterprise-grade, full-stack digital campus event coordination and operational platform engineered for university ecosystems. It unites student organizers, academic departments, and attendees into a unified digital workspace—streamlining event discovery, multi-round schedule navigation, digital QR ticketing, rapid check-in verification, priority emergency broadcasts, and real-time analytics.

EventFlow features a resilient **dual-mode architecture** powered by **Supabase Cloud PostgreSQL** with Row-Level Security (RLS) policies alongside an automated, seamless fallback to a local **FastAPI + SQLite** backend engine. The user interface is crafted with a complete 6-tier **Poppins typography hierarchy** (weights 300 to 900), modern glassmorphism, vivid gradients, and fluid micro-interactions.

---

## 📌 Problem Statement

### 1. Context & Campus Operations
Modern university campuses host dozens of extracurricular and co-curricular programs each semester—ranging from 36-hour hackathons and technical symposiums to research workshops, guest lectures, cultural galas, and athletic tournaments. These events coordinate thousands of students, faculty mentors, and venues across academic departments.

### 2. Operational Challenges
Traditional campus event coordination is fraught with structural inefficiencies:
- **Disjointed Discovery & Scheduling Conflicts**: Announcements are scattered across transient social media stories, messaging chats, and physical notice boards. Students miss registration deadlines or double-book overlapping schedules.
- **Manual, Uncapped Registration**: Standard Google Forms lack real-time capacity capping, duplicate prevention, and automated credential generation.
- **Check-In Bottlenecks & Long Queues**: Paper passes and unverified screenshots cause delays at auditorium entrances.
- **Multi-Round / Multi-Room Session Tracking**: Multi-track hackathons and multi-day symposia feature distinct rounds (preliminary screening, mentoring, semifinals, final pitching) held across varied campus halls. Attendees frequently lose track of reporting venues.
- **Fragmented Emergency Communication**: When rooms change or round timings shift, organizers lack an instantaneous bulletin broadcast directly on the participant portal.
- **Absent Executive Analytics**: Faculty leads lack real-time visibility into attendance rates, department engagement distributions, and capacity utilization.

### 3. The Solution: EventFlow
EventFlow solves these operational challenges through:
1. **Public Participant Portal**: Searchable event catalog with category filters, dynamic capacity indicators, interactive multi-round session timelines, and instant verifiable QR ticket generation.
2. **Digital Pass Management**: "My Passes" portal for participants to retrieve and display their digital QR credentials with one click.
3. **Organizer & Admin SaaS Dashboard**: Centralized command center for event and multi-round creation, attendee roster management, 1-click UTF-8 CSV exports, priority broadcasts, and a simulated optical QR check-in scanner.
4. **Cloud Database with Resilient Failover**: Direct Supabase Cloud PostgreSQL integration via `@supabase/supabase-js` with RLS security policies, coupled with transparent local fallback to FastAPI + SQLite.

---

## 🎨 Poppins Typography & Modern Design System

EventFlow incorporates a cohesive, calibrated **Poppins typography scale** across all UI surfaces:

| Weight Tier | Token | Usage & Scope |
|---|---|---|
| **Light** (`300`) | `font-light` | Timestamps, room codes, subtle metadata badges, secondary help text. |
| **Regular** (`400`) | `font-normal` | Body copy, event summaries, broadcast descriptions, input placeholder copy. |
| **Medium** (`500`) | `font-medium` | Form labels, table cells, navigation pills, secondary action triggers. |
| **SemiBold** (`600`) | `font-semibold` | Event card titles, modal subheaders, metric numbers, status tags, round badges. |
| **Bold** (`700`) | `font-bold` | Section headings, dialog titles, table headers, primary action CTAs. |
| **ExtraBold / Black** (`800`/`900`) | `font-extrabold` | Brand identity ("EVENTFLOW"), hero banners, QR ticket headers, KPI counters. |

### Aesthetic Polish & Micro-Interactions
- **Glassmorphic Surfaces**: Translucent dialogs and cards using `backdrop-blur-md bg-white/95` and hairline borders (`border-slate-200/90`).
- **Brand Gradients**: Vivid indigo-violet gradients (`bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700`) on hero headers, primary buttons, and ticket passes.
- **Hover Transitions**: Elevated card lifts (`hover:-translate-y-1 hover:shadow-xl transition-all duration-300`) and active button spring feedback (`active:scale-95`).
- **Dynamic Capacity Gauges**: Real-time visual progress bars shifting dynamically from brand blue-violet to warning rose as capacity reaches 90%+.

---

## ☁️ Supabase Cloud Database Architecture

EventFlow is architected with a **Dual-Mode Data Layer** allowing zero-configuration local development while offering full cloud production readiness:

```
+-----------------------------------------------------------------------------------+
|                        Client Application (React + Vite)                         |
|                                                                                   |
|  - Typography: Complete Poppins Hierarchy (Weights 300 to 900)                   |
|  - UI Shell: Participant Portal <---> Organizer & Admin Dashboard                |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                  Unified Data Service Layer (client/src/services/api.js)          |
|                                                                                   |
|  Check: isSupabaseConfigured() via VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY     |
+----------------------------------------+------------------------------------------+
                   |                                                    |
         [YES: Supabase Configured]                            [NO: Fallback Mode]
                   |                                                    |
                   v                                                    v
+--------------------------------------+             +------------------------------+
|        @supabase/supabase-js         |             |      Vite Proxy -> FastAPI   |
|        PostgreSQL Cloud Database     |             |      Local SQLite Backend    |
|  - Row Level Security (RLS) Active   |             |      http://localhost:5000   |
|  - Real-Time Queries & Mutations     |             +------------------------------+
+--------------------------------------+
```

### Supabase Setup Instructions
To connect EventFlow directly to your Supabase Cloud project:

1. **Create a Supabase Project**: Sign up at [supabase.com](https://supabase.com) and create a new project.
2. **Execute Schema & Seed Script**:
   - Open the **SQL Editor** in your Supabase dashboard.
   - Paste the contents of [`Capstone/supabase/schema.sql`](supabase/schema.sql) and run it.
   - This creates all 6 core tables (`organizers`, `events`, `event_sessions`, `registrations`, `attendance`, `announcements`), enables Row-Level Security (RLS) policies, establishes trigger functions for automated capacity counters, and inserts rich realistic seed data.
3. **Configure Environment Variables**:
   - In `Capstone/client/`, create a `.env` file based on `.env.example`:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-public-key
     ```
4. **Boot Client**:
   - Run `npm --prefix client run dev`.
   - The top navigation bar will automatically display the **"Supabase Cloud"** status badge with an active green beacon indicator.
   - If `.env` is omitted or keys are blank, EventFlow automatically falls back to the local FastAPI + SQLite backend without errors.

---

## 🗄️ Database Entities & Relational Schema

```
organizers (1) ───< events (N)
events (1) ───< event_sessions (N) [Multi-round schedule]
events (1) ───< registrations (N)
events (1) ───< announcements (N)
registrations (1) ─── (1) attendance
```

### Table Specifications
- **`organizers`**: Club heads and faculty coordinators (`id`, `name`, `email`, `department`, `role`, `avatar_url`, `created_at`).
- **`events`**: Core event records (`id`, `organizer_id`, `title`, `description`, `category`, `venue`, `date`, `start_time`, `end_time`, `registration_deadline`, `capacity`, `registered_count`, `banner_url`, `coordinator_name`, `coordinator_contact`, `status`, `created_at`).
- **`event_sessions`**: Sequential rounds and workshop sessions (`id`, `event_id`, `round_name`, `venue_room`, `start_time`, `end_time`, `description`, `order_index`).
- **`registrations`**: Attendee registrations (`id`, `event_id`, `ticket_code`, `participant_name`, `email`, `phone`, `college`, `department`, `year_of_study`, `registered_at`).
- **`attendance`**: Verification and check-in records (`id`, `registration_id`, `event_id`, `status`, `check_in_time`).
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
- `POST /api/attendance/verify` - Validate a ticket code and check in the attendee.
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
│   │   │   ├── admin/          # Organizer SaaS dashboard components
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
│   │   ├── services/           # Unified API Layer & Supabase Client
│   │   │   ├── api.js          # Dual-mode API query engine
│   │   │   └── supabaseClient.js # Supabase SDK initialization
│   │   ├── styles/             # Typography and custom styling definitions
│   │   │   └── fonts.css       # Poppins hierarchy & weight utility classes
│   │   ├── utils/              # Client-side QR generation & CSV export helpers
│   │   ├── App.jsx             # Top-level portal controller & state router
│   │   ├── index.css           # Tailwind directives & Poppins default font rules
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Supabase credentials template
│   ├── package.json
│   ├── tailwind.config.js      # Complete Poppins weights 300-900 configured
│   └── vite.config.js
├── server/                     # Backend REST API Server (Python FastAPI)
│   ├── routers/                # Modular APIRouters
│   │   ├── announcements.py    # Announcement endpoints
│   │   ├── attendance.py       # Check-in and verification endpoints
│   │   ├── events.py           # Event CRUD and session management
│   │   ├── registrations.py    # Registration handling & CSV streaming
│   │   └── stats.py            # Aggregated analytics and reporting
│   ├── tests/                  # Pytest automated test suite (28 Tests)
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
├── supabase/                   # Supabase Cloud Database Assets
│   ├── schema.sql              # PostgreSQL DDL, RLS policies, trigger counters & seeds
│   └── README.md               # Supabase setup & deployment guide
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

*(Optional)* To enable Supabase Cloud mode:
```bash
cp client/.env.example client/.env
# Open client/.env and insert your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### Step 4: Run the Application Concurrently
From the `Capstone/` root directory:
```bash
npm run dev
```

This concurrently boots:
- **Backend API**: `http://localhost:5000`
- **Interactive Swagger Docs**: `http://localhost:5000/docs`
- **Frontend Web App**: `http://localhost:5173`

---

## 🧪 Testing & Verification

EventFlow includes an automated Pytest test suite with **28 tests** covering all API endpoints, database constraints, registration validation, and analytics calculations, along with full client build validation.

To run tests and build verification:
```bash
# Execute backend test suite
.venv\Scripts\pytest server/tests -v

# Execute frontend production build
npm --prefix client run build
```

### Test Coverage Highlights
- ✅ **Health Check**: Service health endpoint verification.
- ✅ **Database Layer**: Schema creation, table constraints, foreign key enforcement, WAL mode, transaction rollback.
- ✅ **Events Router**: Event creation, session ordering, update, retrieval, search filters, and cascading deletion.
- ✅ **Registrations Router**: Successful registration, duplicate registration rejection (409 Conflict), capacity overflow protection (400 Bad Request), and UTF-8 CSV roster export.
- ✅ **Attendance Router**: Ticket verification (`EVF-2026-XXXX`), idempotent check-in timestamps, invalid code rejection.
- ✅ **Stats & Announcements**: Department breakdowns, category aggregations, zero-division resilience, and broadcast management.
- ✅ **Frontend Build**: 100% clean Vite production bundle with zero JSX or styling syntax errors.

---

## 👥 Contributors & Course Context

- **Course**: CSA1021 - Software Engineering
- **Project**: Capstone Project - EventFlow
- **Academic Year**: 2026
