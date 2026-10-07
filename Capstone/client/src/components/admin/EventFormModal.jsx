import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, MapPin, Users, Phone, Layers, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';

const CATEGORIES = ['Hackathon', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar'];

export default function EventFormModal({ isOpen, onClose, onEventSaved, initialEvent = null }) {
  const isEdit = !!initialEvent;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    venue: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00 AM',
    end_time: '05:00 PM',
    registration_deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    capacity: 100,
    coordinator_name: 'Aarav Sharma',
    coordinator_contact: '+91 98765 43210',
    banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    sessions: [
      {
        round_name: 'Round 1: Inauguration & Keynote',
        venue_room: 'Main Auditorium',
        start_time: '09:30 AM',
        end_time: '11:00 AM',
        description: 'Opening remarks and keynote presentation.'
      }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        title: initialEvent.title || '',
        description: initialEvent.description || '',
        category: initialEvent.category || 'Technical',
        venue: initialEvent.venue || '',
        date: initialEvent.date || '',
        start_time: initialEvent.start_time || '09:00 AM',
        end_time: initialEvent.end_time || '05:00 PM',
        registration_deadline: initialEvent.registration_deadline || '',
        capacity: initialEvent.capacity || 100,
        coordinator_name: initialEvent.coordinator_name || '',
        coordinator_contact: initialEvent.coordinator_contact || '',
        banner_url: initialEvent.banner_url || '',
        sessions: initialEvent.sessions && initialEvent.sessions.length > 0 ? initialEvent.sessions : [
          {
            round_name: 'Session 1',
            venue_room: initialEvent.venue || 'Room 101',
            start_time: '09:00 AM',
            end_time: '12:00 PM',
            description: ''
          }
        ]
      });
    } else {
      // Reset
      setFormData({
        title: '',
        description: '',
        category: 'Technical',
        venue: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00 AM',
        end_time: '05:00 PM',
        registration_deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        capacity: 100,
        coordinator_name: 'Aarav Sharma',
        coordinator_contact: '+91 98765 43210',
        banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
        sessions: [
          {
            round_name: 'Round 1: Screening & Briefing',
            venue_room: 'Main Hall',
            start_time: '09:30 AM',
            end_time: '11:30 AM',
            description: 'Participant check-in, orientation, and preliminary phase.'
          }
        ]
      });
    }
  }, [initialEvent, isOpen]);

  if (!isOpen) return null;

  const handleAddSession = () => {
    setFormData((prev) => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        {
          round_name: `Round ${prev.sessions.length + 1}`,
          venue_room: prev.venue || 'Room 201',
          start_time: '01:00 PM',
          end_time: '04:00 PM',
          description: ''
        }
      ]
    }));
  };

  const handleRemoveSession = (idx) => {
    setFormData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== idx)
    }));
  };

  const handleSessionChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.sessions];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, sessions: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.description.trim() || !formData.venue.trim()) {
      setError('Please fill all mandatory fields (Title, Description, Venue).');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await api.updateEvent(initialEvent.id, formData);
      } else {
        await api.createEvent(formData);
      }
      onEventSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save event:', err);
      setError(err.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200/80 my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-navy-900 to-indigo-950 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-heading font-bold uppercase tracking-wider bg-brand-500/30 text-brand-300 border border-brand-500/40 mb-1.5">
            {isEdit ? 'Update Event Details' : 'New Event Creator'}
          </span>

          <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
            {isEdit ? `Edit: ${initialEvent.title}` : 'Publish Campus Event & Schedule'}
          </h3>
          <p className="text-xs text-slate-300">
            Define event details, participant capacity limits, and multi-round room schedule sessions.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Autonomous Robotics Arena 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
              Event Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a comprehensive summary of the event, eligibility, objectives, and judging criteria..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Venue & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Primary Venue / Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Main Convention Center Hall A"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Participant Capacity Limit *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="5"
                  max="1000"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 100 })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Dates & Deadlines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Start & End Timings *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  placeholder="09:00 AM"
                  className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <input
                  type="text"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  placeholder="05:00 PM"
                  className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Registration Deadline *
              </label>
              <input
                type="date"
                required
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Coordinator Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Event Lead / Coordinator Name *
              </label>
              <input
                type="text"
                required
                value={formData.coordinator_name}
                onChange={(e) => setFormData({ ...formData, coordinator_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Coordinator Phone Contact *
              </label>
              <input
                type="text"
                required
                value={formData.coordinator_contact}
                onChange={(e) => setFormData({ ...formData, coordinator_contact: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Dynamic Multi-Round Session Builder */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>Rounds & Schedule Sessions</span>
                </h4>
                <p className="text-[11px] text-slate-500">Add multiple rounds, breakout tracks, and room assignments</p>
              </div>

              <button
                type="button"
                onClick={handleAddSession}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-heading font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Round</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.sessions.map((session, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3 relative group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-heading font-bold text-brand-600">
                      Phase #{idx + 1}
                    </span>

                    {formData.sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSession(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove round"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Round Name (e.g. Round 2: Hackathon Sprint)"
                      value={session.round_name}
                      onChange={(e) => handleSessionChange(idx, 'round_name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-heading font-medium text-slate-800"
                    />

                    <input
                      type="text"
                      required
                      placeholder="Room / Venue (e.g. Innovation Lab 301)"
                      value={session.venue_room}
                      onChange={(e) => handleSessionChange(idx, 'venue_room', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Start Time (e.g. 10:00 AM)"
                      value={session.start_time}
                      onChange={(e) => handleSessionChange(idx, 'start_time', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="End Time (e.g. 02:00 PM)"
                      value={session.end_time}
                      onChange={(e) => handleSessionChange(idx, 'end_time', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/30 transition-all flex items-center gap-2 disabled:opacity-75"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEdit ? 'Save Changes' : 'Create & Publish Event'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
