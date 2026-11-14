/**
 * Smart Campus Facility & Operations Platform - Frontend Controller
 * CO3 Full-Stack Application
 */

const API_BASE = window.location.port === "8000" ? "" : "http://localhost:8000";

const app = {
  state: {
    users: [],
    facilities: [],
    bookings: [],
    tickets: [],
    sensorEvents: [],
    approvals: [],
    auditLogs: [],
    stats: {},
    activeRole: "student",
    activeCampus: 1,
    selectedTicket: null
  },

  async init() {
    this.bindEvents();
    await this.fetchHealth();
    await this.fetchUsers();
    await this.refreshAllData();
  },

  bindEvents() {
    // Tab switching
    document.querySelectorAll(".nav-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.getAttribute("data-tab");
        document.getElementById(target).classList.add("active");
      });
    });

    // Role switcher
    const roleSelect = document.getElementById("activeRoleSelect");
    roleSelect.addEventListener("change", (e) => {
      this.state.activeRole = e.target.value;
      this.showAlert(`Active persona changed to: ${roleSelect.options[roleSelect.selectedIndex].text}`, "warning");
    });

    // Campus selector
    document.getElementById("campusSelect").addEventListener("change", (e) => {
      this.state.activeCampus = e.target.value;
      this.showAlert(`Switched to Campus ${this.state.activeCampus}`, "success");
    });
  },

  async fetchHealth() {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        const data = await res.json();
        document.getElementById("backendInstancePill").textContent = `Instance: ${data.instance_id}`;
      }
    } catch (e) {
      document.getElementById("backendInstancePill").textContent = "API: Disconnected";
    }
  },

  async fetchUsers() {
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      if (res.ok) {
        this.state.users = await res.json();
        const techSelect = document.getElementById("modalAssignTech");
        techSelect.innerHTML = '<option value="">-- Choose Technician --</option>';
        this.state.users.filter(u => u.role === "technician").forEach(t => {
          techSelect.innerHTML += `<option value="${t.id}">${t.name} (${t.department})</option>`;
        });
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    }
  },

  async refreshAllData() {
    await Promise.all([
      this.fetchDashboardStats(),
      this.fetchFacilities(),
      this.fetchBookings(),
      this.fetchTickets(),
      this.fetchSensorEvents(),
      this.fetchApprovals(),
      this.fetchAuditLogs()
    ]);
  },

  async fetchDashboardStats() {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/stats`);
      if (res.ok) {
        const d = await res.json();
        this.state.stats = d;
        document.getElementById("kpiActiveBookings").textContent = d.active_bookings;
        document.getElementById("kpiOpenTickets").textContent = d.open_tickets;
        document.getElementById("kpiCriticalTickets").textContent = d.critical_tickets;
        document.getElementById("kpiSensorAlerts").textContent = d.sensor_alerts;
        document.getElementById("kpiPendingApprovals").textContent = d.pending_approvals;
        document.getElementById("kpiAuditEvents").textContent = d.total_audit_events;
        document.getElementById("backendInstancePill").textContent = `Serving: ${d.serving_instance}`;
      }
    } catch (e) {
      console.error(e);
    }
  },

  async fetchFacilities() {
    try {
      const res = await fetch(`${API_BASE}/api/facilities`);
      if (res.ok) {
        this.state.facilities = await res.json();
        this.renderFacilities();
        this.populateBookingFacilityDropdown();
      }
    } catch (e) {
      console.error(e);
    }
  },

  renderFacilities() {
    const filter = document.getElementById("facilityFilterType").value;
    const tbody = document.querySelector("#facilitiesTable tbody");
    tbody.innerHTML = "";

    const list = filter ? this.state.facilities.filter(f => f.type === filter) : this.state.facilities;
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">No facilities match filter.</td></tr>';
      return;
    }

    list.forEach(f => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>#${f.id}</strong></td>
        <td><strong>${f.name}</strong></td>
        <td>${f.building} - Rm ${f.room_number}</td>
        <td>${f.type.replace('_', ' ').toUpperCase()}</td>
        <td>${f.capacity} seats</td>
        <td>${f.is_restricted ? '<span class="badge badge-maintenance">Restricted (Dean Sign-off)</span>' : '<span class="badge badge-available">Open</span>'}</td>
        <td><span class="badge badge-${f.status}">${f.status}</span></td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="app.openBookingForFacility(${f.id})">Book Slot</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  populateBookingFacilityDropdown() {
    const sel = document.getElementById("bookFacility");
    sel.innerHTML = '<option value="">-- Select Facility --</option>';
    this.state.facilities.forEach(f => {
      sel.innerHTML += `<option value="${f.id}">${f.name} (${f.building})</option>`;
    });
  },

  openBookingForFacility(facilityId) {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    document.querySelector('[data-tab="tab-bookings"]').classList.add("active");
    document.getElementById("tab-bookings").classList.add("active");

    document.getElementById("bookFacility").value = facilityId;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(12, 0, 0, 0);

    document.getElementById("bookStartTime").value = tomorrow.toISOString().slice(0, 16);
    document.getElementById("bookEndTime").value = tomorrowEnd.toISOString().slice(0, 16);
    document.getElementById("bookPurpose").value = "Interactive Assessment Demonstration Lab";
    document.getElementById("bookRequestKey").value = `REQ-DEMO-${Date.now().toString().slice(-4)}`;
  },

  async fetchBookings() {
    try {
      const res = await fetch(`${API_BASE}/api/bookings`);
      if (res.ok) {
        this.state.bookings = await res.json();
        this.renderBookings();
      }
    } catch (e) {
      console.error(e);
    }
  },

  renderBookings() {
    const tbody = document.querySelector("#bookingsTable tbody");
    tbody.innerHTML = "";
    if (this.state.bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9">No active bookings recorded.</td></tr>';
      return;
    }

    this.state.bookings.forEach(b => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${b.id}</td>
        <td><strong>${b.facility_name}</strong></td>
        <td>${b.user_name}</td>
        <td>${b.start_time.replace('T', ' ')}</td>
        <td>${b.end_time.replace('T', ' ')}</td>
        <td>${b.purpose}</td>
        <td><span class="badge badge-${b.status}">${b.status}</span></td>
        <td>v${b.version}</td>
        <td><code>${b.request_key || '-'}</code></td>
      `;
      tbody.appendChild(tr);
    });
  },

  async handleBookingSubmit(e) {
    e.preventDefault();
    const facilityId = parseInt(document.getElementById("bookFacility").value);
    const startTime = document.getElementById("bookStartTime").value;
    const endTime = document.getElementById("bookEndTime").value;
    const purpose = document.getElementById("bookPurpose").value;
    const requestKey = document.getElementById("bookRequestKey").value || `REQ-${Date.now()}`;

    // Map active role to user ID
    const user = this.state.users.find(u => u.role === this.state.activeRole) || this.state.users[0];

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": this.state.activeRole
        },
        body: JSON.stringify({
          facility_id: facilityId,
          user_id: user.id,
          start_time: startTime,
          end_time: endTime,
          purpose: purpose,
          request_key: requestKey
        })
      });

      const data = await res.json();
      if (res.status === 201) {
        this.showAlert(`Booking reserved successfully! Status: ${data.status} (ID #${data.id})`, "success");
        await this.refreshAllData();
      } else if (res.status === 409) {
        this.showAlert(`HTTP 409 OVERLAP REJECTION: ${data.message}`, "danger");
      } else {
        this.showAlert(`Error (${res.status}): ${data.message || data.detail}`, "danger");
      }
    } catch (err) {
      this.showAlert(`Network error submitting booking: ${err.message}`, "danger");
    }
  },

  async simulateOverlapConflict() {
    if (this.state.bookings.length === 0) {
      this.showAlert("Please make at least one booking first before simulating conflict.", "warning");
      return;
    }
    const b = this.state.bookings[0];
    this.showAlert(`Simulating concurrent overlap conflict for '${b.facility_name}' during existing slot (${b.start_time} - ${b.end_time})...`, "warning");

    const user = this.state.users[1] || this.state.users[0];
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "faculty" },
        body: JSON.stringify({
          facility_id: b.facility_id,
          user_id: user.id,
          start_time: b.start_time,
          end_time: b.end_time,
          purpose: "Conflicting Parallel Reservation Request",
          request_key: `REQ-CONFLICT-${Date.now()}`
        })
      });

      const data = await res.json();
      if (res.status === 409) {
        this.showAlert(`HTTP 409 CONFLICT VERIFIED: ${data.message}`, "danger");
      } else {
        this.showAlert(`Expected 409 Conflict, received HTTP ${res.status}`, "warning");
      }
    } catch (e) {
      this.showAlert(`Error: ${e.message}`, "danger");
    }
  },

  async fetchTickets() {
    try {
      const res = await fetch(`${API_BASE}/api/tickets`);
      if (res.ok) {
        this.state.tickets = await res.json();
        this.renderTickets();
        this.renderDashboardIncidents();
      }
    } catch (e) {
      console.error(e);
    }
  },

  renderDashboardIncidents() {
    const tbody = document.querySelector("#dashboardIncidentTable tbody");
    tbody.innerHTML = "";
    if (this.state.tickets.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No active tickets.</td></tr>';
      return;
    }
    this.state.tickets.slice(0, 5).forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${t.ticket_code}</strong></td>
        <td>${t.facility_name}</td>
        <td>${t.category}</td>
        <td>${t.urgency.toUpperCase()} x ${t.teaching_impact.toUpperCase()}</td>
        <td><span class="badge badge-${t.priority}">${t.priority}</span></td>
        <td><span class="badge badge-${t.status}">${t.status}</span></td>
        <td style="font-size: 0.78rem;">${t.priority_justification}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  renderTickets() {
    const filter = document.getElementById("ticketFilterStatus").value;
    const tbody = document.querySelector("#ticketsTable tbody");
    tbody.innerHTML = "";

    const list = filter ? this.state.tickets.filter(t => t.status === filter) : this.state.tickets;
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">No tickets match filter.</td></tr>';
      return;
    }

    list.forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${t.ticket_code}</strong></td>
        <td>
          <strong>${t.title}</strong><br>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${t.facility_name}</span>
        </td>
        <td>${t.category}</td>
        <td><span class="badge badge-${t.priority}">${t.priority}</span></td>
        <td><span class="badge badge-${t.status}">${t.status}</span></td>
        <td>${t.assigned_technician_name || '<em>Unassigned</em>'}</td>
        <td><code>v${t.version}</code></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="app.openTicketModal(${t.id})">Manage Lifecycle</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  openTicketModal(ticketId) {
    const ticket = this.state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    this.state.selectedTicket = ticket;

    document.getElementById("modalTicketTitle").textContent = `Manage Ticket: ${ticket.ticket_code}`;
    document.getElementById("modalTicketId").value = ticket.id;
    document.getElementById("modalCurrentStatus").textContent = ticket.status.toUpperCase();
    document.getElementById("modalExpectedVersion").value = ticket.version;

    // Allowed transition options
    const transitions = {
      intake: ["assigned", "cancelled"],
      assigned: ["inspection", "in_progress", "cancelled"],
      inspection: ["in_progress", "cancelled"],
      in_progress: ["resolved", "cancelled"],
      resolved: ["closed", "in_progress"],
      closed: [],
      cancelled: []
    };

    const targetSel = document.getElementById("modalTargetStatus");
    targetSel.innerHTML = "";
    const options = transitions[ticket.status] || [];
    if (options.length === 0) {
      targetSel.innerHTML = '<option value="">Ticket is in terminal state</option>';
    } else {
      options.forEach(opt => {
        targetSel.innerHTML += `<option value="${opt}">Transition to: ${opt.toUpperCase()}</option>`;
      });
    }

    document.getElementById("modalAssignTech").value = ticket.assigned_technician_id || "";
    document.getElementById("modalInspectionNotes").value = ticket.inspection_notes || "";
    document.getElementById("modalResolutionNotes").value = ticket.resolution_notes || "";

    document.getElementById("ticketModal").classList.add("show");
  },

  closeTicketModal() {
    document.getElementById("ticketModal").classList.remove("show");
    this.state.selectedTicket = null;
  },

  async handleTicketTransitionSubmit(e) {
    e.preventDefault();
    const ticketId = parseInt(document.getElementById("modalTicketId").value);
    const targetStatus = document.getElementById("modalTargetStatus").value;
    const expectedVersion = parseInt(document.getElementById("modalExpectedVersion").value);
    const techId = parseInt(document.getElementById("modalAssignTech").value) || null;
    const inspectionNotes = document.getElementById("modalInspectionNotes").value;
    const resolutionNotes = document.getElementById("modalResolutionNotes").value;

    const user = this.state.users.find(u => u.role === this.state.activeRole) || this.state.users[0];

    try {
      const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_status: targetStatus,
          expected_version: expectedVersion,
          assigned_technician_id: techId,
          inspection_notes: inspectionNotes,
          resolution_notes: resolutionNotes,
          performed_by: `${user.name} (${this.state.activeRole})`
        })
      });

      const data = await res.json();
      if (res.ok) {
        this.showAlert(`Ticket ${data.ticket_code} successfully moved to ${data.status.toUpperCase()} (version ${data.version})`, "success");
        this.closeTicketModal();
        await this.refreshAllData();
      } else if (res.status === 409) {
        this.showAlert(`HTTP 409 OPTIMISTIC CONCURRENCY REJECTION: ${data.message}`, "danger");
      } else {
        this.showAlert(`Validation Error: ${data.message || data.detail}`, "danger");
      }
    } catch (err) {
      this.showAlert(`Error updating ticket: ${err.message}`, "danger");
    }
  },

  async simulateStaleVersionConflict() {
    const ticket = this.state.selectedTicket;
    if (!ticket) return;

    this.showAlert(`Simulating Stale Version Conflict on ${ticket.ticket_code}: Sending stale expected_version ${ticket.version - 1}...`, "warning");

    try {
      const res = await fetch(`${API_BASE}/api/tickets/${ticket.id}/state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_status: "in_progress",
          expected_version: ticket.version - 1, // Stale version!
          performed_by: "Concurrent Worker"
        })
      });

      const data = await res.json();
      if (res.status === 409) {
        this.showAlert(`HTTP 409 VERIFIED: ${data.message}`, "danger");
      } else {
        this.showAlert(`Expected 409 Conflict, received HTTP ${res.status}`, "warning");
      }
    } catch (err) {
      this.showAlert(`Error: ${err.message}`, "danger");
    }
  },

  async handleSensorSubmit(e) {
    e.preventDefault();
    const source = document.getElementById("sensorSource").value;
    const eventId = document.getElementById("sensorEventId").value;
    const metric = document.getElementById("sensorMetric").value;
    const value = parseFloat(document.getElementById("sensorValue").value);
    const threshold = parseFloat(document.getElementById("sensorThreshold").value);

    try {
      const res = await fetch(`${API_BASE}/api/sensor-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: source,
          event_id: eventId,
          metric: metric,
          value: value,
          threshold: threshold
        })
      });

      const data = await res.json();
      if (data.is_duplicate) {
        this.showAlert(`HTTP 200: Duplicate sensor event '${eventId}' recognized & safely deduplicated without creating duplicate ticket.`, "warning");
      } else if (data.created_ticket_id) {
        this.showAlert(`Threshold breached! Measured ${value} > ${threshold}. Automated ticket #${data.created_ticket_id} created with Critical SLA.`, "danger");
      } else {
        this.showAlert(`Sensor reading recorded within nominal parameters (${value} <= ${threshold}).`, "success");
      }
      await this.refreshAllData();
    } catch (err) {
      this.showAlert(`Error sending sensor event: ${err.message}`, "danger");
    }
  },

  async simulateDeduplicationTest() {
    const source = "HVAC-LAB-301";
    const eventId = `EVT-REPLAY-${Date.now().toString().slice(-4)}`;
    this.showAlert(`Firing 5 identical requests for Event ID: ${eventId} to test server-side deduplication...`, "warning");

    let createdTickets = 0;
    let duplicateResponses = 0;

    for (let i = 1; i <= 5; i++) {
      const res = await fetch(`${API_BASE}/api/sensor-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: source,
          event_id: eventId,
          metric: "temperature_c",
          value: 35.8,
          threshold: 28.0
        })
      });
      const data = await res.json();
      if (data.is_duplicate) {
        duplicateResponses++;
      } else if (data.created_ticket_id) {
        createdTickets++;
      }
    }

    this.showAlert(`DEDUPLICATION EMPIRICAL PROOF: 5 requests sent -> Exactly ${createdTickets} ticket created, ${duplicateResponses} duplicate requests suppressed!`, "success");
    await this.refreshAllData();
  },

  async fetchSensorEvents() {
    try {
      const res = await fetch(`${API_BASE}/api/sensor-events`);
      if (res.ok) {
        this.state.sensorEvents = await res.json();
        this.renderSensorEvents();
      }
    } catch (e) {
      console.error(e);
    }
  },

  renderSensorEvents() {
    const tbody = document.querySelector("#sensorEventsTable tbody");
    tbody.innerHTML = "";
    if (this.state.sensorEvents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">No sensor events recorded.</td></tr>';
      return;
    }
    this.state.sensorEvents.forEach(e => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${e.id}</td>
        <td><strong>${e.source}</strong></td>
        <td><code>${e.event_id}</code></td>
        <td>${e.metric}</td>
        <td>${e.value}</td>
        <td>${e.threshold}</td>
        <td>${e.observed_at.replace('T', ' ')}</td>
        <td>${e.created_ticket_id ? `<span class="badge badge-critical">Ticket #${e.created_ticket_id}</span>` : '<span class="badge badge-available">Nominal</span>'}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  async fetchApprovals() {
    try {
      const res = await fetch(`${API_BASE}/api/approvals`);
      if (res.ok) {
        this.state.approvals = await res.json();
        this.renderApprovals();
      }
    } catch (e) {
      console.error(e);
    }
  },

  renderApprovals() {
    const tbody = document.querySelector("#approvalsTable tbody");
    tbody.innerHTML = "";
    if (this.state.approvals.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">No pending approvals.</td></tr>';
      return;
    }
    this.state.approvals.forEach(a => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${a.id}</td>
        <td><strong>${a.target_type.toUpperCase()}</strong></td>
        <td>Target ID #${a.target_id}</td>
        <td><span class="badge badge-${a.decision === 'approved' ? 'available' : a.decision === 'rejected' ? 'maintenance' : 'reserved'}">${a.decision}</span></td>
        <td>${a.reason || '-'}</td>
        <td>${a.decided_at ? a.decided_at.replace('T', ' ') : '<em>Pending</em>'}</td>
        <td>${a.approver_name || '<em>Unassigned</em>'}</td>
        <td>
          ${a.decision === 'pending' ? `
            <button class="btn btn-success btn-sm" onclick="app.decideApproval(${a.id}, 'approved')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="app.decideApproval(${a.id}, 'rejected')">Reject</button>
          ` : '<span style="color: var(--text-muted); font-size: 0.8rem;">Decided</span>'}
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  async decideApproval(approvalId, decision) {
    const user = this.state.users.find(u => u.role === this.state.activeRole) || this.state.users[0];
    const reason = prompt(`Enter justification for ${decision.toUpperCase()}:`, decision === "approved" ? "Approved for academic research demonstration." : "Rejected due to maintenance slot.");
    if (!reason) return;

    try {
      const res = await fetch(`${API_BASE}/api/approvals/${approvalId}/decide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": this.state.activeRole
        },
        body: JSON.stringify({
          approver_id: user.id,
          decision: decision,
          reason: reason
        })
      });

      const data = await res.json();
      if (res.ok) {
        this.showAlert(`Approval #${approvalId} recorded as ${decision.toUpperCase()} by ${this.state.activeRole}`, "success");
        await this.refreshAllData();
      } else if (res.status === 403) {
        this.showAlert(`HTTP 403 FORBIDDEN: ${data.message} (Switch to 'Department Approver' in the top navbar)`, "danger");
      } else {
        this.showAlert(`Error: ${data.message || data.detail}`, "danger");
      }
    } catch (e) {
      this.showAlert(`Error: ${e.message}`, "danger");
    }
  },

  async fetchDevOpsIntents() {
    try {
      const res = await fetch(`${API_BASE}/api/devops/intents`);
      if (res.ok) {
        const intents = await res.json();
        const tbody = document.querySelector("#devopsTable tbody");
        tbody.innerHTML = "";
        if (intents.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8">No DevOps integration intents queued.</td></tr>';
          return;
        }
        intents.forEach(i => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>#${i.id}</td>
            <td><code>${i.correlation_key}</code></td>
            <td>${i.service_name}</td>
            <td style="font-size: 0.75rem;"><pre>${i.payload}</pre></td>
            <td><span class="badge badge-${i.status === 'synced' ? 'available' : 'reserved'}">${i.status}</span></td>
            <td>${i.attempts}</td>
            <td>${i.last_error || 'None'}</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="app.retryDevOpsIntent(${i.id})">Retry Sync</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {
      console.error(e);
    }
  },

  async retryDevOpsIntent(intentId) {
    try {
      const res = await fetch(`${API_BASE}/api/devops/intents/${intentId}/retry`, { method: "POST" });
      if (res.ok) {
        this.showAlert(`Integration Intent #${intentId} synced successfully via idempotent correlation key.`, "success");
        await this.fetchDevOpsIntents();
        await this.fetchAuditLogs();
      }
    } catch (e) {
      this.showAlert(`Retry error: ${e.message}`, "danger");
    }
  },

  async fetchAuditLogs() {
    try {
      const res = await fetch(`${API_BASE}/api/audit?limit=25`);
      if (res.ok) {
        this.state.auditLogs = await res.json();
        const tbody = document.querySelector("#auditTable tbody");
        tbody.innerHTML = "";
        this.state.auditLogs.forEach(l => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>#${l.id}</td>
            <td>${l.timestamp.replace('T', ' ')}</td>
            <td><code>${l.entity_type}</code></td>
            <td>#${l.entity_id}</td>
            <td><strong>${l.action}</strong></td>
            <td>${l.performed_by}</td>
            <td style="font-size: 0.75rem;"><pre class="code-snippet">${l.details}</pre></td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {
      console.error(e);
    }
  },

  showAlert(message, type = "success") {
    const alert = document.getElementById("globalAlert");
    alert.className = `alert-box alert-${type} show`;
    alert.textContent = message;
    setTimeout(() => {
      alert.classList.remove("show");
    }, 6000);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  app.init();
});
