# EventFlow: Smart Event Coordination Platform - Design Specification

**Date:** 2026-10-04  
**Status:** Approved  
**Target:** Hackathon - PS 2 EventFlow  

---

## 1. Overview & Objectives

**EventFlow** is a modern, centralized digital event coordination platform engineered for college campuses. It bridges the gap between campus organizers (clubs, departments, student councils) and attendees (students, faculty, guests) by delivering real-time event discovery, frictionless multi-round registration, digital QR ticketing, interactive venue/schedule tracking, live announcement broadcasts, and a comprehensive organizer/admin analytics dashboard.

### Core Objectives
1. **Centralized Event Discovery**: Categorized, searchable catalog of campus events with venue, timing, and capacity tracking.
2. **Registration & Pass Generation**: Rapid student registration generating a unique verifiable QR-code digital event ticket.
3. **Interactive Schedules**: Multi-round or multi-session timeline for workshops, hackathons, and symposiums with designated room locations.
4. **Organizer Command Center**: Administrative management for creating/editing events, publishing announcements, tracking registrations, and 1-click CSV export.
5. **Attendance & Verification**: Real-time ticket verification simulation to track attendance status (`Registered` vs `Checked In`).
6. **Live Analytics & Statistics**: Visual breakdown of participant counts, capacity utilization, department distributions, and event statuses.

---

## 2. Tech Stack & Architecture

### Fullstack Architecture (Client-Server with SQLite)
```
+-----------------------------------------------------------------------------------+
|                        Client Application (React + Vite)                         |
|                                                                                   |
|  - UI & Styling: Tailwind CSS, Lucide React Icons                                |
|  - Typography: Akira (Display/Logo), Poppins (Headings), Inter (Body & Data)      |
|  - Portals: Public Participant Portal <---> Organizer & Admin SaaS Dashboard      |
|  - Modules: QR Generator, Interactive Timeline, CSV Exporter, Chart Engine        |
+----------------------------------------+------------------------------------------+
                                         |
                                         | HTTP REST API via Vite Proxy (:5000)
                                         v
+----------------------------------------+------------------------------------------+
|                     Node.js & Express REST API Server                             |
|                                                                                   |
|  - Framework: Express.js with JSON body parser & CORS middleware                 |
|  - Storage Engine: SQLite (better-sqlite3 / sqlite3) with automated migration     |
|  - Seed Engine: Pre-populated with realistic hackathon and campus events           |
|  - Endpoints: /api/events, /api/registrations, /api/announcements, /api/stats    |
+-----------------------------------------------------------------------------------+
```

* **Frontend**: React 18+ (Vite), Tailwind CSS v3, Lucide React icons, Canvas/SVG QR Generator.
* **Backend**: Node.js, Express, `better-sqlite3` or embedded SQLite database with automatic schema setup on boot.
* **Fonts**:
  * **Akira Expanded**: Bold, futuristic display font for the "EVENTFLOW" brand logo, hero taglines, and ticket headers.
  * **Poppins**: Semi-bold/bold weights for section headings, modal titles, and metric cards.
  * **Inter**: Clean, legible sans-serif for body copy, form fields, tables, and badge metadata.

---

## 3. Data Schema & Relationships

### 3.1 Entity-Relationship Model
* `organizers` (1) ───< `events` (N)
* `events` (1) ───< `event_sessions` (N) [Multi-round schedule]
* `events` (1) ───< `registrations` (N)
* `events` (1) ───< `announcements` (N)
* `registrations` (1) ─── (1) `attendance`

### 3.2 SQLite Table Definitions

#### `organizers`
* `id` TEXT PRIMARY KEY
* `name` TEXT NOT NULL
* `email` TEXT NOT NULL UNIQUE
* `department` TEXT NOT NULL
* `role` TEXT NOT NULL DEFAULT 'Club Lead'
* `avatar_url` TEXT
* `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

#### `events`
* `id` TEXT PRIMARY KEY
* `organizer_id` TEXT REFERENCES organizers(id)
* `title` TEXT NOT NULL
* `description` TEXT NOT NULL
* `category` TEXT NOT NULL  -- 'Technical', 'Hackathon', 'Cultural', 'Sports', 'Workshop', 'Seminar'
* `venue` TEXT NOT NULL     -- e.g. 'Main Auditorium', 'Tech Block Hall 3'
* `date` TEXT NOT NULL      -- YYYY-MM-DD
* `start_time` TEXT NOT NULL
* `end_time` TEXT NOT NULL
* `registration_deadline` TEXT NOT NULL
* `capacity` INTEGER NOT NULL DEFAULT 100
* `registered_count` INTEGER NOT NULL DEFAULT 0
* `banner_url` TEXT
* `coordinator_name` TEXT NOT NULL
* `coordinator_contact` TEXT NOT NULL
* `status` TEXT NOT NULL DEFAULT 'upcoming' -- 'upcoming', 'ongoing', 'completed', 'cancelled'
* `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

#### `event_sessions` (Rounds & Schedules)
* `id` TEXT PRIMARY KEY
* `event_id` TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE
* `round_name` TEXT NOT NULL  -- e.g. 'Round 1: Screening Quiz', 'Round 2: Prototype Sprint'
* `venue_room` TEXT NOT NULL   -- e.g. 'CS Lab 201'
* `start_time` TEXT NOT NULL
* `end_time` TEXT NOT NULL
* `description` TEXT
* `order_index` INTEGER NOT NULL DEFAULT 1

#### `registrations`
* `id` TEXT PRIMARY KEY
* `event_id` TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE
* `ticket_code` TEXT NOT NULL UNIQUE -- e.g. 'EVF-2026-X821'
* `participant_name` TEXT NOT NULL
* `email` TEXT NOT NULL
* `phone` TEXT NOT NULL
* `college` TEXT NOT NULL
* `department` TEXT NOT NULL
* `year_of_study` TEXT NOT NULL -- '1st Year', '2nd Year', '3rd Year', '4th Year'
* `registered_at` DATETIME DEFAULT CURRENT_TIMESTAMP

#### `attendance`
* `id` TEXT PRIMARY KEY
* `registration_id` TEXT NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE
* `event_id` TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE
* `status` TEXT NOT NULL DEFAULT 'registered' -- 'registered', 'checked_in', 'absent'
* `check_in_time` DATETIME

#### `announcements`
* `id` TEXT PRIMARY KEY
* `event_id` TEXT REFERENCES events(id) ON DELETE CASCADE -- NULL indicates campus-wide broadcast
* `title` TEXT NOT NULL
* `message` TEXT NOT NULL
* `priority` TEXT NOT NULL DEFAULT 'info' -- 'info', 'update', 'urgent'
* `published_by` TEXT NOT NULL
* `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

---

## 4. REST API Specification

### 4.1 Events Endpoints
* `GET /api/events`  
  * Query params: `search`, `category`, `status`  
  * Returns: Array of event objects with `sessions_count`, `capacity`, `registered_count`.
* `GET /api/events/:id`  
  * Returns: Complete event with joined `event_sessions` ordered by `order_index`, organizer info, and active announcements.
* `POST /api/events`  
  * Body: `{ title, description, category, venue, date, start_time, end_time, registration_deadline, capacity, coordinator_name, coordinator_contact, banner_url, sessions: [...] }`
  * Creates event and associated session rounds atomically.
* `PUT /api/events/:id`  
  * Updates editable fields and session list.
* `DELETE /api/events/:id`  
  * Cascades deletion of registrations, attendance records, and sessions.

### 4.2 Registrations & Passes
* `POST /api/events/:id/register`  
  * Validates deadline and capacity. Generates unique `EVF-YYYY-XXXX` ticket code. Creates matching `attendance` record. Increments `registered_count`.
  * Returns ticket details for immediate client display.
* `GET /api/registrations/my`  
  * Query param: `email`  
  * Returns all events registered by the student with ticket codes and QR data.
* `GET /api/events/:id/registrations`  
  * Returns full attendee roster for organizer view.
* `GET /api/events/:id/registrations/export`  
  * Streams UTF-8 formatted CSV file of all registered participants.

### 4.3 Attendance Verification
* `PATCH /api/registrations/:id/attendance`  
  * Body: `{ status: 'checked_in' | 'registered' }`  
  * Updates attendance record with timestamp.
* `POST /api/attendance/verify`  
  * Body: `{ ticket_code }`  
  * Validates ticket existence and performs check-in. Returns attendee and event details.

### 4.4 Announcements
* `GET /api/announcements`  
  * Optional `?eventId=...`  
  * Returns chronological list of announcements with priority tags.
* `POST /api/announcements`  
  * Body: `{ event_id, title, message, priority, published_by }`

### 4.5 Analytics & Statistics
* `GET /api/stats/overview`  
  * Returns: `{ total_events, active_events, completed_events, total_registrations, unique_participants, overall_capacity_utilization, total_announcements }`
* `GET /api/stats/department-breakdown`  
  * Returns: Registrations count grouped by department.
* `GET /api/stats/category-breakdown`  
  * Returns: Events and registrations grouped by category.
* `GET /api/stats/activity-log`  
  * Returns: Recent registrations, check-ins, and announcements for live activity feed.

---

## 5. UI/UX & Component Architecture

### 5.1 Design Tokens
* **Fonts**:
  * Headings & Logos: Akira (`font-display`) and Poppins (`font-heading`)
  * Body & Controls: Inter (`font-sans`)
* **Color Scheme**:
  * Backgrounds: `bg-slate-50`, `bg-white`, `bg-[#0B0F19]` (Navy dark elements)
  * Accent Brand: Violet `bg-indigo-600` / `hover:bg-indigo-700` (`#4F46E5`, `#6366F1`)
  * Badges: Emerald for `Checked In`, Amber for `Update`, Rose for `Urgent`, Sky for `Technical`.

### 5.2 Top Navigation & Role Switcher
* Persistent top bar featuring:
  * Brand Logo: **EVENTFLOW** in Akira font with a glowing violet accent.
  * Role Switcher Pill:
    * `[ 🧑‍🎓 Participant View ]`
    * `[ 🛠️ Organizer & Admin Dashboard ]`
  * "My Tickets" quick trigger button with badge counter.

### 5.3 Public Participant Portal
1. **Live Announcement Banner**: Top sticky/sub-header alert showing latest urgent notices.
2. **Hero Search & Filter Bar**:
   * Search input with debounce (title, venue, tags).
   * Category filter pills: All, Technical, Hackathons, Cultural, Sports, Workshops, Seminars.
   * Status filter toggle (Upcoming, Happening Now).
3. **Event Card Grid**:
   * Category pill, event date & time pill, venue badge.
   * Capacity progress meter (`85/100 spots filled`).
   * "View Details & Register" action.
4. **Event Details & Schedule Modal**:
   * High-res banner image and full description.
   * **Multi-Round Schedule Timeline**: Vertical timeline rendering sessions with room badges (e.g. *Auditorium 2*), start/end times, and round descriptions.
   * Coordinator contact card.
5. **Registration Form & Digital QR Ticket Modal**:
   * Form fields: Name, Email, Phone, College, Department, Year.
   * Upon submission: Renders a sleek Digital Event Pass featuring:
     * High-contrast SVG QR Code containing `{ ticket_code, event_id, name }`.
     * Clean ticket borders, stub tear-off styling, event metadata.
     * "Save / Print Pass" button.
6. **"My Registrations" View**:
   * Allows attendees to enter their email to retrieve all their passes and event timings.

### 5.4 Organizer & Admin SaaS Dashboard
1. **Collapsible Navy Sidebar**:
   * 📊 Analytics & Overview
   * 📅 Event Manager (Create, Edit, Delete, Rounds Builder)
   * 👥 Registrations & Attendance Roster (Search, Check-in toggle, CSV Export)
   * 📢 Broadcast Center (Create announcements)
   * 🎟️ QR Check-In Scanner (Live ticket code verification simulator)
2. **KPI Analytics Cards**:
   * Total Events, Total Registrations, Average Turnout, Remaining Seats.
   * Visual Charts:
     * Department Participation Distribution (Clean SVG bar chart).
     * Category Distribution (Donut / Progress breakdown).
     * Capacity Fill meters per active event.
3. **Event Manager & Session Builder**:
   * Create/Edit modal with multi-round dynamic builder (add/remove rounds with start/end time and room name).
4. **Registrations & Attendance Table**:
   * Filterable by event.
   * Real-time search by participant name or email.
   * 1-Click attendance toggle (`Registered` ↔ `Checked In`).
   * **"Export CSV"** button for immediate tabular file download.
5. **Broadcast Center**:
   * Target: Campus-Wide or Specific Event.
   * Priority: Info, Update, Urgent.

---

## 6. Seed Data & Hackathon Demo Readiness
The application initializes with rich, realistic campus data:
* **Events**:
  * *TechTrove Hackathon 2026* (Hackathon, 3 Rounds, Main Convention Center)
  * *RoboWars Arena* (Technical, 2 Rounds, Indoor Sports Complex)
  * *AI & Cloud Computing Summit* (Workshop, Hands-on Lab 4)
  * *Cadence Annual Cultural Fest* (Cultural, Open Air Amphitheatre)
  * *Inter-College Badminton Championship* (Sports, Indoor Badminton Court)
* **Pre-seeded Registrations & Attendance**: Real-looking participant records across departments (CSE, IT, ECE, Mech, Civil) to showcase analytics and CSV export instantly without manual data entry.
* **Pre-seeded Announcements**: Live campus notices highlighting schedule changes and venue updates.

---

## 7. Verification & Testing Strategy
* **Automated Backend Tests**:
  * Health check verification.
  * Event CRUD and session ordering.
  * Registration capacity check and unique ticket code generation.
  * Attendance toggle and verification endpoint.
  * Analytics calculation accuracy.
* **Frontend Verification**:
  * Build check via `npm run build`.
  * Seamless navigation between Participant Portal and Admin Portal.
  * Form validation and QR ticket generation verification.
  * Responsive layout tests across mobile, tablet, and desktop viewports.
