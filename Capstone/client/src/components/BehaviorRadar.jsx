import React from 'react';
import { Compass } from 'lucide-react';

export default function BehaviorRadar({ currentTick, blueName = "T1", redName = "WBG" }) {
  const blue = currentTick?.blue_team;
  const red = currentTick?.red_team;

  // Radar Axes Metrics normalized to [0.1, 1.0]
  const axes = [
    { label: "Aggression", blueVal: Math.min(1.0, 0.2 + (blue?.total_kills || 0) * 0.04), redVal: Math.min(1.0, 0.2 + (red?.total_kills || 0) * 0.04) },
    { label: "Economy", blueVal: Math.min(1.0, (blue?.total_gold || 2500) / 55000), redVal: Math.min(1.0, (red?.total_gold || 2500) / 55000) },
    { label: "Objectives", blueVal: Math.min(1.0, 0.1 + ((blue?.turrets_destroyed || 0)*0.07) + ((blue?.dragons || 0)*0.1) + ((blue?.barons || 0)*0.25)), redVal: Math.min(1.0, 0.1 + ((red?.turrets_destroyed || 0)*0.07) + ((red?.dragons || 0)*0.1) + ((red?.barons || 0)*0.25)) },
    { label: "Vision", blueVal: Math.min(1.0, (blue?.vision_score || 5) / 100), redVal: Math.min(1.0, (red?.vision_score || 5) / 100) },
    { label: "Structure Pressure", blueVal: Math.min(1.0, 0.15 + (blue?.turrets_destroyed || 0) * 0.08), redVal: Math.min(1.0, 0.15 + (red?.turrets_destroyed || 0) * 0.08) },
  ];

  const size = 260;
  const center = size / 2;
  const radius = 85;
  const numAxes = axes.length;

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const x = center + radius * value * Math.cos(angle);
    const y = center + radius * value * Math.sin(angle);
    return { x, y };
  };

  // Generate Polygon Path Strings
  const bluePoints = axes.map((a, i) => getCoordinates(i, a.blueVal));
  const redPoints = axes.map((a, i) => getCoordinates(i, a.redVal));

  const bluePath = bluePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const redPath = redPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
          <Compass className="w-4 h-4 text-purple-400" />
          Tactical Behavior Radar
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          Normalized Profiles
        </span>
      </div>

      <div className="relative flex items-center justify-center my-2">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Concentric rings */}
          {[0.25, 0.5, 0.75, 1.0].map((level) => {
            const ringPoints = Array.from({ length: numAxes }).map((_, i) => getCoordinates(i, level));
            const ringPath = ringPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
            return (
              <path
                key={level}
                d={ringPath}
                fill="none"
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray={level === 1.0 ? "none" : "2 2"}
              />
            );
          })}

          {/* Radial axis spokes */}
          {axes.map((_, i) => {
            const end = getCoordinates(i, 1.0);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={end.x}
                y2={end.y}
                stroke="#1E293B"
                strokeWidth="1"
              />
            );
          })}

          {/* Red Team Polygon */}
          <path
            d={redPath}
            fill="#F43F5E"
            fillOpacity="0.25"
            stroke="#F43F5E"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Blue Team Polygon */}
          <path
            d={bluePath}
            fill="#06B6D4"
            fillOpacity="0.35"
            stroke="#06B6D4"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Axis Labels */}
          {axes.map((axis, i) => {
            const labelCoord = getCoordinates(i, 1.25);
            return (
              <text
                key={i}
                x={labelCoord.x}
                y={labelCoord.y + 3}
                fill="#94A3B8"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {axis.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 pt-3 border-t border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block"></span>
          {blueName} Profile
        </div>
        <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded bg-rose-400 inline-block"></span>
          {redName} Profile
        </div>
      </div>
    </div>
  );
}
