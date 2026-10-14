import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  UserCheck,
  Calendar,
  Building,
  Check,
  XCircle
} from 'lucide-react';
import { api } from '../../services/api.js';
import { isSupabaseConfigured } from '../../services/supabaseClient.js';
import { downloadCsvFromRows } from '../../utils/csvExport.js';

export default function RegistrationsManager({ initialEventId = null }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId || 'All');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const fetchEventsList = async () => {
      try {
        const evts = await api.fetchEvents();
        setEvents(evts);
      } catch (err) {
        console.error('Error loading events:', err);
      }
    };
    fetchEventsList();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await api.fetchRegistrations({
        event_id: selectedEventId,
        search
      });
      setRegistrations(data);
    } catch (err) {
      console.error('Error loading registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [selectedEventId, search]);

  const handleToggleAttendance = async (regId, currentStatus) => {
    const nextStatus = currentStatus === 'checked_in' ? 'registered' : 'checked_in';
    try {
      setActionLoading((prev) => ({ ...prev, [regId]: true }));
      await api.toggleAttendance(regId, nextStatus);
      // Update local state smoothly and immediately
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === regId
            ? { 
                ...r, 
                attendance_status: nextStatus, 
                status: nextStatus,
                check_in_time: nextStatus === 'checked_in' ? new Date().toISOString() : null 
              }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to toggle attendance:', err);
      alert('Failed to update attendance status.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [regId]: false }));
    }
  };

  // Filter registrations client-side for immediate responsiveness
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      // Status filter
      const curStatus = r.attendance_status || r.status || 'registered';
      if (statusFilter !== 'All' && curStatus !== statusFilter) {
        return false;
      }

      // Real-time multi-field search filter
      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = (r.participant_name || '').toLowerCase().includes(q);
        const matchesEmail = (r.email || '').toLowerCase().includes(q);
        const matchesCollege = (r.college || '').toLowerCase().includes(q);
        const matchesDept = (r.department || '').toLowerCase().includes(q);
        const matchesCode = (r.ticket_code || '').toLowerCase().includes(q);
        const matchesEvent = (r.event_title || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesCollege && !matchesDept && !matchesCode && !matchesEvent) {
          return false;
        }
      }

      return true;
    });
  }, [registrations, statusFilter, search]);

  // 1-Click UTF-8 CSV Export
  const exportRegistrationsCsv = () => {
    const headers = [
      'Ticket Code', 
      'Attendee Name', 
      'Email', 
      'Phone', 
      'Department', 
      'College', 
      'Year of Study', 
      'Event Title', 
      'Registered Date',
      'Attendance Status',
      'Check-in Timestamp'
    ];

    const rows = filteredRegistrations.map((r) => [
      r.ticket_code || 'N/A',
      r.participant_name || 'N/A',
      r.email || 'N/A',
      r.phone || 'N/A',
      r.department || 'N/A',
      r.college || 'Campus University of Technology',
      r.year_of_study || 'N/A',
      r.event_title || 'Campus Event',
      r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Active Registration',
      r.attendance_status === 'checked_in' ? 'Attended / Checked In' : 'Registered',
      r.check_in_time ? new Date(r.check_in_time).toLocaleString() : 'Pending'
    ]);

    const activeEvent = events.find(e => e.id === selectedEventId);
    const eventSlug = activeEvent ? activeEvent.title.replace(/[^a-zA-Z0-9]/g, '_') : 'all_events';
    const filename = `eventflow_attendee_roster_${eventSlug}_${new Date().toISOString().split('T')[0]}`;
    
    downloadCsvFromRows(filename, headers, rows);
  };

  const checkedInCount = filteredRegistrations.filter((r) => (r.attendance_status === 'checked_in' || r.status === 'checked_in')).length;
  const attendanceRate = filteredRegistrations.length > 0 ? Math.round((checkedInCount / filteredRegistrations.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Attendee Registrations & Attendance Roster
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5">
            Manage registrations, toggle real-time check-in status, and export official attendee records to CSV.
          </p>
        </div>

        <button
          onClick={exportRegistrationsCsv}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-heading font-semibold shadow-md shadow-emerald-600/25 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export Attendee CSV</span>
        </button>
      </div>

      {/* KPI Ticker Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-heading font-bold text-slate-600 uppercase tracking-wider block">
              Total In Roster
            </span>
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1 block">
              {filteredRegistrations.length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm border border-indigo-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-heading font-bold text-slate-600 uppercase tracking-wider block">
              Live Checked-In
            </span>
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-700 mt-1 block">
              {checkedInCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-heading font-bold text-slate-600 uppercase tracking-wider block">
              Attendance Rate
            </span>
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-600 mt-1 block">
              {attendanceRate}%
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shadow-sm border border-brand-100">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Real-time Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by attendee name, email, department, college, or ticket code..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Event Selector & Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-heading font-medium text-slate-700 focus:outline-none cursor-pointer max-w-xs truncate"
          >
            <option value="All">All Events Catalog</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>{evt.title}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-heading font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="registered">Registered Only</option>
            <option value="checked_in">Checked In Only</option>
          </select>

          <button
            onClick={loadRegistrations}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
            title="Refresh registrations roster"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Attendee Roster Table */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
            <p className="text-xs sm:text-sm font-heading font-semibold text-slate-700">Loading attendee directory...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-heading font-bold text-slate-700 text-sm sm:text-base">No registrations found</h4>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">Try clearing the search query or selecting a different event from the catalog dropdown.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-heading font-bold uppercase tracking-wider text-xs">
                  <th className="py-4 px-4">Attendee Name & Email</th>
                  <th className="py-4 px-4">Department & College</th>
                  <th className="py-4 px-4">Year</th>
                  <th className="py-4 px-4">Ticket Pass Code</th>
                  <th className="py-4 px-4">Registered Date</th>
                  <th className="py-4 px-4">Attendance Status</th>
                  <th className="py-4 px-4 text-right">1-Click Check-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredRegistrations.map((reg) => {
                  const isCheckedIn = (reg.attendance_status === 'checked_in' || reg.status === 'checked_in');
                  const isBusy = actionLoading[reg.id];
                  const registeredDate = reg.created_at 
                    ? new Date(reg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Oct 2026';

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Attendee Name & Email */}
                      <td className="py-4 px-4">
                        <span className="font-heading font-bold text-slate-900 text-xs sm:text-sm block">
                          {reg.participant_name}
                        </span>
                        <div className="text-xs text-slate-500 font-normal mt-0.5">
                          {reg.email} {reg.phone ? `• ${reg.phone}` : ''}
                        </div>
                      </td>

                      {/* Department & College */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate max-w-xs">
                          {reg.department || 'Computer Science'}
                        </div>
                        <div className="text-xs text-slate-500 font-normal truncate max-w-xs mt-0.5">
                          {reg.college || 'Campus University of Technology'}
                        </div>
                      </td>

                      {/* Year */}
                      <td className="py-4 px-4 text-slate-700">
                        <span className="font-medium text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                          {reg.year_of_study || '3rd Year'}
                        </span>
                      </td>

                      {/* Ticket Code */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-xl bg-indigo-50 text-brand-700 border border-indigo-200/70 tracking-wider shadow-sm">
                          {reg.ticket_code}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-4 text-slate-600">
                        <span className="text-xs font-normal text-slate-700">
                          {registeredDate}
                        </span>
                      </td>

                      {/* Attendance Status */}
                      <td className="py-4 px-4">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            Registered
                          </span>
                        )}
                      </td>

                      {/* 1-Click Check-In Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleToggleAttendance(reg.id, reg.attendance_status || reg.status)}
                          disabled={isBusy}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95 ${
                            isCheckedIn
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                          }`}
                        >
                          {isCheckedIn ? (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-500" />
                              <span>Undo Check-In</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Mark Attended</span>
                            </>
                          )}
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
