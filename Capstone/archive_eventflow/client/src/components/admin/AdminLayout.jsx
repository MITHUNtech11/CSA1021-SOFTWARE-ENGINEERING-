import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Megaphone, 
  QrCode, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert,
  Menu, 
  X, 
  LogOut,
  UserCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/useAuth.js';

const NAV_ITEMS = [
  { id: 'overview', label: 'Analytics & KPIs', icon: BarChart3 },
  { id: 'events', label: 'Event Manager', icon: Calendar },
  { id: 'registrations', label: 'Registrations & Check-In', icon: Users },
  { id: 'announcements', label: 'Broadcast Center', icon: Megaphone },
  { id: 'scanner', label: 'QR Scanner Simulator', icon: QrCode }
];

export default function AdminLayout({ activeTab, setActiveTab, onSwitchToParticipant, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, loginAsDemo, openAuthModal, logout } = useAuth();

  const isAdmin = user && user.role === 'admin';

  // Role Guard: If not an organizer/admin, render elegant authorization gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-between font-sans relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Navbar */}
        <header className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-xs shadow-md shadow-brand-500/25 border border-indigo-400/30">
              EF
            </div>
            <div>
              <span className="font-heading font-extrabold text-base tracking-tight text-white block">
                EVENTFLOW OS
              </span>
              <span className="text-xs text-brand-400 font-semibold tracking-wider uppercase block">
                Organizer & Admin Command Center
              </span>
            </div>
          </div>

          <button
            onClick={onSwitchToParticipant}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <span>Back to Student Portal</span>
            <ArrowRight className="w-4 h-4 text-brand-400" />
          </button>
        </header>

        {/* Center Card: Role Guard Gate */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
          <div className="max-w-xl w-full bg-slate-950/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl text-center space-y-6">
            
            {/* Lock Badge */}
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                Admin Authentication Required
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed max-w-md mx-auto">
                The Organizer OS Command Center is restricted to verified Club Leads, Faculty Coordinators, and Event Operations Staff.
              </p>
            </div>

            {/* Current State Info */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"}
                  alt="Current Persona"
                  className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shrink-0"
                />
                <div>
                  <span className="text-xs sm:text-sm font-heading font-bold text-white block">
                    {user?.name || 'Guest Student'}
                  </span>
                  <span className="text-xs text-slate-400 font-normal block">
                    Current Role: {user ? (user.roleTitle || user.role) : 'Public Guest'}
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-heading font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Unauthorized
              </span>
            </div>

            {/* 1-Click Demo Switcher Section */}
            <div className="space-y-3 pt-2 text-left">
              <span className="text-xs font-heading font-semibold text-slate-400 block tracking-wider uppercase">
                ⚡ Instant 1-Click Access as Verified Organizer:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Aarav Sharma (Tech Club Lead) */}
                <button
                  type="button"
                  onClick={() => loginAsDemo('user_aarav')}
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-brand-500/60 text-left transition-all group flex items-center gap-3"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Aarav Sharma"
                    className="w-10 h-10 rounded-xl object-cover border border-brand-400/40 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="truncate">
                    <span className="font-heading font-bold text-xs sm:text-sm text-white block group-hover:text-brand-300 transition-colors truncate">
                      Aarav Sharma
                    </span>
                    <span className="text-xs text-brand-400 font-normal truncate block">
                      Tech Club Lead
                    </span>
                  </div>
                </button>

                {/* Option 2: Dr. K. Raman (Faculty Coordinator) */}
                <button
                  type="button"
                  onClick={() => loginAsDemo('user_raman')}
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/60 text-left transition-all group flex items-center gap-3"
                >
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
                    alt="Dr. K. Raman"
                    className="w-10 h-10 rounded-xl object-cover border border-indigo-400/40 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="truncate">
                    <span className="font-heading font-bold text-xs sm:text-sm text-white block group-hover:text-indigo-300 transition-colors truncate">
                      Dr. K. Raman
                    </span>
                    <span className="text-xs text-indigo-400 font-normal truncate block">
                      Faculty Coordinator
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Standard Login & Back Actions */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => openAuthModal('admin')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-heading font-semibold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all"
              >
                Log In with Admin Account
              </button>

              <button
                type="button"
                onClick={onSwitchToParticipant}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-heading font-semibold text-xs sm:text-sm border border-slate-700 transition-colors"
              >
                Back to Public Events
              </button>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 text-center text-xs text-slate-500 relative z-10 border-t border-slate-800/60">
          EventFlow Campus Operating System • Secure Role-Based Access Control (RBAC)
        </footer>
      </div>
    );
  }

  // Authenticated Organizer/Admin Workspace Layout
  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col lg:flex-row font-sans">
      
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-navy-950/95 backdrop-blur-md border-b border-slate-800 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-violet-400 flex items-center justify-center font-extrabold text-white text-xs shadow-md shadow-brand-500/25 border border-indigo-400/30">
            EF
          </div>
          <div>
            <span className="font-heading font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent block">
              ORGANIZER OS
            </span>
            <span className="text-xs text-brand-400 font-semibold tracking-wider uppercase block -mt-0.5">
              Admin Suite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToParticipant}
            className="px-3 py-1.5 rounded-xl text-xs font-heading font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all shadow-sm"
          >
            Student View
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto bg-navy-950 border-r border-slate-800/80 text-slate-300 flex flex-col justify-between transition-all duration-300 shadow-2xl lg:shadow-none ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${collapsed ? 'lg:hidden' : 'block'}`}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-violet-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 border border-indigo-400/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-sm tracking-tight text-white block">
                ORGANIZER OS
              </span>
              <span className="text-xs text-brand-400 font-semibold tracking-wider uppercase block">
                Admin Command Center
              </span>
            </div>
          </div>

          {collapsed && (
            <div className="hidden lg:flex w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 items-center justify-center text-white mx-auto shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white items-center justify-center transition-colors border border-slate-700/50"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-heading font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 text-white shadow-lg shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                } ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white scale-110' : 'text-slate-400'}`} />
                <span className={`truncate ${collapsed ? 'lg:hidden' : 'block'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Organizer Profile & Controls */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          
          {/* Active Admin Profile Card */}
          <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm ${collapsed ? 'lg:hidden' : 'block'}`}>
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"}
                alt="Organizer"
                className="w-10 h-10 rounded-2xl object-cover border-2 border-brand-400/40 shrink-0"
              />
              <div className="truncate flex-1">
                <span className="font-heading font-bold text-xs sm:text-sm text-white block truncate">
                  {user?.name || 'Aarav Sharma'}
                </span>
                <span className="text-xs text-brand-300 font-medium truncate block">
                  {user?.roleTitle || 'Tech Club Lead'}
                </span>
                <span className="text-xs text-slate-400 font-light truncate block mt-0.5">
                  {user?.department || 'Computer Science & Eng.'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              onClick={onSwitchToParticipant}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-heading font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 transition-all shadow-sm group ${
                collapsed ? 'lg:justify-center lg:px-2' : ''
              }`}
              title="Switch to public attendee portal"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className={`${collapsed ? 'lg:hidden' : 'block'}`}>Switch to Student View</span>
            </button>

            <button
              onClick={logout}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all ${
                collapsed ? 'lg:justify-center lg:px-2' : ''
              }`}
              title="Sign out of Admin Session"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className={`${collapsed ? 'lg:hidden' : 'block'}`}>Sign Out</span>
            </button>
          </div>

        </div>

      </aside>

      {/* Main Content View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>

    </div>
  );
}
