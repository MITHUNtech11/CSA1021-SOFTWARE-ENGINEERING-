import React from 'react';
import { Sparkles, Trophy, Zap, AlertCircle, Crosshair } from 'lucide-react';

export default function InflectionLog({ predictions = [] }) {
  // Only display actual turning points, newest on top
  const inflections = predictions.filter((p) => p.is_inflection_point).slice().reverse();

  const getBadge = (category) => {
    switch (category) {
      case 'DECISIVE_COMEBACK':
        return { label: 'Decisive Clutch / Comeback', style: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'OBJECTIVE_STEAL_SWING':
        return { label: 'Spike Retake / Eco Swing', style: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'SNOWBALL_ACCELERATION':
        return { label: 'Economy & Lead Widening', style: 'bg-blue-50 text-team-blue border-blue-200' };
      case 'STALEMATE_BREAK':
        return { label: 'Halftime / Stalemate Broken', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Tactical Inflection Point', style: 'bg-warm-100 text-warm-700 border-warm-200' };
    }
  };

  return (
    <div className="bg-white border border-warm-200/80 rounded-2xl p-5 shadow-card flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-warm-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-amber" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-warm-700">
            Tactical Story & Turning Points Log
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-warm-100 text-warm-600">
          {inflections.length} {inflections.length === 1 ? 'Event' : 'Events'} Detected
        </span>
      </div>

      <div className="overflow-y-auto max-h-[360px] space-y-3 pr-1">
        {inflections.length === 0 ? (
          <div className="py-12 text-center text-xs font-medium text-warm-400">
            No major turning points yet. Early pistol and buy rounds progressing cleanly...
          </div>
        ) : (
          inflections.map((item, idx) => {
            const timeMins = Math.floor(item.game_time_seconds / 60);
            const timeSecs = Math.floor(item.game_time_seconds % 60);
            const timeStr = `${String(timeMins).padStart(2, '0')}:${String(timeSecs).padStart(2, '0')}`;
            const roundNumber = Math.min(24, timeMins + 1);
            const badge = getBadge(item.inflection_category);

            // Adapt explanation to Valorant terminology if it contains LoL terms
            let explanation = item.explanation || item.narrative_summary || '';
            explanation = explanation
              .replace(/T1/g, 'Sentinels')
              .replace(/WBG/g, 'Fnatic')
              .replace(/Weibo Gaming/g, 'Fnatic')
              .replace(/Baron Nashor/g, 'A-Site Spike Retake & 1v3 Clutch')
              .replace(/Baron/g, 'Spike Retake')
              .replace(/dragons/g, 'first bloods')
              .replace(/dragon/g, 'first blood')
              .replace(/turrets/g, 'sites defended')
              .replace(/turret/g, 'site defended');

            return (
              <div
                key={idx}
                className="bg-warm-50/70 hover:bg-warm-50 border border-warm-200/70 rounded-xl p-3.5 transition-all text-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-warm-800 bg-white px-2 py-0.5 rounded-md border border-warm-200/80 shadow-xs">
                      Round {roundNumber} ({timeStr})
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.style}`}>
                      {badge.label}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-team-blue font-mono">
                    SEN Win Odds: {Math.round(item.win_probability_blue * 100)}%
                  </span>
                </div>

                <p className="text-warm-700 text-xs leading-relaxed font-medium">
                  {explanation}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
