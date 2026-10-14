import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Users, 
  Layers, 
  RefreshCw, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api.js';
import EventFormModal from './EventFormModal.jsx';

export default function EventManager({ onManageRegistrations }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.fetchEvents({
        category: categoryFilter,
        search
      });
      setEvents(data);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [categoryFilter, search]);

  const handleCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (eventId) => {
    try {
      const fullEvent = await api.fetchEventById(eventId);
      setEditingEvent(fullEvent);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to load event for editing:', err);
    }
  };

  const handleDelete = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will delete all associated rounds and registrations.`)) {
      return;
    }

    try {
      await api.deleteEvent(eventId);
      loadEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Event Management Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5">
            Create, update schedules, assign rooms, and track capacity limits.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-heading font-semibold shadow-md shadow-brand-500/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title or venue..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-heading font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
          </select>

          <button
            onClick={loadEvents}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
            title="Refresh events table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events Table Container */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
            <p className="text-xs sm:text-sm font-heading font-semibold text-slate-700">Loading event catalog...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-heading font-bold text-slate-700 text-sm sm:text-base">No events found</h4>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">Click "Create New Event" above to publish your first campus event.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-heading font-bold uppercase tracking-wider text-xs">
                  <th className="py-4 px-4">Event Details</th>
                  <th className="py-4 px-4">Date & Venue</th>
                  <th className="py-4 px-4">Schedule Phases</th>
                  <th className="py-4 px-4">Capacity Meter</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {events.map((evt) => {
                  const capacity = evt.capacity || 100;
                  const registered = evt.registered_count || 0;
                  const pct = Math.min(100, Math.round((registered / capacity) * 100));

                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Title & Category */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100'}
                            alt={evt.title}
                            className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-sm"
                          />
                          <div>
                            <span className="font-heading font-bold text-slate-900 text-xs sm:text-sm block">
                              {evt.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold font-heading uppercase bg-indigo-50 text-brand-700 border border-indigo-200/60">
                                {evt.category}
                              </span>
                              <span className="text-xs text-slate-500 font-normal">
                                Coordinator: {evt.coordinator_name || evt.organizer_name || 'Campus Lead'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date & Venue */}
                      <td className="py-4 px-4 text-slate-600">
                        <div className="font-semibold text-slate-800 text-xs sm:text-sm">{evt.date}</div>
                        <div className="text-xs text-slate-500 font-normal truncate max-w-xs mt-0.5">📍 {evt.venue}</div>
                      </td>

                      {/* Rounds */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                          <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{evt.sessions_count || 1} Phases</span>
                        </span>
                      </td>

                      {/* Capacity Meter */}
                      <td className="py-4 px-4">
                        <div className="w-36 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">{registered}/{capacity} seats</span>
                            <span className="text-slate-500 font-medium">{pct}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct >= 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-brand-600 to-indigo-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${
                          evt.status === 'upcoming'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                            : evt.status === 'ongoing'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 animate-pulse'
                            : 'bg-slate-100 text-slate-600 border border-slate-200/80'
                        }`}>
                          {evt.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onManageRegistrations?.(evt.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 text-xs font-heading font-semibold transition-all active:scale-95 flex items-center gap-1 border border-slate-200"
                            title="Manage registrations & attendance roster"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Roster</span>
                          </button>

                          <button
                            onClick={() => handleEdit(evt.id)}
                            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-heading font-semibold transition-all active:scale-95 flex items-center gap-1 border border-slate-200"
                            title="Edit event details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          <button
                            onClick={() => handleDelete(evt.id, evt.title)}
                            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-heading font-semibold transition-all active:scale-95 flex items-center gap-1 border border-rose-200"
                            title="Delete event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventSaved={loadEvents}
        initialEvent={editingEvent}
      />

    </div>
  );
}
