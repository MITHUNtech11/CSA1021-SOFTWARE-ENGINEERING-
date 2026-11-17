import React from 'react';
import { 
  Calendar, 
  Ticket, 
  ShieldCheck, 
  Sparkles, 
  Cloud, 
  Database, 
  LogIn, 
  ChevronDown,
  User
} from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient.js';
import { useAuth } from '../context/useAuth.js';

export default function Navbar({ currentRole, setRole, onOpenMyTickets }) {
  const isCloudActive = isSupabaseConfigured();
  const { 
    user, 
    role, 
    isAuthenticated,
    openAuthModal,
    openProfileModal
  } = useAuth();

  const handleRoleToggle = (targetRole) => {
    if (targetRole === 'admin') {
      if (role !== 'admin') {
        openAuthModal('admin');
        return;
      }
      setRole('admin');
    } else {
      setRole('participant');
    }
  };

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
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                    EVENTFLOW
                  </span>
                  
                  {/* Cloud / Engine Indicator */}
                  {isCloudActive ? (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                      Supabase Cloud
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      <Database className="w-3.5 h-3.5 text-brand-400" />
                      FastAPI Engine
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-normal tracking-tight -mt-0.5 hidden xs:block">
                  Smart Campus Event Coordination Platform
                </p>
              </div>
            </div>

            {/* Quick Actions, Role Switcher & Auth Card */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              
              {/* My Tickets Button */}
              <button
                onClick={onOpenMyTickets}
                className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 transition-all hover:border-brand-500/50 hover:text-white group shadow-sm"
                title="View my registered passes"
              >
                <Ticket className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">My Passes</span>
              </button>

              {/* Role Switcher Pill */}
              <div className="flex items-center bg-navy-950 p-1 rounded-2xl border border-slate-800 shadow-inner">
                <button
                  onClick={() => handleRoleToggle('participant')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    currentRole === 'participant'
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>

                <button
                  onClick={() => handleRoleToggle('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    currentRole === 'admin'
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={role !== 'admin' ? 'Click to login as Organizer / Faculty' : 'Switch to Admin Suite'}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin & Lead</span>
                </button>
              </div>

              {/* User Authentication Profile Pill / Sign In Button */}
              {isAuthenticated && user ? (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2.5 p-1.5 sm:pr-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/90 text-left transition-all hover:border-brand-500/40 shadow-sm group"
                  title="Open user profile settings"
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-white/20 shadow-sm"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-navy-900"></span>
                    </span>
                  </div>

                  <div className="hidden md:block max-w-[130px]">
                    <span className="font-heading font-bold text-xs text-white block truncate leading-tight group-hover:text-brand-300 transition-colors">
                      {user.name}
                    </span>
                    <span className="text-xs text-slate-400 font-medium block truncate leading-tight mt-0.5">
                      {user.role === 'admin' ? (user.roleTitle || 'Organizer') : 'Student'}
                    </span>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors hidden sm:block shrink-0" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthTab('student');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-heading font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 transition-all shadow-md shadow-brand-500/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}

            </div>

          </div>
        </div>
      </header>
  );
}
