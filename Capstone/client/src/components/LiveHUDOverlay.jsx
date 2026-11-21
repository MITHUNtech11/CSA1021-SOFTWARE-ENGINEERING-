import React, { useState } from 'react';
import {
  Video, Radio, Shield, Swords, Flame, AlertTriangle, Play, Square,
  CheckCircle2, Sparkles, Cpu, Clock, Zap
} from 'lucide-react';

export default function LiveHUDOverlay({
  isLiveBroadcasting = false,
  liveHudState = null,
  liveWinProbability = { round_blue: 0.50, round_red: 0.50, match_blue: 0.50, match_red: 0.50 },
  liveInflectionEvents = [],
  onStartLive = () => {},
  onStopLive = () => {}
}) {
  const [streamUrl, setStreamUrl] = useState('');
  const [mode, setMode] = useState('SYNTHETIC'); // 'SYNTHETIC' | 'YOUTUBE_LIVE' | 'LOCAL_VIDEO'

  const aliveBlue = liveHudState?.alive_blue ?? 5;
  const aliveRed = liveHudState?.alive_red ?? 5;
  const spikePlanted = liveHudState?.spike_planted ?? false;
  const isClutch = liveHudState?.is_clutch_scenario ?? false;
  const clutchSide = liveHudState?.clutch_player_side ?? null;

  const pctBlue = Math.round((liveWinProbability?.round_blue ?? 0.50) * 100);
  const pctRed = Math.round((liveWinProbability?.round_red ?? 0.50) * 100);

  const handleStart = (e) => {
    e.preventDefault();
    onStartLive({
      source: mode === 'SYNTHETIC' ? 'SYNTHETIC' : streamUrl,
      source_type: mode,
      fps: 1.0
    });
  };

  return (
    <div className="bg-white border border-warm-200/90 rounded-2xl p-5 shadow-card transition-all">
      {/* Top Header & Live Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-warm-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
            isLiveBroadcasting ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 animate-pulse' : 'bg-warm-100 text-warm-600'
          }`}>
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-warm-900">
                Live Broadcast Computer Vision (CV) & HUD Analyzer
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                isLiveBroadcasting
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-warm-100 text-warm-500 border-warm-200'
              }`}>
                {isLiveBroadcasting ? 'LIVE HUD EXTRACTOR ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-warm-500">
              Extracts living player counts, Spike arming state, and round win probability from live broadcast frames
            </p>
          </div>
        </div>

        {/* Start / Stop Toggle */}
        <div className="flex items-center gap-2">
          {isLiveBroadcasting ? (
            <button
              onClick={onStopLive}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xs transition-all active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Stop Live Analyzer
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="text-xs bg-warm-50 border border-warm-200 rounded-xl px-2.5 py-2 font-medium text-warm-700 focus:outline-none"
              >
                <option value="SYNTHETIC">Synthetic Live VCT Stream</option>
                <option value="YOUTUBE_LIVE">YouTube Live VCT Broadcast</option>
                <option value="LOCAL_VIDEO">Local .mp4 Match Recording</option>
              </select>

              {mode !== 'SYNTHETIC' && (
                <input
                  type="text"
                  placeholder={mode === 'YOUTUBE_LIVE' ? 'Paste YouTube stream URL...' : 'Local video file path...'}
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="text-xs bg-white border border-warm-200 rounded-xl px-3 py-2 w-52 font-mono text-warm-800 focus:outline-none"
                />
              )}

              <button
                onClick={handleStart}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-team-blue hover:bg-blue-700 text-white shadow-xs transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Live Analysis
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5v5 Live Roster Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-inner">
        {/* Blue Side Roster (5 slots) */}
        <div className="md:col-span-4 flex items-center justify-between sm:justify-start gap-2">
          <div className="text-xs font-bold font-mono text-cyan-400 mr-1">
            SEN ({aliveBlue}/5)
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((idx) => {
              const isAlive = idx < aliveBlue;
              return (
                <div
                  key={idx}
                  title={isAlive ? `Blue Agent ${idx + 1}: Alive` : `Blue Agent ${idx + 1}: Eliminated`}
                  className={`w-7 h-9 rounded-md flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                    isAlive
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/80 shadow-xs shadow-cyan-500/30'
                      : 'bg-slate-800/80 text-slate-600 border-slate-700/60 line-through'
                  }`}
                >
                  {isAlive ? '●' : '✕'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Objective / Spike Status */}
        <div className="md:col-span-3 text-center flex flex-col items-center justify-center py-1">
          {spikePlanted ? (
            <div className="bg-rose-500/20 border border-rose-500 text-rose-300 rounded-lg px-3 py-1 text-xs font-bold animate-pulse flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              SPIKE PLANTED (45s)
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-1 text-xs font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              ROUND ACTIVE (5v5)
            </div>
          )}

          {isClutch && (
            <div className="text-[10px] font-bold text-amber-400 mt-1 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              1v{clutchSide === 'BLUE' ? aliveRed : aliveBlue} Clutch Scenario ({clutchSide})
            </div>
          )}
        </div>

        {/* Red Side Roster (5 slots) */}
        <div className="md:col-span-4 flex items-center justify-between sm:justify-end gap-2 flex-row-reverse sm:flex-row">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((idx) => {
              const isAlive = idx < aliveRed;
              return (
                <div
                  key={idx}
                  title={isAlive ? `Red Agent ${idx + 1}: Alive` : `Red Agent ${idx + 1}: Eliminated`}
                  className={`w-7 h-9 rounded-md flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                    isAlive
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/80 shadow-xs shadow-rose-500/30'
                      : 'bg-slate-800/80 text-slate-600 border-slate-700/60 line-through'
                  }`}
                >
                  {isAlive ? '●' : '✕'}
                </div>
              );
            })}
          </div>
          <div className="text-xs font-bold font-mono text-rose-400 ml-1">
            FNC ({aliveRed}/5)
          </div>
        </div>
      </div>

      {/* Live Win Probability Bar */}
      <div className="mt-4 pt-3 border-t border-warm-100">
        <div className="flex justify-between items-center text-xs font-semibold text-warm-700 mb-1.5">
          <span className="text-team-blue flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            Sentinels: {pctBlue}% Round Probability
          </span>
          <span className="text-team-red">
            Fnatic: {pctRed}% Round Probability
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-warm-100 p-0.5 border border-warm-200 flex overflow-hidden">
          <div
            style={{ width: `${pctBlue}%` }}
            className="bg-team-blue h-full rounded-l-full transition-all duration-500"
          />
          <div
            style={{ width: `${pctRed}%` }}
            className="bg-team-red h-full rounded-r-full transition-all duration-500"
          />
        </div>
      </div>

      {/* Live CV Inflection Notifications Feed */}
      {liveInflectionEvents.length > 0 && (
        <div className="mt-3 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs space-y-1">
          <div className="font-bold text-amber-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Live Broadcast Events Detected:
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
            {liveInflectionEvents.slice(0, 3).map((ev, i) => (
              <div key={i} className="text-amber-900 font-medium leading-relaxed">
                • {ev.description}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
