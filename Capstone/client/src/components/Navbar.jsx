import React from 'react';
import { Calendar, Ticket, ShieldCheck, Sparkles, Megaphone } from 'lucide-react';

export default function Navbar({ currentRole, setRole, onOpenMyTickets, onOpenAnnouncementsModal }) {
  return (
    <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5 cursor-pointer select-none">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-navy-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg sm:text-xl tracking-wider bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                  EVENTFLOW
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Campus OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-heading tracking-tight -mt-0.5 hidden xs:block">
                Smart Event Coordination Platform
              </p>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* My Tickets Button */}
            <button
              onClick={onOpenMyTickets}
              className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-heading font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 transition-all hover:border-brand-500/50 hover:text-white group"
              title="View my registered passes"
            >
              <Ticket className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">My Passes</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-navy-950 p-1 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setRole('participant')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-heading font-semibold transition-all duration-200 ${
                  currentRole === 'participant'
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                onClick={() => setRole('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-heading font-semibold transition-all duration-200 ${
                  currentRole === 'admin'
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin & Lead</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
