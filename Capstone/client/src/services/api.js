import { supabase, isSupabaseConfigured } from './supabaseClient';

const BASE_URL = '/api';

// Helper to generate unique ticket code
function generateTicketCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EVF-2026-${rand}`;
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMsg = errorData.error;
      }
    } catch (e) {
      // Non-JSON response
    }
    const err = new Error(errorMsg);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

export const api = {
  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  async fetchEvents(params = {}) {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('events')
        .select(`
          *,
          organizers (name, department),
          event_sessions (count)
        `)
        .order('date', { ascending: true });

      if (params.category && params.category !== 'All') {
        query = query.eq('category', params.category);
      }
      if (params.status && params.status !== 'All') {
        query = query.eq('status', params.status);
      }
      if (params.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,venue.ilike.%${params.search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      return (data || []).map(event => ({
        ...event,
        organizer_name: event.organizers?.name || 'Campus Organizer',
        organizer_department: event.organizers?.department || 'University',
        sessions_count: event.event_sessions?.[0]?.count || 0
      }));
    }

    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params.status && params.status !== 'All') searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);

    const qs = searchParams.toString();
    const res = await fetch(`${BASE_URL}/events${qs ? `?${qs}` : ''}`);
    return handleResponse(res);
  },

  async fetchEventById(id) {
    if (isSupabaseConfigured()) {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          organizers (name, department, email, role, avatar_url),
          event_sessions (*),
          announcements (*)
        `)
        .eq('id', id)
        .single();

      if (eventError || !event) throw new Error(eventError?.message || 'Event not found');

      // Sort sessions by order_index
      const sessions = (event.event_sessions || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

      return {
        ...event,
        organizer_name: event.organizers?.name,
        organizer_department: event.organizers?.department,
        organizer_email: event.organizers?.email,
        sessions,
        announcements: event.announcements || []
      };
    }

    const res = await fetch(`${BASE_URL}/events/${id}`);
    return handleResponse(res);
  },

  async createEvent(eventData) {
    if (isSupabaseConfigured()) {
      const { sessions, ...eventFields } = eventData;
      
      const { data: createdEvent, error: eventErr } = await supabase
        .from('events')
        .insert([{
          ...eventFields,
          capacity: Number(eventFields.capacity) || 100,
          registered_count: 0,
          status: 'upcoming'
        }])
        .select()
        .single();

      if (eventErr) throw new Error(eventErr.message);

      if (sessions && Array.isArray(sessions) && sessions.length > 0) {
        const sessionRows = sessions.map((s, idx) => ({
          event_id: createdEvent.id,
          round_name: s.round_name,
          venue_room: s.venue_room,
          start_time: s.start_time,
          end_time: s.end_time,
          description: s.description || '',
          order_index: idx + 1
        }));
        await supabase.from('event_sessions').insert(sessionRows);
      }

      return this.fetchEventById(createdEvent.id);
    }

    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    return handleResponse(res);
  },

  async updateEvent(id, eventData) {
    if (isSupabaseConfigured()) {
      const { sessions, ...eventFields } = eventData;
      const { data, error } = await supabase
        .from('events')
        .update(eventFields)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      if (sessions && Array.isArray(sessions)) {
        await supabase.from('event_sessions').delete().eq('event_id', id);
        if (sessions.length > 0) {
          const sessionRows = sessions.map((s, idx) => ({
            event_id: id,
            round_name: s.round_name,
            venue_room: s.venue_room,
            start_time: s.start_time,
            end_time: s.end_time,
            description: s.description || '',
            order_index: idx + 1
          }));
          await supabase.from('event_sessions').insert(sessionRows);
        }
      }

      return this.fetchEventById(id);
    }

    const res = await fetch(`${BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    return handleResponse(res);
  },

  async deleteEvent(id) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }

    const res = await fetch(`${BASE_URL}/events/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // Registrations & Passes
  // ---------------------------------------------------------------------------
  async registerForEvent(eventId, participantData) {
    if (isSupabaseConfigured()) {
      // 1. Fetch event capacity & deadline
      const { data: event, error: evtErr } = await supabase
        .from('events')
        .select('capacity, registered_count, registration_deadline, title')
        .eq('id', eventId)
        .single();

      if (evtErr || !event) throw new Error('Event not found');

      if (event.registered_count >= event.capacity) {
        throw new Error('Event registration is full');
      }

      // Check deadline
      if (event.registration_deadline) {
        const deadline = new Date(event.registration_deadline);
        if (!isNaN(deadline.getTime()) && new Date() > deadline) {
          throw new Error('Registration deadline has passed');
        }
      }

      // Check duplicate email
      const { data: existing } = await supabase
        .from('registrations')
        .select('id, ticket_code')
        .eq('event_id', eventId)
        .eq('email', participantData.email)
        .maybeSingle();

      if (existing) {
        const conflictErr = new Error('You have already registered for this event');
        conflictErr.status = 409;
        conflictErr.ticket_code = existing.ticket_code;
        throw conflictErr;
      }

      // Generate unique ticket code
      const ticketCode = generateTicketCode();

      const { data: reg, error: regErr } = await supabase
        .from('registrations')
        .insert([{
          event_id: eventId,
          ticket_code: ticketCode,
          participant_name: participantData.participant_name,
          email: participantData.email,
          phone: participantData.phone,
          college: participantData.college,
          department: participantData.department,
          year_of_study: participantData.year_of_study
        }])
        .select()
        .single();

      if (regErr) throw new Error(regErr.message);

      return {
        id: reg.id,
        ticket_code: ticketCode,
        participant_name: reg.participant_name,
        email: reg.email,
        event_title: event.title,
        registered_at: reg.registered_at
      };
    }

    const res = await fetch(`${BASE_URL}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participantData)
    });
    return handleResponse(res);
  },

  async getMyRegistrations(email) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          events (id, title, date, start_time, venue, category, banner_url),
          attendance (status, check_in_time)
        `)
        .eq('email', email)
        .order('registered_at', { ascending: false });

      if (error) throw new Error(error.message);

      return (data || []).map(r => ({
        id: r.id,
        ticket_code: r.ticket_code,
        participant_name: r.participant_name,
        email: r.email,
        phone: r.phone,
        college: r.college,
        department: r.department,
        year_of_study: r.year_of_study,
        registered_at: r.registered_at,
        event_id: r.events?.id,
        event_title: r.events?.title,
        event_date: r.events?.date,
        event_time: r.events?.start_time,
        event_venue: r.events?.venue,
        event_category: r.events?.category,
        banner_url: r.events?.banner_url,
        attendance_status: r.attendance?.[0]?.status || 'registered',
        check_in_time: r.attendance?.[0]?.check_in_time
      }));
    }

    const res = await fetch(`${BASE_URL}/registrations/my?email=${encodeURIComponent(email)}`);
    return handleResponse(res);
  },

  async fetchRegistrations(params = {}) {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('registrations')
        .select(`
          *,
          events (id, title),
          attendance (id, status, check_in_time)
        `)
        .order('registered_at', { ascending: false });

      if (params.event_id && params.event_id !== 'All') {
        query = query.eq('event_id', params.event_id);
      }
      if (params.search) {
        query = query.or(`participant_name.ilike.%${params.search}%,email.ilike.%${params.search}%,ticket_code.ilike.%${params.search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      return (data || []).map(r => ({
        id: r.id,
        event_id: r.event_id,
        event_title: r.events?.title,
        ticket_code: r.ticket_code,
        participant_name: r.participant_name,
        email: r.email,
        phone: r.phone,
        college: r.college,
        department: r.department,
        year_of_study: r.year_of_study,
        registered_at: r.registered_at,
        attendance_status: r.attendance?.[0]?.status || 'registered',
        check_in_time: r.attendance?.[0]?.check_in_time
      }));
    }

    const searchParams = new URLSearchParams();
    if (params.event_id && params.event_id !== 'All') searchParams.append('event_id', params.event_id);
    if (params.search) searchParams.append('search', params.search);

    const qs = searchParams.toString();
    const res = await fetch(`${BASE_URL}/registrations${qs ? `?${qs}` : ''}`);
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // Attendance & Verification
  // ---------------------------------------------------------------------------
  async toggleAttendance(registrationId, status) {
    if (isSupabaseConfigured()) {
      const checkInTime = status === 'checked_in' ? new Date().toISOString() : null;
      const { data, error } = await supabase
        .from('attendance')
        .update({ status, check_in_time: checkInTime })
        .eq('registration_id', registrationId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const res = await fetch(`${BASE_URL}/registrations/${registrationId}/attendance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async verifyTicket(ticketCode) {
    if (isSupabaseConfigured()) {
      const { data: reg, error: regErr } = await supabase
        .from('registrations')
        .select(`
          *,
          events (id, title, date, venue),
          attendance (id, status, check_in_time)
        `)
        .eq('ticket_code', ticketCode.trim())
        .maybeSingle();

      if (regErr || !reg) {
        const err = new Error('Invalid or unrecognised ticket code');
        err.status = 404;
        throw err;
      }

      // Auto check-in if registered
      let currentStatus = reg.attendance?.[0]?.status || 'registered';
      let checkInTime = reg.attendance?.[0]?.check_in_time;

      if (currentStatus !== 'checked_in') {
        checkInTime = new Date().toISOString();
        currentStatus = 'checked_in';
        await supabase
          .from('attendance')
          .update({ status: 'checked_in', check_in_time: checkInTime })
          .eq('registration_id', reg.id);
      }

      return {
        verified: true,
        ticket_code: reg.ticket_code,
        participant_name: reg.participant_name,
        email: reg.email,
        college: reg.college,
        department: reg.department,
        event_title: reg.events?.title,
        event_venue: reg.events?.venue,
        status: currentStatus,
        check_in_time: checkInTime
      };
    }

    const res = await fetch(`${BASE_URL}/attendance/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_code: ticketCode, auto_check_in: true })
    });
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // Announcements
  // ---------------------------------------------------------------------------
  async fetchAnnouncements(eventId = null) {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventId) {
        query = query.or(`event_id.eq.${eventId},event_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    }

    const url = eventId ? `${BASE_URL}/announcements?event_id=${eventId}` : `${BASE_URL}/announcements`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async createAnnouncement(data) {
    if (isSupabaseConfigured()) {
      const { data: created, error } = await supabase
        .from('announcements')
        .insert([{
          event_id: data.event_id || null,
          title: data.title,
          message: data.message,
          priority: data.priority || 'info',
          published_by: data.published_by || 'Organizer'
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return created;
    }

    const res = await fetch(`${BASE_URL}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteAnnouncement(id) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }

    const res = await fetch(`${BASE_URL}/announcements/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // Stats & Analytics
  // ---------------------------------------------------------------------------
  async fetchStatsOverview() {
    if (isSupabaseConfigured()) {
      const { data: events } = await supabase.from('events').select('id, capacity, registered_count, status');
      const { count: totalRegs } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
      const { count: checkedInCount } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('status', 'checked_in');
      const { count: announcementsCount } = await supabase.from('announcements').select('*', { count: 'exact', head: true });

      const allEvents = events || [];
      const totalEvents = allEvents.length;
      const activeEvents = allEvents.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length;
      const completedEvents = allEvents.filter(e => e.status === 'completed').length;
      const totalCapacity = allEvents.reduce((acc, e) => acc + (e.capacity || 0), 0);
      const totalRegistrations = totalRegs || 0;

      const capacityUtil = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

      return {
        total_events: totalEvents,
        active_events: activeEvents,
        completed_events: completedEvents,
        total_registrations: totalRegistrations,
        checked_in_count: checkedInCount || 0,
        unique_participants: totalRegistrations,
        overall_capacity_utilization: capacityUtil,
        total_announcements: announcementsCount || 0
      };
    }

    const res = await fetch(`${BASE_URL}/stats/overview`);
    return handleResponse(res);
  },

  async fetchDepartmentStats() {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('registrations').select('department');
      const counts = {};
      (data || []).forEach(r => {
        const dept = r.department || 'Other';
        counts[dept] = (counts[dept] || 0) + 1;
      });
      return Object.entries(counts).map(([department, count]) => ({ department, count }));
    }

    const res = await fetch(`${BASE_URL}/stats/department-breakdown`);
    return handleResponse(res);
  },

  async fetchCategoryStats() {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('events').select('category, registered_count');
      const counts = {};
      (data || []).forEach(e => {
        const cat = e.category || 'General';
        if (!counts[cat]) counts[cat] = { category: cat, events_count: 0, registrations_count: 0 };
        counts[cat].events_count += 1;
        counts[cat].registrations_count += (e.registered_count || 0);
      });
      return Object.values(counts);
    }

    const res = await fetch(`${BASE_URL}/stats/category-breakdown`);
    return handleResponse(res);
  },

  async fetchActivityLog() {
    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from('registrations')
        .select('participant_name, registered_at, events(title)')
        .order('registered_at', { ascending: false })
        .limit(10);

      return (data || []).map(r => ({
        type: 'registration',
        message: `${r.participant_name} registered for ${r.events?.title || 'an event'}`,
        timestamp: r.registered_at
      }));
    }

    const res = await fetch(`${BASE_URL}/stats/activity-log`);
    return handleResponse(res);
  }
};
