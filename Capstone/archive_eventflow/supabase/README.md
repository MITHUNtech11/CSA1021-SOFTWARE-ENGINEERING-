# Supabase Database Setup Guide for EventFlow

This directory contains the production-ready PostgreSQL database schema, Row Level Security (RLS) policies, automatic triggers, and realistic sample data for **EventFlow**.

---

## 🚀 Setting Up Your Free Supabase Project

### 1. Create a Supabase Project
1. Go to [https://supabase.com/](https://supabase.com/) and sign in.
2. Click **"New Project"**.
3. Choose your organization, set a project name (e.g. `eventflow-campus`), enter a strong database password, and select your preferred region.
4. Click **"Create new project"** (this takes about 1-2 minutes to provision).

---

### 2. Run the Schema Migration Script
1. In your Supabase project dashboard, open the **SQL Editor** tab from the left sidebar.
2. Click **"New query"**.
3. Copy the entire contents of [`schema.sql`](file:///C:/Users/mithu/OneDrive/Desktop/CSA1021-SOFTWARE-ENGINEERING-/Capstone/supabase/schema.sql) and paste it into the query editor.
4. Click **"Run"** (or press `Ctrl+Enter`).
5. Verify that the following 6 tables appear under **Table Editor**:
   - `organizers`
   - `events`
   - `event_sessions`
   - `registrations`
   - `attendance`
   - `announcements`

---

### 3. Connect the React Application
1. In your Supabase dashboard, navigate to **Project Settings** > **API**.
2. Find the following two values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **Project API Keys** -> `anon` / `public` key (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI...`)
3. In the `Capstone/client` directory, copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Fill in your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Restart your frontend dev server:
   ```bash
   npm run dev
   ```

EventFlow will now read and write directly to your cloud Supabase database!

> **Note on Local Development**: If `VITE_SUPABASE_URL` is omitted, EventFlow's dual-mode API layer automatically routes requests to the local Python FastAPI server (`http://localhost:5000`), so the application never breaks even without active cloud keys.
