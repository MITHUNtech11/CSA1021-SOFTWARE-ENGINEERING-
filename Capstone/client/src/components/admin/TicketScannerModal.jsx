import React, { useState } from 'react';
import { QrCode, Search, CheckCircle2, AlertTriangle, ShieldCheck, User, Calendar, MapPin, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../services/api.js';

export default function TicketScannerModal() {
  const [ticketCode, setTicketCode] = useState('EVF-2026-X801');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (codeToVerify) => {
    const code = (codeToVerify || ticketCode).trim();
    if (!code) return;

    try {
      setLoading(true);
      setError(null);
      setScanResult(null);

      const result = await api.verifyTicket(code);
      setScanResult(result);
    } catch (err) {
      console.error('Scan verification error:', err);
      setError(err.message || 'Verification failed. Invalid ticket code.');
    } finally {
      setLoading(false);
    }
  };

  const sampleCodes = ['EVF-2026-X801', 'EVF-2026-X802', 'EVF-2026-X804', 'EVF-2026-X806'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Rapid QR Ticket Scanner & Attendance Simulator
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
          Scan attendee QR barcodes or enter ticket credentials for rapid on-site check-in verification.
        </p>
      </div>

      {/* Simulator Control Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        
        {/* Mock Scanner Viewfinder with futuristic glass styling */}
        <div className="relative rounded-3xl bg-navy-950 p-6 sm:p-8 border border-slate-800 text-center text-white overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 via-transparent to-brand-500/10 pointer-events-none" />

          {/* Viewfinder crosshairs */}
          <div className="relative z-10 max-w-xs mx-auto border-2 border-brand-400/60 rounded-3xl p-6 bg-white/5 backdrop-blur-md shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/20 text-brand-300 flex items-center justify-center mx-auto mb-3 animate-pulse border border-brand-400/30">
              <QrCode className="w-8 h-8" />
            </div>
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-brand-300 block">
              Digital Barcode Sensor Active
            </span>
            <span className="text-[11px] text-slate-400 font-light mt-1 block">
              Simulates physical optical camera scanner
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
              Enter or Scan Ticket Pass Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EVF-2026-X801"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-base text-slate-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-heading font-semibold text-xs sm:text-sm shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 shrink-0 disabled:opacity-75 active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Verify & Check In</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Pre-filled Barcode Buttons */}
          <div className="pt-2">
            <span className="text-[11px] font-medium text-slate-500 block mb-2">
              ⚡ Quick Demo Sample Codes (Click to auto-simulate scan):
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleCodes.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setTicketCode(code);
                    handleVerify(code);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 border border-slate-200 transition-colors shadow-sm"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Verification Result Display */}
        {error && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 font-heading font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Verification Failed</span>
            </div>
            <p className="text-xs text-rose-700 font-normal">{error}</p>
          </div>
        )}

        {scanResult && scanResult.verified && (() => {
          const reg = scanResult.registration || scanResult;
          return (
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 border-2 border-emerald-400 text-emerald-950 space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-heading font-extrabold text-base sm:text-lg text-emerald-900 block">
                      {scanResult.message || 'Ticket Verified & Checked In!'}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-normal">
                      {scanResult.already_checked_in ? 'Attendee was already checked in earlier' : 'First-time check-in recorded successfully'}
                    </span>
                  </div>
                </div>

                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-xl bg-emerald-600 text-white shadow-sm">
                  VALID TICKET
                </span>
              </div>

              {/* Attendee Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-emerald-200/80 shadow-sm">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 block">Attendee Name</span>
                  <span className="font-heading font-bold text-sm text-slate-900 block mt-0.5">
                    {reg.participant_name}
                  </span>
                  <span className="text-slate-600 text-[11px] block mt-0.5 font-normal">
                    {reg.department}
                  </span>
                  <span className="text-slate-500 text-[10px] block font-light">
                    {reg.college} {reg.year_of_study ? `(${reg.year_of_study})` : ''}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-emerald-200/80 shadow-sm">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 block">Event & Venue</span>
                  <span className="font-heading font-bold text-sm text-slate-900 block mt-0.5">
                    {reg.event_title}
                  </span>
                  <span className="text-slate-600 text-[11px] block mt-0.5 font-normal">
                    📍 {reg.event_venue}
                  </span>
                  <span className="text-slate-500 text-[10px] block font-light">
                    📅 {reg.event_date || 'Today'} {reg.event_start_time ? `(${reg.event_start_time})` : ''}
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-1 font-mono">
                <span>Ticket ID: <strong>{reg.ticket_code}</strong></span>
                <span>Check-in Timestamp: {reg.check_in_time ? new Date(reg.check_in_time).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
              </div>

            </div>
          );
        })()}

      </div>

    </div>
  );
}
