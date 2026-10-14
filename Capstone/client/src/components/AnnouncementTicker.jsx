import React, { useState } from 'react';
import { Megaphone, AlertTriangle, Info, Bell, X, ChevronRight } from 'lucide-react';

export default function AnnouncementTicker({ announcements = [], onSelectAnnouncement }) {
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (dismissed || !announcements || announcements.length === 0) {
    return null;
  }

  const current = announcements[currentIndex] || announcements[0];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Urgent</span>
          </span>
        );
      case 'update':
        return (
          <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Update</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-brand-500/20 text-brand-300 border border-brand-500/40">
            <Info className="w-3.5 h-3.5 text-brand-400" />
            <span>Info</span>
          </span>
        );
    }
  };

  const nextAnnouncement = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  return (
    <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-indigo-950 border-b border-indigo-900/40 text-slate-200 py-3 px-4 text-xs sm:text-sm font-sans relative shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <div className="flex items-center gap-2 shrink-0 font-heading font-extrabold text-xs sm:text-sm tracking-wide text-brand-300">
            <Megaphone className="w-4 h-4 text-brand-400 animate-bounce" />
            <span className="hidden sm:inline">CAMPUS BULLETIN:</span>
          </div>

          <div className="shrink-0">
            {getPriorityBadge(current.priority)}
          </div>

          <div 
            className="truncate flex-1 cursor-pointer hover:text-white transition-colors" 
            onClick={() => onSelectAnnouncement?.(current)}
          >
            <span className="font-bold text-white mr-2">{current.title}:</span>
            <span className="text-slate-300 text-xs sm:text-sm font-normal">{current.message}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {announcements.length > 1 && (
            <button
              onClick={nextAnnouncement}
              className="text-xs text-brand-300 hover:text-white font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 shadow-2xs"
              title="Next announcement"
            >
              <span>{currentIndex + 1}/{announcements.length}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss announcement ticker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
