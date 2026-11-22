import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';

export default function PELTSegmentsCard({ segments = [], processedRounds = 0 }) {
  const boundaries = [0, ...segments.filter((point) => point > 0 && point < processedRounds), processedRounds];
  const intervals = processedRounds < 6 ? [] : boundaries.slice(1).map((end, index) => ({
    start: boundaries[index],
    end,
  }));

  return (
    <div className="bg-white border border-warm-200/80 rounded-2xl p-5 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-warm-100 pb-3 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-warm-700 flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-amber" />
          PELT Macro-Phase Segmentation
        </h3>
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Pruned Exact Linear Time
        </span>
      </div>

      <div className="space-y-2.5">
        {intervals.length === 0 && <p className="text-xs text-warm-500">Segmentation starts after six replay rounds.</p>}
        {intervals.map((intv, idx) => (
          <div
            key={intv.start}
            className="flex items-center justify-between p-2.5 rounded-xl bg-warm-50/70 border border-warm-200/70 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <div className="text-warm-800 font-semibold">Segment {idx + 1}</div>
              </div>
            </div>

            <span className="font-mono font-bold text-warm-700 bg-white border border-warm-200/80 shadow-xs px-2 py-1 rounded-md text-[11px]">
              Round {intv.start + 1} – {intv.end}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
