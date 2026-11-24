import React from 'react';
import { Compass } from 'lucide-react';
import { teamBehavior } from '../analytics';

export default function BehaviorRadar({ currentTick, blueName = "Sentinels", redName = "Fnatic" }) {
  const blue = teamBehavior(currentTick?.blue_team);
  const red = teamBehavior(currentTick?.red_team);
  const axes = Object.entries(blue).map(([label, blueVal]) => ({ label, blueVal, redVal: red[label] }));

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
    <section className="panel behavior-panel" aria-label="Team behavior">
      <header className="panel-heading">
        <div><h2><Compass size={17} aria-hidden="true" /> Team behavior</h2><p>Normalized replay metrics</p></div>
      </header>
      {!currentTick ? <p className="empty-copy">Play a round to compare the teams.</p> : <>
      <div className="behavior-chart">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Radar comparing ${blueName} and ${redName} by aggression, economy, objectives, vision, and structure pressure`}>
          {/* Concentric rings */}
          {[0.25, 0.5, 0.75, 1.0].map((level) => {
            const ringPoints = Array.from({ length: numAxes }).map((_, i) => getCoordinates(i, level));
            const ringPath = ringPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
            return (
              <path
                key={level}
                d={ringPath}
                fill="none"
                stroke="#38394c"
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
                stroke="#38394c"
                strokeWidth="1"
              />
            );
          })}

          {/* Red Team Polygon */}
          <path
            d={redPath}
            fill="#f996ab"
            fillOpacity="0.20"
            stroke="#f996ab"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Blue Team Polygon */}
          <path
            d={bluePath}
            fill="#71bbff"
            fillOpacity="0.25"
            stroke="#71bbff"
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
                fill="#c5c3d2"
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

      <div className="behavior-legend">
        <span className="side-blue">{blueName}</span>
        <span className="side-red">{redName}</span>
      </div>
      </>}
    </section>
  );
}
