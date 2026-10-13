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
  Menu,
  X,
  Sparkles
} from 'lucide-react';

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
            <span className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase block -mt-0.5">
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
              <span className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase block">
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

        {/* Sidebar Footer: Organizer Profile & Student Portal Switcher */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          
          <button
            onClick={onSwitchToParticipant}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-heading font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 transition-all shadow-sm group ${
              collapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
            title="Switch to public attendee portal"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400 group-hover:scale-110 transition-transform" />
            <span className={`${collapsed ? 'lg:hidden' : 'block'}`}>View Student Portal</span>
          </button>

          {/* Organizer card */}
          <div className={`flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm ${collapsed ? 'lg:hidden' : 'flex'}`}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Organizer"
              className="w-8 h-8 rounded-full object-cover border-2 border-brand-400/40"
            />
            <div className="truncate">
              <span className="font-heading font-bold text-xs text-white block truncate">Aarav Sharma</span>
              <span className="text-[10px] text-slate-400 font-light truncate block">Tech Club Lead</span>
            </div>
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
