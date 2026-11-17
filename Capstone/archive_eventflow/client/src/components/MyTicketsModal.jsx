import React, { useState, useEffect } from 'react';
import { X, Search, Ticket, Calendar, MapPin, CheckCircle, ArrowRight, Loader2, AlertCircle, Sparkles, QrCode, Filter, Compass } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/useAuth.js';

export default function MyTicketsModal({ isOpen, onClose, onViewPass }) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'upcoming' | 'checked_in'

  const loadPassesForEmail = async (searchEmail) => {
    if (!searchEmail || !searchEmail.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      const data = await api.getMyRegistrations(searchEmail.trim());
      setPasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to lookup tickets:', err);
      setError(err.message || 'Failed to retrieve passes. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (user?.email) {
        setEmail(user.email);
        loadPassesForEmail(user.email);
      } else if (email) {
        loadPassesForEmail(email);
      } else {
        setPasses([]);
        setHasSearched(false);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleManualSearch = (e) => {
    if (e) e.preventDefault();
    loadPassesForEmail(email);
  };

  // Filtered passes calculation
  const upcomingPasses = passes.filter((p) => p.attendance_status !== 'checked_in');
  const checkedInPasses = passes.filter((p) => p.attendance_status === 'checked_in');

  const displayedPasses = activeFilter === 'upcoming' 
    ? upcomingPasses 
    : activeFilter === 'checked_in' 
    ? checkedInPasses 
    : passes;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200/90 my-8 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with vibrant dark gradient and Poppins ExtraBold hierarchy */}
        <div className="p-6 bg-gradient-to-r from-navy-900 via-indigo-950 to-navy-900 text-white relative shrink-0 border-b border-indigo-900/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Close passbook"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center border border-brand-400/30 text-brand-300">
              <Ticket className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              My Passes & Bookings Passbook
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-light tracking-wide max-w-lg">
            {user 
              ? `Showing verified digital passes issued to ${user.name} (${user.email}).`
              : 'Look up your registered campus events and access your digital QR passes.'}
          </p>

          {/* Lookup Input for Guest or switching account */}
          <form onSubmit={handleManualSearch} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered college email..."
                className="w-full pl-4 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-400 font-normal focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white/15 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-heading font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-brand-500/25 active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Find Passes</span>
            </button>
          </form>
        </div>

        {/* Filter Tabs Bar (When Passes exist) */}
        {hasSearched && passes.length > 0 && (
          <div className="px-6 py-3 bg-slate-100/90 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveFilter('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-heading font-semibold transition-all ${
                activeFilter === 'All'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
              }`}
            >
              All Passes ({passes.length})
            </button>
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-heading font-semibold transition-all ${
                activeFilter === 'upcoming'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
              }`}
            >
              Upcoming ({upcomingPasses.length})
            </button>
            <button
              onClick={() => setActiveFilter('checked_in')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-heading font-semibold transition-all ${
                activeFilter === 'checked_in'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
              }`}
            >
              Attended / Checked-In ({checkedInPasses.length})
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/60">
          
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs sm:text-sm font-medium">Retrieving your passes & credentials...</p>
            </div>
          ) : !hasSearched ? (
            <div className="text-center py-10 space-y-3 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-brand-500">
                <Ticket className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-slate-800 text-base">Retrieve Your Digital Passbook</h4>
              <p className="text-xs sm:text-sm font-normal max-w-sm mx-auto">
                Enter your email address to access your tickets, QR barcodes, and session schedules.
              </p>
            </div>
          ) : displayedPasses.length === 0 ? (
            <div className="text-center py-12 space-y-4 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-2xs max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
                <Compass className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-slate-900 text-base sm:text-lg">
                  {passes.length === 0 ? 'No Event Passes Found' : 'No Passes in this Filter'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">
                  {passes.length === 0 
                    ? `No registrations found for ${email}. Explore campus hackathons, workshops, and competitions!`
                    : 'Try selecting a different filter above to view all passes.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-heading font-semibold text-xs sm:text-sm shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-2 mx-auto active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Campus Events</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 font-medium">
                <span>Showing {displayedPasses.length} {displayedPasses.length === 1 ? 'pass' : 'passes'}:</span>
              </div>

              {displayedPasses.map((pass) => (
                <div
                  key={pass.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-400 hover:shadow-lg transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-brand-600 transition-colors">
                        {pass.event_title}
                      </span>
                      {pass.attendance_status === 'checked_in' ? (
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Checked In
                        </span>
                      ) : (
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-brand-700 border border-indigo-200">
                          Active Pass
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-brand-500" />
                        <span>{pass.event_date}</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-brand-500" />
                        <span>{pass.event_venue}</span>
                      </span>
                      <span className="font-mono text-slate-900 font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-xs">
                        {pass.ticket_code}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onViewPass(pass);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-heading font-semibold transition-all shadow-md shadow-brand-500/25 hover:shadow-lg flex items-center justify-center gap-2 shrink-0 active:scale-95"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View QR Pass</span>
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            TechTrove • Campus Passbook System
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
