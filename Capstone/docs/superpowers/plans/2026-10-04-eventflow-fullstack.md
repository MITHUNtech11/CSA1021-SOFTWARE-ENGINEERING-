# EventFlow Implementation Plan: Full-Stack College Event Platform

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive, full-stack college event coordination platform (EventFlow) with Express + SQLite backend and React + Tailwind CSS frontend, featuring multi-round event schedules, digital QR ticket passes, registration management with CSV export, real-time announcements, attendance check-in, and an organizer/admin SaaS analytics dashboard.

**Architecture:** Client-server architecture with an Express.js REST API backed by an SQLite relational database with auto-seeding, and a React + Vite frontend styled with Tailwind CSS, Lucide icons, and Akira/Poppins/Inter typography. A unified root orchestrates both frontend and backend concurrently.

**Tech Stack:** React 18, Vite, Tailwind CSS, Lucide React, Express, SQLite (`better-sqlite3` / `sqlite3`), Node.js.

**Spec:** [docs/superpowers/specs/2026-10-04-eventflow-design.md](file:///C:/Users/mithu/OneDrive/Desktop/techtrove3%20hackathon/docs/superpowers/specs/2026-10-04-eventflow-design.md)

## Global Constraints
- Typography: Brand logo & display in Akira Expanded, Section headings in Poppins, UI & data in Inter.
- Database: Embedded SQLite with self-healing automatic schema creation and rich realistic pre-seeded hackathon data.
- API Endpoints: All prefixed with `/api/`, proxied seamlessly via Vite dev server.
- Execution: Single command `npm run dev` starts both backend (:5000) and frontend (:5173).
- Responsive: Fully adaptive for Mobile (<640px), Tablet (640-1024px), and Desktop (>1024px).

## Review Focus
1. **Capacity Overflow**: When an event reaches maximum capacity, the registration endpoint and UI must disable registration and display "Event Full".
2. **Registration Deadline**: Registrations attempted after the deadline must be rejected with a user-friendly error message.
3. **Unique Ticket Generation**: Every registration must receive a guaranteed unique `EVF-2026-XXXX` ticket code with an SVG QR pass.
4. **Attendance Idempotency**: Checking in an attendee multiple times or verifying an invalid ticket code must be handled gracefully without crashing.
5. **CSV Integrity**: Exporting registrations must correctly format commas, quotes, and UTF-8 characters so spreadsheets open cleanly.

---

### Task 1: Full-stack Project Scaffolding & Configuration

**Files:**
- Create: `package.json`
- Create: `server/package.json`
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/index.html`
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`
- Create: `client/src/index.css`

**Interfaces:**
- Consumes: Node runtime, npm packages
- Produces: Runnable full-stack development environment where `npm run dev` boots both Express (:5000) and Vite (:5173) with API proxying.

- [ ] **Step 1: Create root package.json with workspace scripts and concurrently**
- [ ] **Step 2: Initialize server directory with Express, CORS, and SQLite dependencies**
- [ ] **Step 3: Initialize client directory with Vite, React, Tailwind CSS, and Lucide React**
- [ ] **Step 4: Configure client/index.html to import Akira, Poppins, and Inter typography**
- [ ] **Step 5: Verify build with `npm run build` and test server boot**
- [ ] **Step 6: Commit changes**
```bash
git add .
git commit -m "chore: scaffold full-stack EventFlow project structure"
```

---

### Task 2: Backend SQLite Database Engine & Pre-seeded Hackathon Data

**Files:**
- Create: `server/db.js`
- Create: `server/seedData.js`
- Test: `server/tests/db.test.js`

**Interfaces:**
- Consumes: SQLite driver (`better-sqlite3` or `sqlite3`)
- Produces: Database connection helper `getDb()` exporting tables `organizers`, `events`, `event_sessions`, `registrations`, `attendance`, `announcements`.

- [ ] **Step 1: Write database unit test verifying schema creation and seed data insertion**
```javascript
// test that getDb() initializes tables and seeds at least 5 realistic events
```
- [ ] **Step 2: Implement SQLite schema setup in `server/db.js` with cascading deletes**
- [ ] **Step 3: Implement rich campus seed dataset in `server/seedData.js` (TechTrove Hackathon, RoboWars, CADENCE Fest, AI Summit, Badminton Open) with multi-round schedules, realistic student registrations, and live announcements**
- [ ] **Step 4: Run test to verify all tables and seeds initialize cleanly**
- [ ] **Step 5: Commit changes**
```bash
git add server/
git commit -m "feat(backend): implement SQLite schema and rich campus seed engine"
```

---

### Task 3: Backend REST API Endpoints & Verification Logic

**Files:**
- Create: `server/index.js`
- Create: `server/routes/events.js`
- Create: `server/routes/registrations.js`
- Create: `server/routes/attendance.js`
- Create: `server/routes/announcements.js`
- Create: `server/routes/stats.js`
- Test: `server/tests/api.test.js`

**Interfaces:**
- Consumes: `server/db.js`
- Produces: Full REST API under `/api/`:
  - `GET /api/events`, `GET /api/events/:id`, `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id`
  - `POST /api/events/:id/register`, `GET /api/registrations/my`, `GET /api/events/:id/registrations`, `GET /api/events/:id/registrations/export`
  - `PATCH /api/registrations/:id/attendance`, `POST /api/attendance/verify`
  - `GET /api/announcements`, `POST /api/announcements`
  - `GET /api/stats/overview`, `GET /api/stats/department-breakdown`, `GET /api/stats/category-breakdown`, `GET /api/stats/activity-log`

- [ ] **Step 1: Write integration tests in `server/tests/api.test.js` testing event retrieval, registration creation, ticket verification, and stats**
- [ ] **Step 2: Implement `server/routes/events.js` supporting search, category filter, and multi-round session joins**
- [ ] **Step 3: Implement `server/routes/registrations.js` with capacity checks, ticket code generation (`EVF-2026-XXXX`), and CSV streaming export**
- [ ] **Step 4: Implement `server/routes/attendance.js` and `server/routes/announcements.js`**
- [ ] **Step 5: Implement `server/routes/stats.js` calculating dynamic metrics (total registrations, capacity utilization, department counts)**
- [ ] **Step 6: Run tests to verify all endpoints pass**
```bash
node server/tests/api.test.js
```
- [ ] **Step 7: Commit changes**
```bash
git add server/
git commit -m "feat(backend): complete Express REST API controllers and routes"
```

---

### Task 4: Client API Service, Utilities & Typography Setup

**Files:**
- Create: `client/src/services/api.js`
- Create: `client/src/utils/qrCode.js`
- Create: `client/src/utils/csvExport.js`
- Create: `client/src/styles/fonts.css`

**Interfaces:**
- Consumes: Browser Fetch API
- Produces:
  - `api` service methods: `fetchEvents`, `fetchEventById`, `createEvent`, `updateEvent`, `deleteEvent`, `registerForEvent`, `getMyRegistrations`, `fetchRegistrations`, `toggleAttendance`, `verifyTicket`, `fetchAnnouncements`, `createAnnouncement`, `fetchStats`
  - `generateQrSvg(data, size)`: pure SVG QR code builder without external bloat
  - `downloadCsv(filename, rows)`: instant client CSV trigger

- [ ] **Step 1: Implement `client/src/services/api.js` with centralized error handling and JSON parsing**
- [ ] **Step 2: Implement standalone SVG QR generator in `client/src/utils/qrCode.js`**
- [ ] **Step 3: Implement CSV download helper in `client/src/utils/csvExport.js`**
- [ ] **Step 4: Configure `client/src/styles/fonts.css` with Akira Expanded font face and Tailwind font families**
- [ ] **Step 5: Verify build with `npm run build --prefix client`**
- [ ] **Step 6: Commit changes**
```bash
git add client/src/
git commit -m "feat(client): setup API service, SVG QR generator, and typography"
```

---

### Task 5: Participant Portal: Navigation, Live Announcements & Event Discovery

**Files:**
- Create: `client/src/components/Navbar.jsx`
- Create: `client/src/components/AnnouncementTicker.jsx`
- Create: `client/src/components/EventFilters.jsx`
- Create: `client/src/components/EventCard.jsx`
- Create: `client/src/components/EventDetailModal.jsx`
- Create: `client/src/components/ParticipantPortal.jsx`

**Interfaces:**
- Consumes: `api.fetchEvents`, `api.fetchAnnouncements`
- Produces: Interactive student discovery view with live filtering, category pills, spots-remaining capacity meters, and multi-round timeline modal with room badges.

- [ ] **Step 1: Build `Navbar.jsx` featuring Akira brand logo, navigation tabs, and 1-click Role Switcher**
- [ ] **Step 2: Build `AnnouncementTicker.jsx` displaying live urgent alerts with priority badges**
- [ ] **Step 3: Build `EventFilters.jsx` with real-time search and category pills (Technical, Hackathons, Cultural, Sports, Workshops, Seminars)**
- [ ] **Step 4: Build `EventCard.jsx` showing date badges, venue, capacity progress bar, and registration status**
- [ ] **Step 5: Build `EventDetailModal.jsx` rendering full description, coordinator details, and the multi-round schedule timeline with room tags**
- [ ] **Step 6: Integrate all into `ParticipantPortal.jsx` and verify rendering in browser**
- [ ] **Step 7: Commit changes**
```bash
git add client/src/components/
git commit -m "feat(client): build Participant Portal with discovery, filters, and schedule timeline"
```

---

### Task 6: Participant Registration Flow & Digital QR Ticket Pass

**Files:**
- Create: `client/src/components/RegistrationModal.jsx`
- Create: `client/src/components/TicketPassModal.jsx`
- Create: `client/src/components/MyTicketsModal.jsx`

**Interfaces:**
- Consumes: `api.registerForEvent`, `api.getMyRegistrations`, `generateQrSvg`
- Produces: Instant student registration modal, interactive digital event boarding pass with QR code, and "My Tickets" retrieval drawer.

- [ ] **Step 1: Build `RegistrationModal.jsx` with form validation (Name, Email, Phone, College, Department, Year)**
- [ ] **Step 2: Build `TicketPassModal.jsx` with boarding-pass styling, Akira header, SVG QR code, event room & timing, and Print/Save button**
- [ ] **Step 3: Build `MyTicketsModal.jsx` enabling students to search by email to retrieve all their registered passes**
- [ ] **Step 4: Test end-to-end registration flow: register -> generate QR pass -> view in My Tickets**
- [ ] **Step 5: Commit changes**
```bash
git add client/src/components/
git commit -m "feat(client): implement registration modal, QR ticket pass, and My Tickets view"
```

---

### Task 7: Organizer & Admin Dashboard: Analytics & Event Manager

**Files:**
- Create: `client/src/components/admin/AdminLayout.jsx`
- Create: `client/src/components/admin/AnalyticsOverview.jsx`
- Create: `client/src/components/admin/EventManager.jsx`
- Create: `client/src/components/admin/EventFormModal.jsx`

**Interfaces:**
- Consumes: `api.fetchStats`, `api.fetchEvents`, `api.createEvent`, `api.updateEvent`, `api.deleteEvent`
- Produces: Deep navy SaaS dashboard with collapsible sidebar, KPI metrics cards, department distribution charts, capacity gauges, and event creation modal with dynamic session/round builder.

- [ ] **Step 1: Build `AdminLayout.jsx` with collapsible Navy sidebar and tab router**
- [ ] **Step 2: Build `AnalyticsOverview.jsx` with KPI cards (Total Events, Active, Registrations, Capacity) and interactive visual charts (department breakdown, category distribution)**
- [ ] **Step 3: Build `EventManager.jsx` table with quick filters, status badges, edit, and delete actions**
- [ ] **Step 4: Build `EventFormModal.jsx` with dynamic "Add Round / Session" builder (Round name, room location, start/end time)**
- [ ] **Step 5: Verify creating and editing events with multiple rounds updates state and persists in SQLite**
- [ ] **Step 6: Commit changes**
```bash
git add client/src/components/admin/
git commit -m "feat(admin): build Analytics dashboard and dynamic Event Manager with session builder"
```

---

### Task 8: Organizer & Admin Dashboard: Registrations, Attendance & Broadcast Center

**Files:**
- Create: `client/src/components/admin/RegistrationsManager.jsx`
- Create: `client/src/components/admin/TicketScannerModal.jsx`
- Create: `client/src/components/admin/AnnouncementBroadcast.jsx`

**Interfaces:**
- Consumes: `api.fetchRegistrations`, `api.toggleAttendance`, `api.verifyTicket`, `api.createAnnouncement`, `downloadCsv`
- Produces: Attendee roster table with live search, 1-click check-in toggle, CSV export, ticket scanner simulator, and broadcast creation form.

- [ ] **Step 1: Build `RegistrationsManager.jsx` with event dropdown filter, attendee search, and status pills**
- [ ] **Step 2: Add 1-click attendance toggle (`Registered` ↔ `Checked In`) with instant feedback**
- [ ] **Step 3: Implement "Export CSV" button generating clean attendee roster download**
- [ ] **Step 4: Build `TicketScannerModal.jsx` simulator to verify ticket codes and check-in attendees**
- [ ] **Step 5: Build `AnnouncementBroadcast.jsx` allowing organizers to publish Urgent, Update, or Info announcements**
- [ ] **Step 6: Verify registration status toggling, CSV download, and announcement broadcasting**
- [ ] **Step 7: Commit changes**
```bash
git add client/src/components/admin/
git commit -m "feat(admin): implement registrations roster, attendance toggle, CSV export, and broadcast center"
```

---

### Task 9: System Integration, Polish & Production Verification

**Files:**
- Modify: `client/src/App.jsx`
- Test: Full end-to-end integration

**Interfaces:**
- Consumes: Participant Portal, Admin Dashboard, Role Switcher
- Produces: Flawless, responsive, production-ready hackathon demonstration.

- [ ] **Step 1: Connect seamless top role switcher between Participant Portal and Admin Portal in `App.jsx`**
- [ ] **Step 2: Verify responsive design on mobile (375px), tablet (768px), and desktop (1280px)**
- [ ] **Step 3: Run backend integration tests and verify 100% pass rate**
- [ ] **Step 4: Run production build `npm run build` and ensure clean output**
- [ ] **Step 5: Commit final polish**
```bash
git add .
git commit -m "feat: complete EventFlow platform integration and production verification"
```
