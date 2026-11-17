import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import AnnouncementTicker from './AnnouncementTicker.jsx';
import EventFilters from './EventFilters.jsx';
import EventCard from './EventCard.jsx';
import EventDetailModal from './EventDetailModal.jsx';
import { useAuth } from '../context/useAuth.js';
import { Calendar, Compass, RefreshCw, Flame, Shield, Sparkles, Ticket, User, ArrowRight } from 'lucide-react';

export default function ParticipantPortal({ onRegisterEvent, onOpenMyTickets }) {
  const { user, openAuthModal } = useAuth();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passCount, setPassCount] = useState(0);

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

  // Fetch registered passes count for logged-in user
  const loadPassCount = async () => {
    if (user?.email) {
      try {
        const regs = await api.getMyRegistrations(user.email);
        setPassCount(Array.isArray(regs) ? regs.length : 0);
      } catch (err) {
        setPassCount(user.registeredEventsCount || 0);
      }
    } else {
      setPassCount(0);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus, search]);

  useEffect(() => {
    loadPassCount();
  }, [user]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Live Announcement Bulletin Bar */}
      <AnnouncementTicker announcements={announcements} />

      {/* Personalized Student Greeting Banner OR Guest Prompt */}
      {user ? (
        <section className="bg-gradient-to-r from-brand-900/10 via-indigo-900/10 to-violet-900/10 rounded-3xl p-5 sm:p-6 border border-brand-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  Welcome back, {user.name}!
                </h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-100 text-brand-700 border border-brand-200/80">
                  {user.statusBadge || user.roleTitle || 'Verified Student ID'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="px-3 py-1 rounded-xl bg-white/90 border border-slate-200/90 font-medium text-slate-700 shadow-2xs">
                  🎓 {user.department || 'Computer Science & Engineering'}
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/90 border border-slate-200/90 font-medium text-slate-700 shadow-2xs">
                  📅 {user.year || '3rd Year'}
                </span>
                {user.roll && (
                  <span className="px-3 py-1 rounded-xl bg-white/90 border border-slate-200/90 font-mono font-medium text-slate-700 shadow-2xs">
                    🆔 {user.roll}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenMyTickets}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-heading font-semibold text-xs sm:text-sm shadow-md shadow-brand-500/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Ticket className="w-4 h-4" />
              <span>View My Passes ({passCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-2xl p-4 sm:p-5 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <p className="font-medium text-amber-950 text-xs sm:text-sm">
              Sign in to enable 1-click event registration & instant QR passbook
            </p>
          </div>
          <button
            onClick={() => openAuthModal && openAuthModal('student')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition-all shrink-0 shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Student Sign In</span>
          </button>
        </section>
      )}

      {/* Hero Section with Poppins Bold/ExtraBold Typography */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-indigo-950 border border-slate-800 text-white p-6 sm:p-10 lg:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold tracking-wide shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>TechTrove & Campus Fest Season 2026</span>
          </div>

          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
            DISCOVER. COMPETE. <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
              CREATE IMPACT.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed max-w-2xl">
            Explore hackathons, combat robotics, cultural nights, technical bootcamps, and sports tournaments across college departments. Register seamlessly and access your digital QR event pass instantly.
          </p>

          {/* Quick Stats Highlights */}
          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Instant Digital QR Passes</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Compass className="w-4 h-4 text-brand-400" />
              <span>Real-time Room & Session Timelines</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
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
      <section className="space-y-4">
        
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-sm font-medium">Loading campus events schedule...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl p-8 border border-rose-200 shadow-sm max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Network Disconnection</h3>
            <p className="text-slate-500 text-sm font-normal max-w-sm mx-auto">{error}</p>
            <button
              onClick={loadData}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">No Matching Events Found</h3>
            <p className="text-slate-500 text-sm font-normal max-w-sm mx-auto">
              Try adjusting your category filter or search keywords to discover more campus events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={(ev) => setSelectedEvent(ev)}
                onRegister={(ev) => onRegisterEvent(ev)}
              />
            ))}
          </div>
        )}

      </section>

      {/* Detailed Event Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          onRegister={(ev) => {
            setSelectedEvent(null);
            onRegisterEvent(ev);
          }}
        />
      )}

    </div>
  );
}
