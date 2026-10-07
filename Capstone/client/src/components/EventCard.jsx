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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1">
      
      {/* Banner Image with Overlays */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
          alt={event.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-heading font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm ${categoryStyle}`}>
            {event.category}
          </span>

          {event.sessions_count > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900/80 text-slate-200 border border-slate-700/80 backdrop-blur-md">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>{event.sessions_count} {event.sessions_count === 1 ? 'Round' : 'Rounds'}</span>
            </span>
          )}
        </div>

        {/* Date on Banner */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-xs font-heading font-medium">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/20">
            <Calendar className="w-3.5 h-3.5 text-brand-300" />
            {event.date}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/20">
            <Clock className="w-3.5 h-3.5 text-brand-300" />
            {event.start_time}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          <h3 className="font-heading font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {event.title}
          </h3>

          <p className="text-slate-600 text-xs font-sans line-clamp-2 mt-1.5 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Venue & Coordinator Info */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="truncate font-medium text-slate-700">{event.venue}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Lead: <strong className="text-slate-700">{event.coordinator_name}</strong></span>
            <span>Deadline: <strong className="text-slate-700">{event.registration_deadline}</strong></span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-slate-500 font-medium">
              <Users className="w-3.5 h-3.5" />
              <span>Capacity</span>
            </span>
            <span className="font-semibold text-slate-800">
              {registered}/{capacity} <span className="text-[11px] font-normal text-slate-500">({spotsLeft} spots left)</span>
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? 'bg-rose-500'
                  : percentFilled >= 85
                  ? 'bg-amber-500'
                  : 'bg-brand-500'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => onViewDetails(event)}
            className="w-full px-3 py-2 rounded-xl text-xs font-heading font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1"
          >
            <span>Schedule</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onRegister(event)}
            disabled={isFull}
            className={`w-full px-3 py-2 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-1 shadow-sm ${
              isFull
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/25 hover:shadow-md'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isFull ? 'Event Full' : 'Register'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
