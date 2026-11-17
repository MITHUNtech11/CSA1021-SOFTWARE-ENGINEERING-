# Supabase Integration & Poppins Styling Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Supabase as the primary cloud database layer with complete PostgreSQL migration scripts and failover support, while elevating the entire frontend with a comprehensive Poppins typography scale (weights 300 to 900) and premium modern styling.

**Architecture:** Client-server hybrid architecture where the React application natively interfaces with Supabase via `@supabase/supabase-js` when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided, with seamless fallback to the local FastAPI REST API. The design system transitions entirely to Google Fonts Poppins with modern glassmorphism, elevated card micro-interactions, vibrant gradients, and responsive layout polish.

**Tech Stack:** React 18, Vite 6, Tailwind CSS 3, `@supabase/supabase-js`, Lucide React, Python FastAPI, SQLite, Pytest.

**Spec:** `Capstone/docs/superpowers/specs/2026-10-13-supabase-poppins-styling-design.md`

## Global Constraints

- Poppins typography must be implemented across all 6 weight tiers: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800/900 (ExtraBold).
- Supabase schema must run cleanly in Supabase SQL Editor with full RLS policies and pre-seeded realistic campus data.
- The React application must gracefully handle absent Supabase environment variables without crashing, falling back to local API endpoints or mock state.
- Existing local Python backend tests (`npm test` / 28 pytest tests) must remain 100% green.
- Client build (`npm --prefix client run build`) must compile cleanly with 0 errors.

## Review Focus

1. **Missing Supabase Credentials**: When `VITE_SUPABASE_URL` is undefined or blank, `isSupabaseConfigured()` must return `false`, and API calls must route to local `/api` or local mock data without uncaught Promise rejections.
2. **Duplicate Registration in Supabase**: Registering twice with the same email for an event in Supabase mode must enforce unique constraints and return a 409 Conflict error with ticket details.
3. **Capacity Overflow**: Registrations attempted on events with `registered_count >= capacity` in Supabase mode must reject with a user-friendly error message.
4. **Font Loading & Fallback**: Poppins font must render cleanly with system sans-serif fallback if external Google Fonts cannot be fetched.
5. **CSV Roster Export**: CSV downloads in both Supabase mode and local mode must include proper UTF-8 headers and format commas/quotes safely.

---

### Task 1: Supabase PostgreSQL Schema & Migration Script

**Files:**
- Create: `Capstone/supabase/schema.sql`
- Create: `Capstone/supabase/README.md`

**Interfaces:**
- Consumes: PostgreSQL 15+ syntax on Supabase
- Produces: Complete table structure (`organizers`, `events`, `event_sessions`, `registrations`, `attendance`, `announcements`), RLS security policies, and seed data.

- [ ] **Step 1: Write `Capstone/supabase/schema.sql`**
  Includes table creations with UUID primary keys, foreign key constraints, cascading deletes, Row Level Security (RLS) policies for public and authenticated access, and seed inserts for events, sessions, registrations, and announcements.
- [ ] **Step 2: Write `Capstone/supabase/README.md`**
  Detailed instructions on setting up a free Supabase project, executing `schema.sql` in the Supabase SQL Editor, and obtaining `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] **Step 3: Verify SQL syntax**
  Check that all foreign keys reference valid tables, UUID defaults are set, and RLS policies do not lock out student registrations.
- [ ] **Step 4: Commit**
  ```bash
  git add Capstone/supabase/
  git commit -m "feat(supabase): add postgres schema, rls policies, seed data, and guide"
  ```

---

### Task 2: Supabase Client Integration & Fallback Data Adapter

**Files:**
- Modify: `Capstone/client/package.json`
- Create: `Capstone/client/.env.example`
- Create: `Capstone/client/src/services/supabaseClient.js`
- Modify: `Capstone/client/src/services/api.js`

**Interfaces:**
- Consumes: `@supabase/supabase-js`, environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Produces: `api` object methods (`fetchEvents`, `fetchEventById`, `createEvent`, `updateEvent`, `deleteEvent`, `registerForEvent`, `getMyRegistrations`, `fetchRegistrations`, `toggleAttendance`, `verifyTicket`, `fetchAnnouncements`, `createAnnouncement`, `deleteAnnouncement`, `fetchStatsOverview`, etc.) operating in Supabase mode or fallback mode.

- [ ] **Step 1: Install `@supabase/supabase-js` in `client`**
  Run: `npm --prefix Capstone/client install @supabase/supabase-js`
- [ ] **Step 2: Create `Capstone/client/.env.example`**
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here
  ```
- [ ] **Step 3: Create `Capstone/client/src/services/supabaseClient.js`**
  Instantiate `createClient(supabaseUrl, supabaseAnonKey)` when both environment variables are non-empty; provide `isSupabaseConfigured()`.
- [ ] **Step 4: Update `Capstone/client/src/services/api.js`**
  Add direct Supabase query implementations with error handling for each API function, falling back to existing HTTP endpoints when `!isSupabaseConfigured()`.
- [ ] **Step 5: Verify client build and fallback behavior**
  Run: `npm --prefix Capstone/client run build`
  Expected: Successful build without module resolution errors.
- [ ] **Step 6: Commit**
  ```bash
  git add Capstone/client/
  git commit -m "feat(api): integrate supabase client with automatic local fallback"
  ```

---

### Task 3: Complete Poppins Typography System Configuration

**Files:**
- Modify: `Capstone/client/index.html`
- Modify: `Capstone/client/tailwind.config.js`
- Modify: `Capstone/client/src/styles/fonts.css`
- Modify: `Capstone/client/src/index.css`

**Interfaces:**
- Consumes: Google Fonts Poppins stylesheet (weights 300, 400, 500, 600, 700, 800, 900)
- Produces: Tailwind font utilities (`font-sans`, `font-heading`, `font-display`) and helper classes (`font-light`, `font-normal`, `font-medium`, `font-semibold`, `font-bold`, `font-extrabold`).

- [ ] **Step 1: Update `Capstone/client/index.html`**
  Update Google Fonts `<link>` to load Poppins with weights 300, 400, 500, 600, 700, 800, 900.
- [ ] **Step 2: Update `Capstone/client/tailwind.config.js`**
  Set `fontFamily`:
  - `display`: `['Poppins', 'sans-serif']`
  - `heading`: `['Poppins', 'sans-serif']`
  - `sans`: `['Poppins', 'sans-serif']`
- [ ] **Step 3: Update `Capstone/client/src/styles/fonts.css` and `Capstone/client/src/index.css`**
  Ensure default font family is Poppins across all tags, with custom font variation utility classes.
- [ ] **Step 4: Verify build with updated font configuration**
  Run: `npm --prefix Capstone/client run build`
  Expected: Pass.
- [ ] **Step 5: Commit**
  ```bash
  git add Capstone/client/index.html Capstone/client/tailwind.config.js Capstone/client/src/styles/fonts.css Capstone/client/src/index.css
  git commit -m "style(typography): configure full poppins font variation hierarchy"
  ```

---

### Task 4: UI & Styling Overhaul for Participant Portal

**Files:**
- Modify: `Capstone/client/src/components/Navbar.jsx`
- Modify: `Capstone/client/src/components/AnnouncementTicker.jsx`
- Modify: `Capstone/client/src/components/EventFilters.jsx`
- Modify: `Capstone/client/src/components/EventCard.jsx`
- Modify: `Capstone/client/src/components/ParticipantPortal.jsx`
- Modify: `Capstone/client/src/components/EventDetailModal.jsx`
- Modify: `Capstone/client/src/components/RegistrationModal.jsx`
- Modify: `Capstone/client/src/components/TicketPassModal.jsx`
- Modify: `Capstone/client/src/components/MyTicketsModal.jsx`

**Interfaces:**
- Consumes: Poppins font classes, Tailwind styling utilities, Lucide icons, `api` service methods.
- Produces: Polished modern participant experience with glassmorphism, refined badge hierarchy, gradient accents, and interactive cards.

- [ ] **Step 1: Upgrade `Navbar.jsx` and `AnnouncementTicker.jsx`**
  Apply glassmorphic navbar with active portal switch pill, glowing violet logo accent, and animated ticker notices.
- [ ] **Step 2: Upgrade `EventFilters.jsx` and `EventCard.jsx`**
  Modernize search bar, category pill buttons, event cards with hover lift (`hover:-translate-y-1.5 hover:shadow-xl`), dynamic capacity gradient bars, and sleek date/venue tags.
- [ ] **Step 3: Upgrade `EventDetailModal.jsx`, `RegistrationModal.jsx`, `TicketPassModal.jsx`, and `MyTicketsModal.jsx`**
  Apply backdrop blur, rounded-2xl modal dialogs, timeline session nodes with distinct room badges, clean form controls with focused indigo rings, and high-fidelity QR ticket stub styling.
- [ ] **Step 4: Verify client compilation**
  Run: `npm --prefix Capstone/client run build`
  Expected: Pass.
- [ ] **Step 5: Commit**
  ```bash
  git add Capstone/client/src/components/
  git commit -m "style(ui): elevate participant portal components with poppins and modern aesthetic"
  ```

---

### Task 5: UI & Styling Overhaul for Organizer & Admin Dashboard

**Files:**
- Modify: `Capstone/client/src/components/admin/AdminLayout.jsx`
- Modify: `Capstone/client/src/components/admin/AnalyticsOverview.jsx`
- Modify: `Capstone/client/src/components/admin/EventManager.jsx`
- Modify: `Capstone/client/src/components/admin/EventFormModal.jsx`
- Modify: `Capstone/client/src/components/admin/RegistrationsManager.jsx`
- Modify: `Capstone/client/src/components/admin/TicketScannerModal.jsx`
- Modify: `Capstone/client/src/components/admin/AnnouncementBroadcast.jsx`

**Interfaces:**
- Consumes: Poppins typography, updated CSS design tokens, Lucide icons, `api` methods.
- Produces: Premium dark navy & slate organizer SaaS dashboard with interactive chart widgets, responsive data tables, and modal workflows.

- [ ] **Step 1: Upgrade `AdminLayout.jsx` and `AnalyticsOverview.jsx`**
  Polish sidebar navigation with subtle active glow, sleek metric KPI cards, modern gradient progress gauges, and department distribution charts.
- [ ] **Step 2: Upgrade `EventManager.jsx` and `EventFormModal.jsx`**
  Refine event catalog table with status tags, session count chips, and dynamic multi-round builder modal with time and venue fields.
- [ ] **Step 3: Upgrade `RegistrationsManager.jsx`, `TicketScannerModal.jsx`, and `AnnouncementBroadcast.jsx`**
  Enhance attendee roster with instant search, 1-click attendance toggle buttons, prominent CSV export CTA, camera/manual QR check-in scanner dialog, and priority broadcast composer.
- [ ] **Step 4: Verify client compilation**
  Run: `npm --prefix Capstone/client run build`
  Expected: Pass.
- [ ] **Step 5: Commit**
  ```bash
  git add Capstone/client/src/components/admin/
  git commit -m "style(admin): modernize admin dashboard, analytics widgets, and management modals"
  ```

---

### Task 6: End-to-End Build, Test Verification & Documentation Update

**Files:**
- Modify: `Capstone/README.md`
- Test: Full build and pytest suite execution

**Interfaces:**
- Consumes: npm build, pytest test runner
- Produces: Fully validated project with updated README documenting Supabase setup, Poppins typography, and modern styling.

- [ ] **Step 1: Execute Python backend test suite**
  Run: `.venv\Scripts\pytest server/tests -v`
  Expected: All 28 tests PASS.
- [ ] **Step 2: Execute Client production build**
  Run: `npm --prefix Capstone/client run build`
  Expected: Vite build succeeds with 0 errors.
- [ ] **Step 3: Update `Capstone/README.md`**
  Document Supabase cloud database setup instructions, environment variables, Poppins typography hierarchy, and updated screenshots/features.
- [ ] **Step 4: Commit**
  ```bash
  git add Capstone/README.md
  git commit -m "docs: update capstone readme with supabase configuration and poppins styling guide"
  ```
