import React, { useState } from 'react';
import { Activity, Sparkles } from 'lucide-react';

export default function ChangePointTimeline({ ticks = [], changePoints = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!ticks || ticks.length === 0) {
    return (
      <div className="bg-white border border-warm-200/80 rounded-2xl p-8 text-center text-warm-400 font-medium text-sm shadow-card">
        Press "Play Match Story" above to watch the timeline unfold...
      </div>
    );
  }

  // Chart Dimensions
  const width = 740;
  const height = 230;
  const padding = { top: 25, right: 30, bottom: 35, left: 65 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxTime = Math.max(24, ...ticks.map((t) => t.game_time_seconds / 60));
  const goldDiffs = ticks.map((t) => t.gold_diff);
  const maxGold = Math.max(6000, ...goldDiffs.map(Math.abs));

  const getX = (timeMins) => padding.left + (timeMins / maxTime) * chartW;
  const getY = (gold) => padding.top + chartH / 2 - (gold / maxGold) * (chartH / 2);

  const points = ticks.map((t) => ({
    x: getX(t.game_time_seconds / 60),
    y: getY(t.gold_diff),
    minute: Math.round(t.game_time_seconds / 60),
    gold_diff: t.gold_diff,
    kill_diff: t.kill_diff,
    tick: t
  }));

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const zeroY = getY(0);

  return (
    <div className="bg-white border border-warm-200/80 rounded-2xl p-5 shadow-card relative">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-warm-100 pb-3 mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-warm-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-team-blue" />
            Match Lead Progression & Detected Turning Points
          </h3>
          <p className="text-xs text-warm-500 mt-0.5">
            Shows who held the advantage over time, with statistical turning points highlighted
          </p>
        </div>

        {/* Friendly Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-team-blue">
            <span className="w-3 h-0.5 bg-team-blue inline-block rounded-full"></span>
            Gold Advantage
          </div>
          <div className="flex items-center gap-1.5 text-accent-amber">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-amber inline-block"></span>
            Key Turning Point
          </div>
        </div>
      </div>

      {/* SVG Time Series Plot */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[580px] select-none"
        >
          {/* Soft background fill for chart area */}
          <rect
            x={padding.left}
            y={padding.top}
            width={chartW}
            height={chartH}
            fill="#F8FAFC"
            rx="8"
          />

          {/* Neutral Baseline (Zero Lead) */}
          <line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            stroke="#CBD5E1"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text
            x={padding.left - 8}
            y={zeroY + 4}
            fill="#94A3B8"
            fontSize="10"
            fontFamily="sans-serif"
            fontWeight="bold"
            textAnchor="end"
          >
            Even
          </text>

          {/* Lead Labels on Y Axis */}
          <text
            x={padding.left - 8}
            y={padding.top + 10}
            fill="#1D4ED8"
            fontSize="10"
            fontFamily="sans-serif"
            fontWeight="600"
            textAnchor="end"
          >
            +T1 Lead
          </text>
          <text
            x={padding.left - 8}
            y={height - padding.bottom}
            fill="#DC2626"
            fontSize="10"
            fontFamily="sans-serif"
            fontWeight="600"
            textAnchor="end"
          >
            +WBG Lead
          </text>

          {/* Soft blue area fill under lead curve */}
          {points.length > 1 && (
            <path
              d={`${pathD} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`}
              fill="#DBEAFE"
              opacity="0.5"
            />
          )}

          {/* The Main Match Lead Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#1D4ED8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Annotated Turning-Point Vertical Badges */}
          {changePoints.map((cp, idx) => {
            const timeMins = cp.game_time_seconds / 60;
            const x = getX(timeMins);

            return (
              <g key={`cp-${idx}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="#D97706"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                />
                <circle
                  cx={x}
                  cy={padding.top + 6}
                  r="5"
                  fill="#D97706"
                />
                <rect
                  x={x - 38}
                  y={padding.top - 20}
                  width="76"
                  height="16"
                  rx="4"
                  fill="#FEF3C7"
                  stroke="#FDE68A"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top - 8}
                  fill="#92400E"
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Turning Pt {Math.round(timeMins)}m
                </text>
              </g>
            );
          })}

          {/* Data Points on Curve */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.minute === p.minute ? 6 : 3}
              fill="#1D4ED8"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Time Minute Markers on X-Axis */}
          {[0, 5, 10, 15, 20, 24].map((m) => (
            <text
              key={m}
              x={getX(m)}
              y={height - padding.bottom + 18}
              fill="#94A3B8"
              fontSize="10"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              {m} min
            </text>
          ))}
        </svg>
      </div>

      {/* Tooltip on Hover */}
      {hoveredPoint && (
        <div className="absolute top-14 right-8 bg-white border border-warm-200 rounded-xl p-3 text-xs shadow-lg font-sans">
          <div className="font-bold text-warm-900 mb-0.5">
            Minute {hoveredPoint.minute}:00
          </div>
          <div className="text-warm-600">
            Advantage: <strong className={hoveredPoint.gold_diff >= 0 ? "text-team-blue" : "text-team-red"}>
              {hoveredPoint.gold_diff >= 0 ? `T1 +${hoveredPoint.gold_diff.toLocaleString()}g` : `WBG +${Math.abs(hoveredPoint.gold_diff).toLocaleString()}g`}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}
