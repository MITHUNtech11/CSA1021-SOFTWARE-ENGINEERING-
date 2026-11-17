import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, MapPin, Users, Layers, Loader2, AlertCircle, FileText } from 'lucide-react';
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
        round_name: 'Round 1: Screening & Briefing',
        venue_room: 'Main Hall',
        start_time: '09:30 AM',
        end_time: '11:30 AM',
        description: 'Participant check-in, orientation, and preliminary phase.'
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
            description: 'Main event session and project presentation.'
          }
        ]
      });
    } else {
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
          description: 'Hands-on hackathon sprint and live code demonstration.'
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200/90 my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-navy-900 via-indigo-950 to-navy-900 text-white relative shrink-0 border-b border-indigo-900/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider bg-brand-500/25 text-brand-300 border border-brand-500/40 mb-2">
            {isEdit ? 'Update Event Details' : 'New Event Creator'}
          </span>

          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
            {isEdit ? `Edit: ${initialEvent.title}` : 'Publish Campus Event & Schedule'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-normal tracking-wide mt-0.5">
            Define event details, participant capacity limits, and multi-round room schedule sessions.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">
          
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Autonomous Robotics Arena 2026"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
              Event Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a comprehensive summary of the event, eligibility, objectives, and judging criteria..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Venue & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Dates & Deadlines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
                Start & End Timings *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  placeholder="09:00 AM"
                  className="w-full px-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-center font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <input
                  type="text"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  placeholder="05:00 PM"
                  className="w-full px-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-center font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
                Registration Deadline *
              </label>
              <input
                type="date"
                required
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Coordinator Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
                Event Lead / Coordinator Name *
              </label>
              <input
                type="text"
                required
                value={formData.coordinator_name}
                onChange={(e) => setFormData({ ...formData, coordinator_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
                Coordinator Phone Contact *
              </label>
              <input
                type="text"
                required
                value={formData.coordinator_contact}
                onChange={(e) => setFormData({ ...formData, coordinator_contact: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Banner URL */}
          <div>
            <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
              Event Banner Image URL
            </label>
            <input
              type="text"
              value={formData.banner_url}
              onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Dynamic Multi-Round Session Builder */}
          <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>Rounds & Schedule Sessions</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                  Configure multi-round competition phases, room allocations, timings, and instructions
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSession}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-heading font-semibold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Round</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.sessions.map((session, idx) => (
                <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 relative group">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <span className="text-xs sm:text-sm font-heading font-bold text-brand-600">
                      Phase #{idx + 1}
                    </span>

                    {formData.sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSession(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-medium"
                        title="Remove round"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        <span className="text-rose-600">Remove Phase</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Round / Phase Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Round 2: Hackathon Sprint"
                        value={session.round_name}
                        onChange={(e) => handleSessionChange(idx, 'round_name', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-heading font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Assigned Room / Venue *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Innovation Lab 301"
                        value={session.venue_room}
                        onChange={(e) => handleSessionChange(idx, 'venue_room', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Start Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 10:00 AM"
                        value={session.start_time}
                        onChange={(e) => handleSessionChange(idx, 'start_time', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        End Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 02:00 PM"
                        value={session.end_time}
                        onChange={(e) => handleSessionChange(idx, 'end_time', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Round Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Round Objectives & Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="Brief summary of tasks, deliverables, and judging metrics for this round..."
                      value={session.description || ''}
                      onChange={(e) => handleSessionChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
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
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 disabled:opacity-75 active:scale-95"
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
