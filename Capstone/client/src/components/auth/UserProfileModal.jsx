import React from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Building, 
  GraduationCap, 
  ShieldCheck, 
  Ticket, 
  LogOut, 
  ArrowLeftRight, 
  Sparkles, 
  Calendar, 
  IdCard, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/useAuth.js';

export default function UserProfileModal({ isOpen, onClose, onOpenMyTickets, onSwitchUser }) {
  const { user, role, logout } = useAuth();

  if (!isOpen) return null;

  const handleSignOut = () => {
    logout();
    onClose();
  };

  const handleViewTickets = () => {
    onClose();
    if (onOpenMyTickets) onOpenMyTickets();
  };

  const handleSwitch = () => {
    onClose();
    if (onSwitchUser) onSwitchUser();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200/90 my-8 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Profile Banner */}
        <div className="relative bg-gradient-to-r from-navy-900 via-indigo-950 to-navy-900 p-6 text-white border-b border-indigo-900/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/40 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-navy-900"></span>
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-extrabold text-xl text-white tracking-tight truncate">
                  {user?.name || 'Campus Guest'}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold uppercase tracking-wider ${
                  role === 'admin'
                    ? 'bg-purple-500/25 text-purple-200 border border-purple-400/30'
                    : 'bg-brand-500/25 text-brand-200 border border-brand-400/30'
                }`}>
                  {user?.roleTitle || (role === 'admin' ? 'Organizer' : 'Student')}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-light truncate mt-0.5">
                {user?.college || 'Campus University of Technology'}
              </p>
            </div>
          </div>
        </div>

        {/* User Details Body */}
        <div className="p-6 space-y-5">
          {user ? (
            <>
              {/* Bio / Persona Tag */}
              {user.bio && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-normal">
                  <span className="font-heading font-bold text-slate-900 block mb-1">
                    Campus Persona & Status
                  </span>
                  {user.bio}
                </div>
              )}

              {/* Data Grid with icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Building className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Department
                    </span>
                  </div>
                  <p className="text-xs font-heading font-semibold text-slate-900 truncate">
                    {user.department || 'General Engineering'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <GraduationCap className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Academic Year
                    </span>
                  </div>
                  <p className="text-xs font-heading font-semibold text-slate-900 truncate">
                    {user.year || 'Undergraduate'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <IdCard className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      ID / Roll Number
                    </span>
                  </div>
                  <p className="text-xs font-mono font-semibold text-slate-900 truncate">
                    {user.roll || 'N/A'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Phone className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Contact Phone
                    </span>
                  </div>
                  <p className="text-xs font-heading font-semibold text-slate-900 truncate">
                    {user.phone || '+91 98765 43210'}
                  </p>
                </div>
              </div>

              {/* Email row */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <Mail className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="text-xs text-slate-800 font-medium truncate">
                    {user.email}
                  </span>
                </div>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-6 space-y-3">
              <p className="text-xs text-slate-600">
                You are currently browsing as a guest. Sign in to view your tickets or access organizer controls.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-200 space-y-2.5">
            {user && (
              <button
                onClick={handleViewTickets}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-heading font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>View My Passes</span>
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSwitch}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-heading font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-300/80 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Switch Persona</span>
              </button>

              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-heading font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-all border border-rose-200 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={handleSwitch}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-heading font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
