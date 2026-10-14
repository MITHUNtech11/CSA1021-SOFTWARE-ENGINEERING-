# Frontend End-to-End Completion with Authentication & Legibility Hierarchy

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a complete, robust, production-grade end-to-end frontend experience for EventFlow starting from authentication/login to event discovery, 1-click registration, instant QR pass generation, attendee passbook, organizer command center, and optical QR check-in verification, with all normal typography calibrated strictly above 14px.

**Architecture:** A client-side React 18 SPA with a modular `AuthContext` (supporting student, organizer, and faculty personas with persistent storage and fallback guest mode), integrated with the dual-mode data service (`api.js` for Supabase Cloud and local FastAPI engine). The UI adopts a high-legibility Poppins typography scale where base font size is 17px and smallest label is 15px, eliminating all cramped micro-text.

**Tech Stack:** React 18, Vite 6, Tailwind CSS 3.4, Lucide Icons, Poppins Google Font, Supabase JS / FastAPI REST API.

**Spec:** User request: "for the frontend i want end to end completion like the login page to the end use several agents to complete this task effectively with a proper plan and the normal font size should be above 14 /goal/goal"

## Global Constraints
- Normal font size must be strictly above 14px (base body = 17px, captions/labels = 15px-16px, headings = 19px-48px). No text element should be rendered at <= 14px.
- Full end-to-end user journeys:
  1. Login & Sign Up (Student & Organizer) -> Personalized Portal -> Event Exploration -> 1-Click / Custom Registration -> Dynamic QR Ticket Issuance -> My Passes Passbook.
  2. Organizer Login -> Role Protected Admin Layout -> Analytics KPIs -> Event Management & Creation -> Attendee Roster & Live Search -> Optical QR Scanner Check-in -> Priority Broadcasts -> UTF-8 CSV Export.
- Seamless coexistence with the existing dual-mode data layer (`isSupabaseConfigured()` and local SQLite FastAPI fallback).
- Error resilient: All forms and mutations handle network latency, validation, and errors gracefully with user-friendly alerts.

## Review Focus
1. Authentication state persistence: Reloading the page maintains user session, student details, or organizer privileges.
2. Legibility audit: Ensure every font size across cards, badges, inputs, buttons, tables, and modals is strictly > 14px.
3. 1-Click Registration flow: Logged-in students can register with pre-populated details without repetitive typing, instantly receiving a valid QR boarding pass.
4. Role-based protection: Switching between Student Portal and Admin Command Center enforces proper credentials or prompts login with clear guidance.
5. QR Ticket Scanner: Verification properly checks ticket validity, displays attendee information, and marks attendance with visual feedback.

---

### Task 1: Typography Scale & Legibility Foundation Upgrade
**Files:**
- Modify: `Capstone/client/tailwind.config.js`
- Modify: `Capstone/client/src/index.css`
- Modify: `Capstone/client/src/styles/fonts.css`

**Interfaces:**
- Produces: Tailwind font size tokens where `xs` is 15px, `sm` is 16px, `base` is 17px, `lg` is 19px, `xl` is 22px, ensuring all UI text rendered through these classes or default body is strictly above 14px.

- [ ] **Step 1: Update Tailwind config with minimum 15px typography scale**
- [ ] **Step 2: Update index.css base rules to enforce body font-size 17px and line-height 1.6**
- [ ] **Step 3: Run `npm run build` in `Capstone/client` to verify compilation**

---

### Task 2: Authentication Context & User State Management
**Files:**
- Create: `Capstone/client/src/context/AuthContext.jsx`
- Create: `Capstone/client/src/context/useAuth.js`
- Create: `Capstone/client/src/data/mockUsers.js`

**Interfaces:**
- Produces: `AuthContext` providing `user`, `role` (`'student' | 'admin' | 'guest'`), `isAuthenticated`, `login(credentials)`, `loginAsDemo(userId)`, `signup(userData)`, `logout()`, `updateProfile(data)`.
- Consumes: LocalStorage for persistent auth state across page reloads.

- [ ] **Step 1: Create mock seed personas (Student Aditya Nair, Student Sneha Patel, Organizer Aarav Sharma, Faculty Coordinator Dr. Raman)**
- [ ] **Step 2: Implement `AuthContext.jsx` with session persistence and error handling**
- [ ] **Step 3: Create custom hook `useAuth()` for easy access across components**
- [ ] **Step 4: Verify build with `npm run build`**

---

### Task 3: Login, Registration & Profile Authentication UI
**Files:**
- Create: `Capstone/client/src/components/auth/AuthModal.jsx`
- Create: `Capstone/client/src/components/auth/UserProfileModal.jsx`
- Modify: `Capstone/client/src/components/Navbar.jsx`

**Interfaces:**
- Consumes: `useAuth` hook.
- Produces: Full interactive modal for Student Login, Organizer Access, New User Sign Up, Demo 1-Click quick logins, user profile avatar badge in Navbar, and clean Sign Out.

- [ ] **Step 1: Build `AuthModal.jsx` with tabs (Student Sign-In, Admin & Lead Sign-In, Create Account) and Demo One-Click Login chips**
- [ ] **Step 2: Build `UserProfileModal.jsx` to view/edit user details and role info**
- [ ] **Step 3: Update `Navbar.jsx` to display current user profile, role badge, login button, and user menu**
- [ ] **Step 4: Verify build with `npm run build`**

---

### Task 4: Student End-to-End Experience (Personalized Portal, 1-Click Registration & Passbook)
**Files:**
- Modify: `Capstone/client/src/components/ParticipantPortal.jsx`
- Modify: `Capstone/client/src/components/EventDetailModal.jsx`
- Modify: `Capstone/client/src/components/RegistrationModal.jsx`
- Modify: `Capstone/client/src/components/TicketPassModal.jsx`
- Modify: `Capstone/client/src/components/MyTicketsModal.jsx`
- Modify: `Capstone/client/src/components/EventCard.jsx`
- Modify: `Capstone/client/src/components/EventFilters.jsx`

**Interfaces:**
- Consumes: `useAuth` user object to auto-fill registration fields, display user greetings, and load personal passes.
- Produces: High-legibility typography across all event cards, modal bodies, interactive schedule timelines, 1-click registration, and rich boarding pass print/download.

- [ ] **Step 1: Update `ParticipantPortal.jsx` with personalized welcome header, quick stats bar, and typography polish**
- [ ] **Step 2: Update `RegistrationModal.jsx` to auto-fill authenticated student credentials and support 1-click confirm**
- [ ] **Step 3: Enhance `TicketPassModal.jsx` with downloadable SVG pass and print styling**
- [ ] **Step 4: Transform `MyTicketsModal.jsx` into a comprehensive passbook with status filters and direct pass viewing**
- [ ] **Step 5: Ensure all text classes in `EventCard.jsx`, `EventFilters.jsx`, `EventDetailModal.jsx` are strictly > 14px**

---

### Task 5: Organizer & Admin Command Center E2E Upgrade
**Files:**
- Modify: `Capstone/client/src/components/admin/AdminLayout.jsx`
- Modify: `Capstone/client/src/components/admin/AnalyticsOverview.jsx`
- Modify: `Capstone/client/src/components/admin/EventManager.jsx`
- Modify: `Capstone/client/src/components/admin/RegistrationsManager.jsx`
- Modify: `Capstone/client/src/components/admin/TicketScannerModal.jsx`
- Modify: `Capstone/client/src/components/admin/AnnouncementBroadcast.jsx`
- Modify: `Capstone/client/src/components/admin/EventFormModal.jsx`

**Interfaces:**
- Consumes: `useAuth` to ensure only users with 'admin' / organizer privileges can execute mutations, displaying current admin identity.
- Produces: Protected admin routing with auth challenge, interactive optical QR scanner simulator with camera view and immediate check-in audio/visual feedback, CSV exports, and announcement publishing.

- [ ] **Step 1: Integrate `useAuth` into `AdminLayout.jsx` with role guard and dynamic organizer profile**
- [ ] **Step 2: Update `AnalyticsOverview.jsx` typography and metric counters for maximum legibility**
- [ ] **Step 3: Enhance `EventManager.jsx` and `EventFormModal.jsx` with clear validation and multi-session builder**
- [ ] **Step 4: Upgrade `RegistrationsManager.jsx` with search, event filters, instant check-in toggle, and CSV export**
- [ ] **Step 5: Polish `TicketScannerModal.jsx` with simulated camera viewfinder, code input, and live attendance update**
- [ ] **Step 6: Upgrade `AnnouncementBroadcast.jsx` with instant broadcast and clear priority tags**

---

### Task 6: App Orchestration, End-to-End Routing & Toast Notification System
**Files:**
- Create: `Capstone/client/src/components/Toast.jsx`
- Modify: `Capstone/client/src/App.jsx`

**Interfaces:**
- Connects: Auth provider, participant portal, admin layout, toast alert system, and persistent state.

- [ ] **Step 1: Build lightweight, sleek `Toast.jsx` notification system for registration, login, and check-in events**
- [ ] **Step 2: Wire `App.jsx` with `AuthProvider`, role routing, and global toast context**
- [ ] **Step 3: Verify full production build and ensure zero console errors**

---

### Task 7: Comprehensive Subagent Auditing & Verification Gate
**Files:**
- Automated test scripts and end-to-end verification.

- [ ] **Step 1: Check typography across all generated bundle CSS to verify font sizes > 14px**
- [ ] **Step 2: Verify all 28 backend tests remain passing**
- [ ] **Step 3: Run Vite build and verify zero bundle errors**
- [ ] **Step 4: Complete final audit checklist and deliver goal**
