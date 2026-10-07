import React, { useState } from 'react';
import { X, Search, Ticket, Calendar, MapPin, CheckCircle, Clock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

export default function MyTicketsModal({ isOpen, onClose, onViewPass }) {
  const [email, setEmail] = useState('aditya.nair@college.edu');
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      const data = await api.getMyRegistrations(email.trim());
      setPasses(data);
    } catch (err) {
      console.error('Failed to lookup tickets:', err);
      setError(err.message || 'Failed to retrieve passes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200/80 my-8 flex flex-col max-h-[85vh]"
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

          <div className="flex items-center gap-2 mb-1.5">
            <Ticket className="w-5 h-5 text-brand-400" />
            <h3 className="font-heading font-bold text-xl text-white">
              My Event Passes & Credentials
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-sans">
            Look up your registered campus events and access your digital QR tickets.
          </p>

          {/* Quick Lookup Form */}
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered college email..."
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-heading font-semibold transition-colors flex items-center gap-1.5 shrink-0 shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Find Passes</span>
            </button>
          </form>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!hasSearched ? (
            <div className="text-center py-8 space-y-2 text-slate-500">
              <Ticket className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Enter your email and click <strong>Find Passes</strong> to retrieve your registered events.</p>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
              >
                Click here to test lookup for Aditya Nair (Sample)
              </button>
            </div>
          ) : passes.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-slate-500">
              <p className="text-sm font-heading font-semibold text-slate-700">No registrations found for {email}</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Make sure you typed the exact email used during registration.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-xs font-medium text-slate-500 block">
                Found {passes.length} {passes.length === 1 ? 'registered pass' : 'registered passes'}:
              </span>

              {passes.map((pass) => (
                <div
                  key={pass.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-slate-900">
                        {pass.event_title}
                      </span>
                      {pass.attendance_status === 'checked_in' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Checked In
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                          Registered
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-500" />
                        {pass.event_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-500" />
                        {pass.event_venue}
                      </span>
                      <span className="font-mono text-slate-700 font-semibold">
                        Code: {pass.ticket_code}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onViewPass(pass);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-brand-600 text-slate-700 hover:text-white border border-slate-200 hover:border-brand-600 text-xs font-heading font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>View Pass</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-heading font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
