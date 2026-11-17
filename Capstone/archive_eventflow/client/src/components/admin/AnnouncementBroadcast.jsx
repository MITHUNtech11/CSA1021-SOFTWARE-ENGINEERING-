import React, { useState, useEffect } from 'react';
import { Megaphone, Trash2, Send, RefreshCw, Loader2, AlertCircle, AlertTriangle, Info, BellRing } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/useAuth.js';

export default function AnnouncementBroadcast() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'urgent',
    event_id: '',
    published_by: user ? `${user.name} (${user.roleTitle || 'Organizer'})` : 'Aarav Sharma (Tech Club Lead)'
  });

  // Keep publisher name in sync if user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        published_by: `${user.name} (${user.roleTitle || 'Organizer'})`
      }));
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ancs, evts] = await Promise.all([
        api.fetchAnnouncements(),
        api.fetchEvents()
      ]);
      setAnnouncements(ancs);
      setEvents(evts);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    try {
      setSubmitting(true);
      await api.createAnnouncement({
        ...formData,
        event_id: formData.event_id || null
      });

      // Reset form fields
      setFormData({
        title: '',
        message: '',
        priority: 'urgent',
        event_id: '',
        published_by: user ? `${user.name} (${user.roleTitle || 'Organizer'})` : 'Aarav Sharma (Tech Club Lead)'
      });

      loadData();
    } catch (err) {
      console.error('Failed to publish announcement:', err);
      alert('Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this broadcast notice?')) return;
    try {
      await api.deleteAnnouncement(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Announcement & Broadcast Center
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5">
          Push real-time urgent updates, room changes, and campus bulletins directly to attendee screens and notification banners.
        </p>
      </div>

      {/* Broadcast Creation Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shadow-sm border border-brand-100">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              Compose Live Campus Broadcast
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Notice will immediately synchronize across attendee portals and top alert tickers
            </p>
          </div>
        </div>

        <form onSubmit={handlePublish} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Target Scope */}
            <div>
              <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
                Target Scope / Audience *
              </label>
              <select
                value={formData.event_id}
                onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
              >
                <option value="">🌐 Campus-Wide (All Attendees)</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>📅 {evt.title}</option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
                Urgency Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
              >
                <option value="urgent">🚨 Critical Alert (Immediate Action Required)</option>
                <option value="update">⚠️ Schedule Shift (Room / Timing Change)</option>
                <option value="info">ℹ️ General Info Bulletin (General Announcement)</option>
              </select>
            </div>

            {/* Published By */}
            <div>
              <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
                Author / Lead Sign-Off *
              </label>
              <input
                type="text"
                required
                value={formData.published_by}
                onChange={(e) => setFormData({ ...formData, published_by: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

          </div>

          {/* Title */}
          <div>
            <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Hackathon Final Pitch Relocated to Innovation Wing Hall B"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs sm:text-sm font-heading font-semibold text-slate-700 mb-1.5">
              Broadcast Message Content *
            </label>
            <textarea
              required
              rows={2}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Provide exact instructions, venue room numbers, timings, and details for participants..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-heading font-semibold shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 disabled:opacity-75 active:scale-95"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Broadcast Announcement Now</span>
            </button>
          </div>

        </form>
      </div>

      {/* Existing Announcements Feed */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-brand-600" />
            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              Live Campus Broadcast Feed ({announcements.length})
            </h3>
          </div>
          
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh announcements feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {announcements.length === 0 ? (
          <p className="text-xs sm:text-sm text-slate-500 text-center py-8 font-normal">
            No broadcast notices published yet.
          </p>
        ) : (
          <div className="space-y-3">
            {announcements.map((anc) => (
              <div
                key={anc.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      anc.priority === 'urgent'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : anc.priority === 'update'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-brand-50 text-brand-700 border border-brand-200'
                    }`}>
                      {anc.priority === 'urgent' ? '🚨 Critical Alert' : anc.priority === 'update' ? '⚠️ Schedule Shift' : 'ℹ️ General Bulletin'}
                    </span>

                    <span className="font-heading font-bold text-sm sm:text-base text-slate-900">
                      {anc.title}
                    </span>

                    {anc.event_title && (
                      <span className="text-xs text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 font-medium">
                        [{anc.event_title}]
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed pt-0.5">
                    {anc.message}
                  </p>

                  <div className="text-xs text-slate-500 font-normal">
                    Published by <strong className="font-semibold text-slate-700">{anc.published_by}</strong> • {new Date(anc.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(anc.id)}
                  className="self-end sm:self-auto p-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors active:scale-95 shadow-sm"
                  title="Delete announcement notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
