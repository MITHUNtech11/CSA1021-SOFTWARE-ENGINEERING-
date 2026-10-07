const BASE_URL = '/api';

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
  // Events
  async fetchEvents(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params.status && params.status !== 'All') searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);

    const qs = searchParams.toString();
    const res = await fetch(`${BASE_URL}/events${qs ? `?${qs}` : ''}`);
    return handleResponse(res);
  },

  async fetchEventById(id) {
    const res = await fetch(`${BASE_URL}/events/${id}`);
    return handleResponse(res);
  },

  async createEvent(eventData) {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    return handleResponse(res);
  },

  async updateEvent(id, eventData) {
    const res = await fetch(`${BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    return handleResponse(res);
  },

  async deleteEvent(id) {
    const res = await fetch(`${BASE_URL}/events/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Registrations & Passes
  async registerForEvent(eventId, participantData) {
    const res = await fetch(`${BASE_URL}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participantData)
    });
    return handleResponse(res);
  },

  async getMyRegistrations(email) {
    const res = await fetch(`${BASE_URL}/registrations/my?email=${encodeURIComponent(email)}`);
    return handleResponse(res);
  },

  async fetchRegistrations(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.event_id && params.event_id !== 'All') searchParams.append('event_id', params.event_id);
    if (params.search) searchParams.append('search', params.search);

    const qs = searchParams.toString();
    const res = await fetch(`${BASE_URL}/registrations${qs ? `?${qs}` : ''}`);
    return handleResponse(res);
  },

  // Attendance & Verification
  async toggleAttendance(registrationId, status) {
    const res = await fetch(`${BASE_URL}/registrations/${registrationId}/attendance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async verifyTicket(ticketCode) {
    const res = await fetch(`${BASE_URL}/attendance/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_code: ticketCode, auto_check_in: true })
    });
    return handleResponse(res);
  },

  // Announcements
  async fetchAnnouncements(eventId = null) {
    const url = eventId ? `${BASE_URL}/announcements?event_id=${eventId}` : `${BASE_URL}/announcements`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async createAnnouncement(data) {
    const res = await fetch(`${BASE_URL}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteAnnouncement(id) {
    const res = await fetch(`${BASE_URL}/announcements/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Stats & Analytics
  async fetchStatsOverview() {
    const res = await fetch(`${BASE_URL}/stats/overview`);
    return handleResponse(res);
  },

  async fetchDepartmentStats() {
    const res = await fetch(`${BASE_URL}/stats/department-breakdown`);
    return handleResponse(res);
  },

  async fetchCategoryStats() {
    const res = await fetch(`${BASE_URL}/stats/category-breakdown`);
    return handleResponse(res);
  },

  async fetchActivityLog() {
    const res = await fetch(`${BASE_URL}/stats/activity-log`);
    return handleResponse(res);
  }
};
