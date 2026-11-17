import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';

export default function PELTSegmentsCard({ segments = [], totalMinutes = 24 }) {
  // Construct macro phase intervals from segment boundaries
  const sortedBounds = [0, ...segments, totalMinutes].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
  
  const intervals = [];
  for (let i = 0; i < sortedBounds.length - 1; i++) {
    const start = sortedBounds[i];
    const end = sortedBounds[i + 1];
    if (end > start) {
      let label = "Early Laning & Farm Phase";
      if (start >= 18) label = "Late-Game Baron & Base Siege";
      else if (start >= 11) label = "Mid-Game Objective Contest";
      
      intervals.push({ start, end, label });
    }
  }

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <h3 className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          PELT Macro-Phase Segmentation
        </h3>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
          Linear O(n) Pruned
        </span>
      </div>

      <div className="space-y-2.5">
        {intervals.map((intv, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <div>
                <div className="text-slate-200 font-semibold">{intv.label}</div>
                <div className="text-[10px] text-slate-500">Regime Phase {idx + 1}</div>
              </div>
            </div>

            <span className="font-bold text-cyan-400 bg-slate-800 px-2 py-1 rounded">
              {intv.start}:00 – {intv.end}:00
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
