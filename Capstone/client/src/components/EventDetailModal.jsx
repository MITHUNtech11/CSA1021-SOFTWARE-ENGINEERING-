import React from 'react';
import { X, Calendar, Clock, MapPin, Users, Phone, Mail, Award, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

export default function EventDetailModal({ event, isOpen, onClose, onRegister }) {
  if (!isOpen || !event) return null;

  const capacity = event.capacity || 100;
  const registered = event.registered_count || 0;
  const spotsLeft = Math.max(0, capacity - registered);
  const isFull = spotsLeft === 0;
  const sessions = event.sessions || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200/80 my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header Banner */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-900 shrink-0">
          <img
            src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Overlays */}
          <div className="absolute bottom-5 left-5 right-5 space-y-2">
            <span className="inline-block px-3 py-1 rounded-lg text-xs font-heading font-bold uppercase tracking-wider bg-brand-600/90 text-white backdrop-blur-md border border-brand-400/40 shadow-sm">
              {event.category}
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight drop-shadow-md">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Key Event Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Event Date</span>
              <div className="flex items-center gap-1.5 mt-1 font-heading font-semibold text-slate-800 text-xs sm:text-sm">
                <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{event.date}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Timings</span>
              <div className="flex items-center gap-1.5 mt-1 font-heading font-semibold text-slate-800 text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="truncate">{event.start_time}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Primary Venue</span>
              <div className="flex items-center gap-1.5 mt-1 font-heading font-semibold text-slate-800 text-xs sm:text-sm">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Registration</span>
              <div className="flex items-center gap-1.5 mt-1 font-heading font-semibold text-slate-800 text-xs sm:text-sm">
                <Users className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{registered}/{capacity}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-heading font-bold text-slate-900 text-base mb-2">About This Event</h4>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-sans">
              {event.description}
            </p>
          </div>

          {/* Multi-Round Schedule Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-brand-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-900 text-base">Rounds & Schedule Breakdown</h4>
                  <p className="text-xs text-slate-500">Official timeline and designated room venues</p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {sessions.length} {sessions.length === 1 ? 'Phase' : 'Phases'}
              </span>
            </div>

            {sessions.length > 0 ? (
              <div className="relative pl-6 border-l-2 border-brand-200 space-y-5 my-2">
                {sessions.map((session, index) => (
                  <div key={session.id || index} className="relative group">
                    {/* Timeline bullet dot */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-brand-600 shadow-sm" />

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-brand-300 hover:shadow-sm transition-all space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-heading font-bold text-sm text-slate-900">
                          {session.round_name}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-indigo-100/70 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.start_time} - {session.end_time}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-emerald-100/70 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.venue_room}
                          </span>
                        </div>
                      </div>

                      {session.description && (
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">
                          {session.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Schedule session timeline will be announced closer to the event date.
              </div>
            )}
          </div>

          {/* Event Coordinator Contact Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Faculty / Student Coordinator</span>
              <p className="font-heading font-bold text-sm text-slate-800 mt-0.5">{event.coordinator_name}</p>
              <p className="text-xs text-slate-500 font-sans">{event.organizer_name ? `${event.organizer_name} (${event.organizer_department || 'Campus'})` : 'Campus Organizing Committee'}</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <a 
                href={`tel:${event.coordinator_contact}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                <span>{event.coordinator_contact}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-xs text-slate-500 block">Registration Deadline</span>
            <span className="font-heading font-semibold text-slate-800 text-xs sm:text-sm">{event.registration_deadline}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                onRegister(event);
              }}
              disabled={isFull}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold transition-all flex items-center gap-1.5 shadow-md ${
                isFull
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/30'
              }`}
            >
              <span>{isFull ? 'Event Full' : 'Register Now'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
