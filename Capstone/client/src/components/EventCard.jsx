import React from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight, Layers, UserCheck } from 'lucide-react';

const CATEGORY_COLORS = {
  Hackathon: 'bg-purple-500/10 text-purple-700 border-purple-200/80',
  Technical: 'bg-sky-500/10 text-sky-700 border-sky-200/80',
  Cultural: 'bg-pink-500/10 text-pink-700 border-pink-200/80',
  Sports: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/80',
  Workshop: 'bg-amber-500/10 text-amber-700 border-amber-200/80',
  Seminar: 'bg-indigo-500/10 text-indigo-700 border-indigo-200/80',
};

export default function EventCard({ event, onViewDetails, onRegister }) {
  const capacity = event.capacity || 100;
  const registered = event.registered_count || 0;
  const spotsLeft = Math.max(0, capacity - registered);
  const percentFilled = Math.min(100, Math.round((registered / capacity) * 100));
  const isFull = spotsLeft === 0;

  const categoryStyle = CATEGORY_COLORS[event.category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1.5">
      
      {/* Banner Image with Overlays */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
          alt={event.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm ${categoryStyle}`}>
            {event.category}
          </span>

          {event.sessions_count > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-900/85 text-slate-200 border border-slate-700/80 backdrop-blur-md shadow-sm">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{event.sessions_count} {event.sessions_count === 1 ? 'Round' : 'Rounds'}</span>
            </span>
          )}
        </div>

        {/* Date & Time on Banner */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white text-sm font-semibold">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-brand-300" />
            <span>{event.date}</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-brand-300" />
            <span>{event.start_time}</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors tracking-tight">
            {event.title}
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm font-normal line-clamp-2 mt-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Venue & Coordinator Info */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="truncate font-semibold text-slate-800">{event.venue}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Lead: <strong className="font-semibold text-slate-700">{event.coordinator_name}</strong></span>
            <span>Deadline: <strong className="font-semibold text-slate-700">{event.registration_deadline}</strong></span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Users className="w-4 h-4 text-brand-500" />
              <span>Capacity</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm">
                {registered}/{capacity}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-brand-700 border border-indigo-200/60">
                {spotsLeft} spots left
              </span>
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? 'bg-rose-500'
                  : percentFilled >= 85
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-brand-500 to-indigo-600'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={() => onViewDetails(event)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5 border border-slate-200/80 hover:border-slate-300 shadow-2xs active:scale-95"
          >
            <span>Timeline</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => onRegister(event)}
            disabled={isFull}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
              isFull
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-brand-600/30 hover:shadow-lg hover:scale-[1.02]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{isFull ? 'Event Full' : 'Register'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
