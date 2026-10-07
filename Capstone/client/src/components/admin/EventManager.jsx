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
  ExternalLink,
  ChevronRight
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
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            Event Management Directory
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Create, update schedules, assign rooms, and track capacity limits.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-heading font-semibold shadow-md shadow-brand-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title or venue..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-heading font-medium text-slate-700 focus:outline-none cursor-pointer"
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
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
            title="Refresh events table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
            <p className="text-xs font-heading font-medium">Loading event catalog...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-heading font-bold text-slate-700 text-sm">No events found</h4>
            <p className="text-xs text-slate-400">Click "Create New Event" above to publish your first campus event.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-heading font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Event Details</th>
                  <th className="py-3.5 px-4">Date & Venue</th>
                  <th className="py-3.5 px-4">Rounds</th>
                  <th className="py-3.5 px-4">Capacity Meter</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
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
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div>
                            <span className="font-heading font-bold text-slate-900 text-xs sm:text-sm block">
                              {evt.title}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-heading uppercase bg-indigo-50 text-brand-700 border border-indigo-200/60">
                                {evt.category}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Coordinator: {evt.coordinator_name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date & Venue */}
                      <td className="py-4 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">{evt.date}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{evt.venue}</div>
                      </td>

                      {/* Rounds */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{evt.sessions_count || 1} Phases</span>
                        </span>
                      </td>

                      {/* Capacity Meter */}
                      <td className="py-4 px-4">
                        <div className="w-32 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-800">{registered}/{capacity}</span>
                            <span className="text-slate-400">{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 90 ? 'bg-rose-500' : 'bg-brand-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider ${
                          evt.status === 'upcoming'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : evt.status === 'ongoing'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {evt.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onManageRegistrations?.(evt.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-600 transition-colors"
                            title="Manage registrations & attendance"
                          >
                            <Users className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleEdit(evt.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Edit event details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(evt.id, evt.title)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete event"
                          >
                            <Trash2 className="w-4 h-4" />
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
