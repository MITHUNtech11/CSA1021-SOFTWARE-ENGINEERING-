import React from 'react';
import { Sparkles, Clock, CheckCircle2, Crosshair } from 'lucide-react';

export default function Header({
  isConnected,
  currentTick,
  matchName = "VCT Champions Grand Finals • Map: Ascent",
  blueName = "Sentinels",
  redName = "Fnatic"
}) {
  const timeSeconds = currentTick ? currentTick.game_time_seconds : 0;
  const roundNumber = Math.min(24, Math.floor(timeSeconds / 60) + 1);
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = Math.floor(timeSeconds % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <header className="bg-white border-b border-warm-200/80 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-team-blue text-white flex items-center justify-center shadow-md shadow-blue-500/15">
            <Crosshair className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-warm-900">
                EsportEcho Predict
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-team-blue border border-blue-200">
                VALORANT Telemetry
              </span>
            </div>
            <p className="text-xs text-warm-500">
              Real-time tactical change-point detection & win probability engine
            </p>
          </div>
        </div>

        {/* Match Heading & Clock */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-center sm:text-right">
            <div className="text-xs font-medium text-warm-500">
              {matchName}
            </div>
            <div className="text-sm font-bold text-warm-800 flex items-center gap-1.5 justify-center sm:justify-end">
              <span className="text-team-blue font-extrabold">{blueName}</span>
              <span className="text-warm-400 font-normal">vs</span>
              <span className="text-team-red font-extrabold">{redName}</span>
            </div>
          </div>

          {/* Round & Clock Pill */}
          <div className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-1.5 flex items-center gap-2 shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-cyan-300">
              ROUND {roundNumber}
            </span>
            <span className="text-slate-500 text-xs">|</span>
            <span className="font-mono text-xs font-semibold text-slate-300">
              {formattedTime}
            </span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warm-50 border border-warm-200 text-xs font-medium text-warm-700">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-warm-400'}`} />
            <span>{isConnected ? 'Live Telemetry' : 'Connecting...'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
