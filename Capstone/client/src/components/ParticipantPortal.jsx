import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import AnnouncementTicker from './AnnouncementTicker.jsx';
import EventFilters from './EventFilters.jsx';
import EventCard from './EventCard.jsx';
import EventDetailModal from './EventDetailModal.jsx';
import { Sparkles, Calendar, Compass, RefreshCw, Flame, Award, Shield } from 'lucide-react';

export default function ParticipantPortal({ onRegisterEvent, onOpenMyTickets }) {
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal state
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [eventsData, ancsData] = await Promise.all([
        api.fetchEvents({
          category: selectedCategory,
          status: selectedStatus,
          search
        }),
        api.fetchAnnouncements()
      ]);
      setEvents(eventsData);
      setAnnouncements(ancsData);
    } catch (err) {
      console.error('Failed to load portal data:', err);
      setError('Unable to reach event servers. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus, search]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Live Announcement Bulletin Bar */}
      <AnnouncementTicker announcements={announcements} />

      {/* Hero Section with Akira Brand Display */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-indigo-950 border border-slate-800 text-white p-6 sm:p-10 lg:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-heading font-medium tracking-wide">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>TechTrove & Campus Fest Season 2026</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wide leading-tight">
            DISCOVER. COMPETE. <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
              CREATE IMPACT.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base font-sans leading-relaxed max-w-2xl">
            Explore hackathons, combat robotics, cultural nights, technical bootcamps, and sports tournaments across college departments. Register seamlessly and access your digital QR event pass instantly.
          </p>

          {/* Quick Stats Highlights */}
          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Instant Digital QR Passes</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-400" />
              <span>Real-time Room & Session Timelines</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Campus Verified Credentials</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="space-y-4">
        <EventFilters
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          totalCount={events.length}
        />
      </section>

      {/* Events Grid */}
      <section>
        {loading ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-sm font-heading font-medium">Loading campus events schedule...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-800 text-lg">No events found matching your criteria</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Try searching for different keywords or clear the category filters to browse all campus activities.
              </p>
            </div>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedStatus('All');
              }}
              className="px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-brand-600 hover:bg-brand-700 text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={(evt) => setSelectedEvent(evt)}
                onRegister={(evt) => onRegisterEvent(evt)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Event Details & Schedule Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={(evt) => {
          setSelectedEvent(null);
          onRegisterEvent(evt);
        }}
      />

    </div>
  );
}
