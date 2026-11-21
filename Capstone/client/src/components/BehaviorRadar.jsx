import React from 'react';
import { Compass } from 'lucide-react';

export default function BehaviorRadar({ currentTick, blueName = "Sentinels", redName = "Fnatic" }) {
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
    <div className="bg-white border border-warm-200/80 rounded-2xl p-5 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-warm-100 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-warm-700 flex items-center gap-2">
          <Compass className="w-4 h-4 text-accent-amber" />
          Tactical Behavior Radar
        </h3>
        <span className="text-[11px] font-medium text-warm-500">
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
                stroke="#E2E8F0"
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
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}

          {/* Red Team Polygon */}
          <path
            d={redPath}
            fill="#EF4444"
            fillOpacity="0.20"
            stroke="#EF4444"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Blue Team Polygon */}
          <path
            d={bluePath}
            fill="#0284C7"
            fillOpacity="0.25"
            stroke="#0284C7"
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
                fill="#64748B"
                fontSize="9"
                fontFamily="sans-serif"
                fontWeight="600"
                textAnchor="middle"
              >
                {axis.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 pt-3 border-t border-warm-100 text-xs">
        <div className="flex items-center gap-1.5 text-team-blue font-semibold">
          <span className="w-2.5 h-2.5 rounded bg-team-blue inline-block"></span>
          {blueName}
        </div>
        <div className="flex items-center gap-1.5 text-team-red font-semibold">
          <span className="w-2.5 h-2.5 rounded bg-team-red inline-block"></span>
          {redName}
        </div>
      </div>
    </div>
  );
}
