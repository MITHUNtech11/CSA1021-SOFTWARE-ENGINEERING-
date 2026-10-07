import React, { useRef } from 'react';
import { X, Printer, CheckCircle, Calendar, Clock, MapPin, Sparkles, Download, ShieldCheck } from 'lucide-react';
import { renderQrSvg } from '../utils/qrCode.js';

export default function TicketPassModal({ ticket, isOpen, onClose }) {
  const ticketRef = useRef(null);
  if (!isOpen || !ticket) return null;

  const qrSvgString = renderQrSvg(ticket.ticket_code, 180, '#0F172A', '#FFFFFF');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="max-w-md w-full my-8 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Celebration Message */}
        <div className="text-center mb-4 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-heading font-semibold shadow-lg">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Registration Confirmed!</span>
          </div>
          <p className="text-xs text-slate-300">Your verified campus boarding ticket is ready.</p>
        </div>

        {/* Physical Boarding Pass Card */}
        <div 
          ref={ticketRef}
          className="bg-white rounded-3xl w-full shadow-2xl overflow-hidden border border-slate-200 relative print:border-none print:shadow-none"
        >
          
          {/* Top Navy Header */}
          <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-xs tracking-widest text-indigo-300 uppercase">
                EVENTFLOW PASS
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <h3 className="font-heading font-bold text-xl text-white leading-tight">
              {ticket.event_title || ticket.title}
            </h3>

            <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                {ticket.event_date || ticket.date}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                {ticket.event_venue || ticket.venue}
              </span>
            </div>
          </div>

          {/* Perforated Divider with Circular Notches */}
          <div className="relative h-6 bg-white flex items-center justify-between">
            <div className="w-4 h-8 bg-slate-950 rounded-r-full -ml-1 border-r border-slate-300/40" />
            <div className="flex-1 border-b-2 border-dashed border-slate-300 mx-2" />
            <div className="w-4 h-8 bg-slate-950 rounded-l-full -mr-1 border-l border-slate-300/40" />
          </div>

          {/* Attendee Details & QR Code */}
          <div className="p-6 pt-2 space-y-5">
            
            {/* Attendee details grid */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Attendee Name</span>
                <span className="font-heading font-bold text-slate-800 text-sm">{ticket.participant_name}</span>
              </div>

              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Department</span>
                <span className="font-heading font-medium text-slate-800 text-xs truncate block">{ticket.department}</span>
              </div>

              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Institution</span>
                <span className="font-sans text-slate-700 text-xs truncate block">{ticket.college}</span>
              </div>

              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Year of Study</span>
                <span className="font-sans text-slate-700 text-xs">{ticket.year_of_study || 'Student'}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div 
                dangerouslySetInnerHTML={{ __html: qrSvgString }} 
                className="w-40 h-40 flex items-center justify-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm"
              />

              <div className="mt-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">Ticket Code</span>
                <span className="font-mono font-bold text-lg text-slate-900 tracking-wider">
                  {ticket.ticket_code}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Present this pass or barcode for rapid check-in at the venue.</span>
            </div>

          </div>

          {/* Ticket Footer Action Buttons */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-heading font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Done
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save Pass</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
