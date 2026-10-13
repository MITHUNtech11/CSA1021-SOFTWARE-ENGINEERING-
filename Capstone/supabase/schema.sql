-- =============================================================================
-- EventFlow - Supabase PostgreSQL Schema & Seed Migration Script
-- Version: 1.0.0
-- Compatible with: Supabase / PostgreSQL 15+
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Table Definitions
-- -----------------------------------------------------------------------------

-- Drop existing tables if re-running migration
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS event_sessions CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS organizers CASCADE;

-- 1.1 Organizers Table
CREATE TABLE organizers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Club Lead',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES organizers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Technical', 'Hackathon', 'Cultural', 'Sports', 'Workshop', 'Seminar')),
    venue TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    registration_deadline TIMESTAMPTZ NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 100 CHECK (capacity > 0),
    registered_count INTEGER NOT NULL DEFAULT 0 CHECK (registered_count >= 0),
    banner_url TEXT,
    coordinator_name TEXT NOT NULL,
    coordinator_contact TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Event Sessions (Multi-round / Workshop schedule)
CREATE TABLE event_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    round_name TEXT NOT NULL,
    venue_room TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Registrations Table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    ticket_code TEXT NOT NULL UNIQUE,
    participant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college TEXT NOT NULL,
    department TEXT NOT NULL,
    year_of_study TEXT NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_event_registration UNIQUE (event_id, email)
);

-- 1.5 Attendance Verification Table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in', 'absent')),
    check_in_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 Announcements Table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'info' CHECK (priority IN ('info', 'update', 'urgent')),
    published_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. Indexes for Performance
-- -----------------------------------------------------------------------------
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_event_sessions_event_id ON event_sessions(event_id);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_ticket_code ON registrations(ticket_code);
CREATE INDEX idx_attendance_event_id ON attendance(event_id);
CREATE INDEX idx_announcements_event_id ON announcements(event_id);

-- -----------------------------------------------------------------------------
-- 3. Triggers for Auto-Counters & Auto-Attendance
-- -----------------------------------------------------------------------------

-- Trigger function: Update registered_count on events
CREATE OR REPLACE FUNCTION update_event_registered_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events
        SET registered_count = registered_count + 1
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events
        SET registered_count = GREATEST(0, registered_count - 1)
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_registered_count
AFTER INSERT OR DELETE ON registrations
FOR EACH ROW
EXECUTE FUNCTION update_event_registered_count();

-- Trigger function: Auto-create attendance record on registration
CREATE OR REPLACE FUNCTION auto_create_attendance_record()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO attendance (registration_id, event_id, status)
    VALUES (NEW.id, NEW.event_id, 'registered')
    ON CONFLICT (registration_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_create_attendance
AFTER INSERT ON registrations
FOR EACH ROW
EXECUTE FUNCTION auto_create_attendance_record();

-- -----------------------------------------------------------------------------
-- 4. Row Level Security (RLS) Policies
-- -----------------------------------------------------------------------------
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow public read access to organizers, events, sessions, and announcements
CREATE POLICY "Public read organizers" ON organizers FOR SELECT USING (true);
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read event_sessions" ON event_sessions FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);

-- Allow public inserts and reads for event registrations & attendance
CREATE POLICY "Public read registrations" ON registrations FOR SELECT USING (true);
CREATE POLICY "Public insert registrations" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Public update attendance" ON attendance FOR UPDATE USING (true);

-- Allow full administrative actions via anon/authenticated clients for demo
CREATE POLICY "Public manage events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public manage sessions" ON event_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public manage announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public manage organizers" ON organizers FOR ALL USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 5. Seed Data
-- -----------------------------------------------------------------------------

-- 5.1 Seed Organizers
INSERT INTO organizers (id, name, email, department, role, avatar_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Dr. Radhakrishnan', 'radha.cse@univ.edu', 'Computer Science & Engineering', 'Faculty Lead', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('22222222-2222-2222-2222-222222222222', 'Tech Club Council', 'techclub@univ.edu', 'Information Technology', 'Student Secretary', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('33333333-3333-3333-3333-333333333333', 'Cultural Arts Association', 'cultural@univ.edu', 'Student Affairs', 'Club Coordinator', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');

-- 5.2 Seed Events
INSERT INTO events (id, organizer_id, title, description, category, venue, date, start_time, end_time, registration_deadline, capacity, registered_count, banner_url, coordinator_name, coordinator_contact, status) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'TechTrove National Hackathon 2026',
    'A 24-hour national hackathon bringing together visionary developers, designers, and innovators to solve critical real-world challenges in AI, FinTech, CleanTech, and HealthTech.',
    'Hackathon',
    'Main Convention Auditorium & Innovation Lab',
    '2026-10-24',
    '09:00 AM',
    '09:00 AM (Next Day)',
    '2026-10-22 23:59:59+00',
    150,
    0,
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop',
    'Arjun Sharma',
    '+91 98765 43210',
    'upcoming'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'RoboWars Arena: Combat Robotics Championship',
    'Annual combat robotics tournament featuring custom wired and wireless bots fighting across multiple arena hazards for the championship trophy.',
    'Technical',
    'Indoor Sports Complex & Arena Ring',
    '2026-10-28',
    '10:00 AM',
    '05:00 PM',
    '2026-10-26 18:00:00+00',
    80,
    0,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop',
    'Pooja Nair',
    '+91 91234 56789',
    'upcoming'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'AI & Cloud Computing Masterclass',
    'Hands-on workshop exploring LLM deployment, vector databases, microservices architecture, and scalable Kubernetes pipelines.',
    'Workshop',
    'Advanced Computing Lab 304',
    '2026-10-18',
    '02:00 PM',
    '06:00 PM',
    '2026-10-17 12:00:00+00',
    60,
    0,
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop',
    'Dr. K. Raman',
    '+91 99887 76655',
    'upcoming'
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '33333333-3333-3333-3333-333333333333',
    'Cadence: Annual Inter-College Cultural Fest',
    'Three days of music, dance, theatrical performances, battle of the bands, and art exhibitions celebrating college culture.',
    'Cultural',
    'Open Air Amphitheatre',
    '2026-11-05',
    '05:00 PM',
    '10:30 PM',
    '2026-11-03 23:59:59+00',
    500,
    0,
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop',
    'Sneha Kapoor',
    '+91 97654 32109',
    'upcoming'
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '22222222-2222-2222-2222-222222222222',
    'Quantum Computing & Future Tech Symposium',
    'Expert keynote talks, research paper tracks, and interactive roundtables on quantum algorithms and post-quantum cryptography.',
    'Seminar',
    'Seminar Hall 2, Tech Tower',
    '2026-11-12',
    '10:30 AM',
    '03:30 PM',
    '2026-11-10 18:00:00+00',
    120,
    0,
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop',
    'Vikram Iyer',
    '+91 98112 23344',
    'upcoming'
);

-- 5.3 Seed Event Sessions (Multi-round timelines)
INSERT INTO event_sessions (event_id, round_name, venue_room, start_time, end_time, description, order_index) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Round 1: Problem Selection & Ideation', 'Main Auditorium Stage', '09:00 AM', '12:00 PM', 'Team orientation, problem statement release, and mentor brainstorming.', 1),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Round 2: Midpoint Architecture Review', 'Innovation Labs A & B', '08:00 PM', '11:00 PM', 'Jury checkpoint evaluation of system architecture and progress demo.', 2),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Round 3: Final Product Pitch & Demo', 'Main Auditorium Stage', '06:00 AM', '09:00 AM', '3-minute live presentations and Q&A before enterprise judges.', 3),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Qualifying Heats: Obstacle Course', 'Arena Floor - Zone 1', '10:00 AM', '01:00 PM', 'Bot maneuverability, speed, and hazard navigation testing.', 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Grand Final: 1v1 Combat Elimination', 'Enclosed Polycarbonate Arena', '02:30 PM', '05:00 PM', 'Head-to-head destruction bouts to determine tournament champion.', 2);

-- 5.4 Seed Registrations (Triggers will auto-create attendance and increment registered_count)
INSERT INTO registrations (id, event_id, ticket_code, participant_name, email, phone, college, department, year_of_study) VALUES
('90000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EVF-2026-HACK1', 'Aditya Verma', 'aditya.verma@college.edu', '+91 98765 00001', 'Tech Institute of Science', 'Computer Science & Engineering', '3rd Year'),
('90000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EVF-2026-HACK2', 'Rhea Sen', 'rhea.sen@college.edu', '+91 98765 00002', 'National College of Engineering', 'Information Technology', '2nd Year'),
('90000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EVF-2026-HACK3', 'Manoj Kumar', 'manoj.k@college.edu', '+91 98765 00003', 'State University', 'Electronics & Communication', '4th Year'),
('90000004-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'EVF-2026-ROBO1', 'Siddharth Rao', 'sid.rao@college.edu', '+91 98765 00004', 'Tech Institute of Science', 'Mechanical Engineering', '3rd Year'),
('90000005-0000-0000-0000-000000000005', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'EVF-2026-WS001', 'Ananya Gupta', 'ananya.g@college.edu', '+91 98765 00005', 'National College of Engineering', 'Computer Science & Engineering', '2nd Year');

-- 5.5 Update Attendance Check-in for Demo
UPDATE attendance
SET status = 'checked_in', check_in_time = NOW()
WHERE registration_id = '90000001-0000-0000-0000-000000000001';

-- 5.6 Seed Announcements
INSERT INTO announcements (id, event_id, title, message, priority, published_by) VALUES
(
    '80000001-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Hackathon Mentorship Registration Open',
    'All registered teams can now sign up for 1-on-1 industry mentor slots in the portal.',
    'info',
    'Tech Club Council'
),
(
    '80000002-0000-0000-0000-000000000002',
    NULL,
    'Campus High-Speed WiFi Credentials for TechFest',
    'Connect to SSID "EVENTFLOW_CAMPUS" using your student ticket code for unrestricted high-speed internet.',
    'urgent',
    'Central IT Admin'
);
