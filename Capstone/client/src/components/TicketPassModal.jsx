import React, { useRef, useState } from 'react';
import { X, Printer, CheckCircle, Calendar, Clock, MapPin, Sparkles, Download, ShieldCheck, Copy, Check } from 'lucide-react';
import { renderQrSvg } from '../utils/qrCode.js';

export default function TicketPassModal({ ticket, isOpen, onClose }) {
  const ticketRef = useRef(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !ticket) return null;

  const qrSvgString = renderQrSvg(ticket.ticket_code, 180, '#0F172A', '#FFFFFF');

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = async () => {
    if (!ticket?.ticket_code) return;
    try {
      await navigator.clipboard.writeText(ticket.ticket_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="max-w-md w-full my-8 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Celebration Message */}
        <div className="text-center mb-4 space-y-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-semibold shadow-lg">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Registration Confirmed!</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-normal">Your verified campus boarding ticket is ready.</p>
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
              <span className="font-heading font-extrabold text-xs tracking-widest text-indigo-300 uppercase">
                EVENTFLOW PASS
              </span>
              <span className="text-xs uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE PASS
              </span>
            </div>

            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white leading-tight tracking-tight">
              {ticket.event_title || ticket.title}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 font-normal">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>{ticket.event_date || ticket.date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>{ticket.event_venue || ticket.venue}</span>
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
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Attendee Name</span>
                <span className="font-heading font-bold text-slate-900 text-sm sm:text-base mt-0.5 block truncate">{ticket.participant_name}</span>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Department</span>
                <span className="font-medium text-slate-800 text-xs sm:text-sm mt-0.5 truncate block">{ticket.department}</span>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Institution</span>
                <span className="font-normal text-slate-700 text-xs sm:text-sm mt-0.5 truncate block">{ticket.college}</span>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Year of Study</span>
                <span className="font-normal text-slate-700 text-xs sm:text-sm mt-0.5 block">{ticket.year_of_study || 'Student'}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div 
                dangerouslySetInnerHTML={{ __html: qrSvgString }} 
                className="w-40 h-40 flex items-center justify-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm"
              />

              <div className="mt-4 text-center space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block">
                  Official Ticket Code
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono font-extrabold text-xl sm:text-2xl text-slate-900 tracking-wider bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                    {ticket.ticket_code}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-300 transition-all shadow-2xs active:scale-95 flex items-center gap-1 text-xs font-semibold"
                    title="Copy Ticket Code"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-600 text-center font-medium">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Present this QR code for instant contactless check-in at the venue.</span>
            </div>

          </div>

          {/* Ticket Footer Action Buttons */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Done
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-md shadow-brand-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Download / Print Pass</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
