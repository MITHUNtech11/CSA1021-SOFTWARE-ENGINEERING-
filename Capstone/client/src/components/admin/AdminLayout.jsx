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
  X
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
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-navy-950 border-b border-slate-800 text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center font-display text-white text-xs font-bold">
            EF
          </div>
          <span className="font-display text-base tracking-wider text-white">ORGANIZER OS</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToParticipant}
            className="px-2.5 py-1 rounded-lg text-xs font-heading font-medium bg-slate-800 text-slate-200 border border-slate-700"
          >
            Student View
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-sm tracking-wider text-white block">ORGANIZER OS</span>
              <span className="text-[10px] text-brand-400 font-heading tracking-wide uppercase">Admin Command Center</span>
            </div>
          </div>

          {collapsed && (
            <div className="hidden lg:flex w-9 h-9 rounded-xl bg-brand-600 items-center justify-center text-white mx-auto shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white items-center justify-center transition-colors"
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
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-heading font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                } ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-medium bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all ${
              collapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
            title="Switch to public attendee portal"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            <span className={`${collapsed ? 'lg:hidden' : 'block'}`}>View Student Portal</span>
          </button>

          {/* Organizer card */}
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 ${collapsed ? 'lg:hidden' : 'flex'}`}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Organizer"
              className="w-8 h-8 rounded-full object-cover border border-brand-400/40"
            />
            <div className="truncate">
              <span className="font-heading font-bold text-xs text-white block truncate">Aarav Sharma</span>
              <span className="text-[10px] text-slate-400 truncate block">Tech Club Lead</span>
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
