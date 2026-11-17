# EventFlow: Supabase Integration & Poppins Styling Overhaul - Design Specification

**Date:** 2026-10-13  
**Status:** Approved  
**Target:** EventFlow Full-Stack Frontend & Data Layer (Supabase + Poppins Typography + Modern UI Polish)

---

## 1. Overview & Objectives

This specification outlines the evolution of the EventFlow campus event coordination platform to incorporate:
1. **Supabase Cloud Database Integration:** Direct frontend connectivity via `@supabase/supabase-js`, full PostgreSQL migration script (`supabase/schema.sql`) with tables, relational constraints, Row Level Security (RLS) policies, and pre-seeded realistic campus data, supported by resilient dual-mode failover.
2. **Comprehensive Poppins Typography Scale:** Transitioning from the previous split font system to a complete, cohesive Poppins typography scale covering weights 300 to 900 across the entire user experience.
3. **Elevated Modern UI & Styling Polish:** Introducing frosted glassmorphism surfaces, vivid indigo-violet gradients, interactive card hover lift effects, refined badge pills, dynamic capacity bars, and polished modal overlays.

---

## 2. Typography & Visual Styling System

### 2.1 Poppins Font Weights & Hierarchy
Google Fonts will be updated in `index.html` to import the full weight spectrum of Poppins:
- `font-light` (`300`): Timestamps, session room codes, subtle metadata badges.
- `font-normal` (`400`): Body copy, event descriptions, form input placeholders, help text.
- `font-medium` (`500`): Form labels, navigation pills, table cells, secondary buttons.
- `font-semibold` (`600`): Event card titles, modal subheaders, metric numbers, status tags.
- `font-bold` (`700`): Major section titles, modal headers, table headers, primary action CTAs.
- `font-extrabold` (`800` / `900`): "EVENTFLOW" brand identity, hero taglines, digital pass headers.

`tailwind.config.js` and `src/index.css` are updated to make `Poppins` the primary font across `sans`, `heading`, and `display`.

### 2.2 Aesthetic Polish & Micro-Interactions
- **Glassmorphic Cards**: `backdrop-blur-md bg-white/90` with hairline borders (`border-slate-200/80` in light mode, `border-white/10` in dark surfaces).
- **Brand Gradient Palette**: Vibrant gradients (`bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700`) on hero banners, ticket stubs, and primary actions.
- **Micro-Interactions**: Smooth card hovering transitions (`hover:-translate-y-1 hover:shadow-xl transition-all duration-300`), interactive button active states, and refined focus rings.
- **Sleek Modal Architecture**: Clean backdrop filters, rounded-2xl geometries, and crisp close triggers.

---

## 3. Supabase Architecture & Data Layer

### 3.1 Dual-Mode Architecture
```
+-----------------------------------------------------------------------------------+
|                        Client Application (React + Vite)                         |
|                                                                                   |
|  - Font Engine: Full Poppins Hierarchy (Weights 300-900)                         |
|  - UI Shell: Participant Portal <---> Organizer SaaS Dashboard                    |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                  Unified Data Service Layer (client/src/services/api.js)          |
|                                                                                   |
|  Check: isSupabaseConfigured() via VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY     |
+----------------------------------------+------------------------------------------+
                   |                                                    |
         [YES: Supabase Active]                                [NO: Local Fallback]
                   |                                                    |
                   v                                                    v
+--------------------------------------+             +------------------------------+
|        @supabase/supabase-js         |             |      Vite Proxy -> FastAPI   |
|        PostgreSQL Database           |             |      Local SQLite Backend    |
|  - RLS Policies Enabled              |             |      http://localhost:5000   |
|  - Direct Real-Time Queries          |             +------------------------------+
+--------------------------------------+
```

### 3.2 Supabase PostgreSQL Schema (`Capstone/supabase/schema.sql`)
1. **`organizers`**:
   - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - `name` TEXT NOT NULL
   - `email` TEXT NOT NULL UNIQUE
   - `department` TEXT NOT NULL
   - `role` TEXT NOT NULL DEFAULT 'Club Lead'
   - `avatar_url` TEXT
   - `created_at` TIMESTAMPTZ DEFAULT NOW()

2. **`events`**:
   - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - `organizer_id` UUID REFERENCES organizers(id) ON DELETE SET NULL
   - `title` TEXT NOT NULL
   - `description` TEXT NOT NULL
   - `category` TEXT NOT NULL
   - `venue` TEXT NOT NULL
   - `date` TEXT NOT NULL
   - `start_time` TEXT NOT NULL
   - `end_time` TEXT NOT NULL
   - `registration_deadline` TEXT NOT NULL
   - `capacity` INTEGER NOT NULL DEFAULT 100
   - `registered_count` INTEGER NOT NULL DEFAULT 0
   - `banner_url` TEXT
   - `coordinator_name` TEXT NOT NULL
   - `coordinator_contact` TEXT NOT NULL
   - `status` TEXT NOT NULL DEFAULT 'upcoming'
   - `created_at` TIMESTAMPTZ DEFAULT NOW()

3. **`event_sessions`**:
   - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - `event_id` UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE
   - `round_name` TEXT NOT NULL
   - `venue_room` TEXT NOT NULL
   - `start_time` TEXT NOT NULL
   - `end_time` TEXT NOT NULL
   - `description` TEXT
   - `order_index` INTEGER NOT NULL DEFAULT 1

4. **`registrations`**:
   - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - `event_id` UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE
   - `ticket_code` TEXT NOT NULL UNIQUE
   - `participant_name` TEXT NOT NULL
   - `email` TEXT NOT NULL
   - `phone` TEXT NOT NULL
   - `college` TEXT NOT NULL
   - `department` TEXT NOT NULL
   - `year_of_study` TEXT NOT NULL
   - `registered_at` TIMESTAMPTZ DEFAULT NOW()

5. **`attendance`**:
   - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - `registration_id` UUID NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE
   - `event_id` UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE
   - `status` TEXT NOT NULL DEFAULT 'registered'
   - `check_in_time` TIMESTAMPTZ

6. **`announcements`**:
   - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - `event_id` UUID REFERENCES events(id) ON DELETE CASCADE
   - `title` TEXT NOT NULL
   - `message` TEXT NOT NULL
   - `priority` TEXT NOT NULL DEFAULT 'info'
   - `published_by` TEXT NOT NULL
   - `created_at` TIMESTAMPTZ DEFAULT NOW()

### 3.3 Row-Level Security (RLS) Policies
- `events`: Public `SELECT`, authenticated/organizer `INSERT`, `UPDATE`, `DELETE`.
- `event_sessions`: Public `SELECT`, organizer `ALL`.
- `registrations`: Public `INSERT` (for student signups), public `SELECT` filtered by email or organizer `SELECT`.
- `attendance`: Public `SELECT` (ticket verification), organizer `UPDATE`.
- `announcements`: Public `SELECT`, organizer `ALL`.

---

## 4. Client Integration Implementation Plan

1. **Dependency Installation**:
   - Add `@supabase/supabase-js` to `client/package.json`.
2. **Client Configuration**:
   - Create `client/src/services/supabaseClient.js` exporting client instance and validation helper.
   - Provide `client/.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. **Service Layer Adaptation (`client/src/services/api.js`)**:
   - Direct Supabase queries for `fetchEvents`, `fetchEventById`, `createEvent`, `registerForEvent`, `getMyRegistrations`, `fetchRegistrations`, `toggleAttendance`, `verifyTicket`, `announcements`, and stats aggregations.
   - Transparent fallback to HTTP `/api` if keys are not present.
4. **UI Styling Upgrades**:
   - `index.html`, `tailwind.config.js`, `fonts.css`, and `index.css` configured for full Poppins variations.
   - Refactor `Navbar.jsx`, `EventCard.jsx`, `EventDetailModal.jsx`, `RegistrationModal.jsx`, `TicketPassModal.jsx`, and Admin components with enhanced styling.

---

## 5. Verification & Testing Strategy

1. **Dependency & Build Validation**: Run `npm --prefix client run build` to verify JSX, Tailwind styles, and bundle compilation.
2. **UI Verification**: Validate Poppins font rendering across light, regular, semibold, and extrabold weights.
3. **Data Layer Verification**:
   - Validate dual-mode fallback when `.env` is unconfigured.
   - Validate Supabase client instantiation and schema script syntax against PostgreSQL standards.
4. **Integration Test Suite**: Ensure local test suite (`npm test`) continues to pass.
