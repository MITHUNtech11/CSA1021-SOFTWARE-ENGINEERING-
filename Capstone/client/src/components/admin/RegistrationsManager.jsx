import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  Filter, 
  RefreshCw, 
  UserCheck, 
  Building,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { api } from '../../services/api.js';
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
      // Update local state smoothly
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === regId
            ? { ...r, attendance_status: nextStatus, check_in_time: nextStatus === 'checked_in' ? new Date().toISOString() : null }
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

  const handleExportCsv = () => {
    if (selectedEventId && selectedEventId !== 'All') {
      // Trigger native endpoint download
      window.open(`/api/events/${selectedEventId}/registrations/export`, '_blank');
    } else {
      // Export current filtered rows
      const headers = ['Ticket Code', 'Participant Name', 'Email', 'Phone', 'College', 'Department', 'Year', 'Event', 'Attendance Status'];
      const rows = filteredRegistrations.map((r) => [
        r.ticket_code,
        r.participant_name,
        r.email,
        r.phone,
        r.college,
        r.department,
        r.year_of_study,
        r.event_title || 'N/A',
        r.attendance_status || 'registered'
      ]);
      downloadCsvFromRows('eventflow-all-registrations', headers, rows);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    if (statusFilter === 'All') return true;
    return r.attendance_status === statusFilter;
  });

  const checkedInCount = filteredRegistrations.filter((r) => r.attendance_status === 'checked_in').length;
  const attendanceRate = filteredRegistrations.length > 0 ? Math.round((checkedInCount / filteredRegistrations.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            Attendee Registrations & Attendance Roster
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Manage registrations, toggle real-time check-in status, and export official attendee records to CSV.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-heading font-semibold shadow-md shadow-emerald-600/25 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Attendee CSV</span>
        </button>
      </div>

      {/* KPI Ticker Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total In Roster</span>
            <span className="font-heading font-bold text-2xl text-slate-900 mt-1 block">
              {filteredRegistrations.length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Live Checked-In</span>
            <span className="font-heading font-bold text-2xl text-emerald-700 mt-1 block">
              {checkedInCount}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Attendance Rate</span>
            <span className="font-heading font-bold text-2xl text-brand-600 mt-1 block">
              {attendanceRate}%
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by participant name, email, department, or ticket code..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Event Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-heading font-medium text-slate-700 focus:outline-none cursor-pointer max-w-xs truncate"
          >
            <option value="All">All Events</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>{evt.title}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-heading font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="registered">Registered Only</option>
            <option value="checked_in">Checked In Only</option>
          </select>

          <button
            onClick={loadRegistrations}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
            title="Refresh registrations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Attendee Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
            <p className="text-xs font-heading font-medium">Loading attendee directory...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-heading font-bold text-slate-700 text-sm">No registrations found</h4>
            <p className="text-xs text-slate-400">Try clearing the search or choosing a different event.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-heading font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Ticket Pass Code</th>
                  <th className="py-3.5 px-4">Attendee Name & Email</th>
                  <th className="py-3.5 px-4">College & Department</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Attendance Status</th>
                  <th className="py-3.5 px-4 text-right">Check-In Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredRegistrations.map((reg) => {
                  const isCheckedIn = reg.attendance_status === 'checked_in';
                  const isBusy = actionLoading[reg.id];

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Ticket Code */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 tracking-wider">
                          {reg.ticket_code}
                        </span>
                      </td>

                      {/* Participant Name & Email */}
                      <td className="py-4 px-4">
                        <span className="font-heading font-bold text-slate-900 text-xs sm:text-sm block">
                          {reg.participant_name}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {reg.email} • {reg.phone}
                        </div>
                      </td>

                      {/* College & Department */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-800 text-xs truncate max-w-xs">{reg.department}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{reg.college} ({reg.year_of_study})</div>
                      </td>

                      {/* Event */}
                      <td className="py-4 px-4 text-slate-700">
                        <span className="font-medium truncate block max-w-xs">{reg.event_title || 'Campus Event'}</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                            <Clock className="w-3 h-3 text-indigo-500" />
                            Registered
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleToggleAttendance(reg.id, reg.attendance_status)}
                          disabled={isBusy}
                          className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm ${
                            isCheckedIn
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                          }`}
                        >
                          {isCheckedIn ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Undo Check-In</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Mark Check-In</span>
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
