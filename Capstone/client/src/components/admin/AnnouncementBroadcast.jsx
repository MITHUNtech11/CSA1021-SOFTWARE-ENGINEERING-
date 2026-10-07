import React, { useState, useEffect } from 'react';
import { Megaphone, AlertTriangle, Bell, Info, Trash2, Send, RefreshCw, CheckCircle, Plus } from 'lucide-react';
import { api } from '../../services/api.js';

export default function AnnouncementBroadcast() {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'urgent',
    event_id: '',
    published_by: 'Aarav Sharma (Club Lead)'
  });

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

      // Reset
      setFormData({
        title: '',
        message: '',
        priority: 'urgent',
        event_id: '',
        published_by: 'Aarav Sharma (Club Lead)'
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
    if (!window.confirm('Delete this announcement?')) return;
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
        <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
          Announcement & Broadcast Center
        </h2>
        <p className="text-xs text-slate-500 font-sans mt-0.5">
          Push real-time urgent updates, room changes, and campus bulletins directly to the attendee interface.
        </p>
      </div>

      {/* Broadcast Creation Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Compose Live Campus Broadcast
            </h3>
            <p className="text-xs text-slate-500">Notice will appear in real time across the portal ticker</p>
          </div>
        </div>

        <form onSubmit={handlePublish} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Target Event */}
            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Target Audience / Scope *
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

            {/* Priority Tag */}
            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Broadcast Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
              >
                <option value="urgent">🚨 Urgent (Critical Red Alert)</option>
                <option value="update">⚠️ Update (Schedule/Room Change)</option>
                <option value="info">ℹ️ General Info Bulletin</option>
              </select>
            </div>

            {/* Publisher */}
            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Published By *
              </label>
              <input
                type="text"
                required
                value={formData.published_by}
                onChange={(e) => setFormData({ ...formData, published_by: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Hackathon Final Pitch Room Relocated to Innovation Wing"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
              Broadcast Message Content *
            </label>
            <textarea
              required
              rows={2}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Provide clear instructions for attendees..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-heading font-semibold shadow-md shadow-brand-600/30 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Announcement Now</span>
            </button>
          </div>

        </form>
      </div>

      {/* Existing Announcements List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Active Broadcast Feed ({announcements.length})
          </h3>
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
            title="Refresh announcements"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {announcements.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No announcements published yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((anc) => (
              <div
                key={anc.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      anc.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : anc.priority === 'update'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-brand-100 text-brand-700 border border-brand-200'
                    }`}>
                      {anc.priority}
                    </span>

                    <span className="font-heading font-bold text-sm text-slate-900">
                      {anc.title}
                    </span>

                    {anc.event_title && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        [{anc.event_title}]
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {anc.message}
                  </p>

                  <div className="text-[10px] text-slate-400 font-mono">
                    By {anc.published_by} • {new Date(anc.created_at).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(anc.id)}
                  className="self-end sm:self-auto p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors"
                  title="Delete announcement"
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
