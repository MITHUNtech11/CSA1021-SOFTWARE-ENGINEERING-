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
        <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
          Rapid QR Ticket Scanner & Attendance Simulator
        </h2>
        <p className="text-xs text-slate-500 font-sans mt-0.5">
          Scan attendee QR barcodes or enter ticket credentials for rapid on-site check-in verification.
        </p>
      </div>

      {/* Simulator Control Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        
        {/* Mock Scanner Viewfinder */}
        <div className="relative rounded-2xl bg-navy-950 p-6 sm:p-8 border border-slate-800 text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 via-transparent to-brand-500/10 pointer-events-none" />

          {/* Viewfinder crosshairs */}
          <div className="relative z-10 max-w-xs mx-auto border-2 border-brand-400/60 rounded-2xl p-6 bg-white/5 backdrop-blur-sm shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/20 text-brand-300 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <QrCode className="w-8 h-8" />
            </div>
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-brand-300 block">
              Digital Barcode Sensor Active
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-base text-slate-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-heading font-semibold text-xs sm:text-sm shadow-md shadow-brand-600/30 transition-all flex items-center gap-2 shrink-0 disabled:opacity-75"
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
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 border border-slate-200 transition-colors"
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
            <p className="text-xs text-rose-700 font-sans">{error}</p>
          </div>
        )}

        {scanResult && scanResult.verified && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 border-2 border-emerald-400 text-emerald-950 space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-heading font-extrabold text-base text-emerald-900 block">
                    {scanResult.message}
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    {scanResult.already_checked_in ? 'Attendee was already checked in earlier' : 'First-time check-in recorded successfully'}
                  </span>
                </div>
              </div>

              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-sm">
                VALID TICKET
              </span>
            </div>

            {/* Attendee Details Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-3.5 rounded-2xl bg-white/80 border border-emerald-200/80">
                <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700 block">Attendee Name</span>
                <span className="font-heading font-bold text-sm text-slate-900 block mt-0.5">
                  {scanResult.registration.participant_name}
                </span>
                <span className="text-slate-600 text-[11px] block mt-0.5">
                  {scanResult.registration.department}
                </span>
                <span className="text-slate-500 text-[10px] block">
                  {scanResult.registration.college} ({scanResult.registration.year_of_study})
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-emerald-200/80">
                <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700 block">Event & Venue</span>
                <span className="font-heading font-bold text-sm text-slate-900 block mt-0.5">
                  {scanResult.registration.event_title}
                </span>
                <span className="text-slate-600 text-[11px] block mt-0.5">
                  📍 {scanResult.registration.event_venue}
                </span>
                <span className="text-slate-500 text-[10px] block">
                  📅 {scanResult.registration.event_date} ({scanResult.registration.event_start_time})
                </span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-1 font-mono">
              <span>Ticket ID: <strong>{scanResult.registration.ticket_code}</strong></span>
              <span>Check-in Timestamp: {new Date().toLocaleTimeString()}</span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
