import { useId, useState } from 'react';
import { Activity } from 'lucide-react';

const number = new Intl.NumberFormat();

export default function ChangePointTimeline({ ticks, changePoints, totalRounds, blueName, redName }) {
  const gradientId = useId();
  const [inspectedRound, setInspectedRound] = useState(null);
  const latest = ticks.at(-1);
  const selected = ticks.find((tick) => tick.sequence_id === inspectedRound);
  const inspected = selected ?? latest;
  const roundSpan = Math.max(totalRounds - 1, 1);
  const limit = Math.ceil(Math.max(4000, ...ticks.map((tick) => Math.abs(tick.gold_diff))) / 2000) * 2000;
  const x = (sequence) => 4 + Math.min(sequence / roundSpan, 1) * 92;
  const y = (credits) => 50 - credits / limit * 46;
  const line = ticks.map((tick, index) => `${index ? 'L' : 'M'}${x(tick.sequence_id)} ${y(tick.gold_diff)}`).join(' ');
  const area = latest && `${line} L${x(latest.sequence_id)} 50 L${x(ticks[0].sequence_id)} 50 Z`;
  const changeByRound = new Map(changePoints.map((point) => [point.tick_sequence, point]));
  const inspectedChange = inspected && changeByRound.get(inspected.sequence_id);
  const axisRounds = [...new Set([1, Math.ceil(totalRounds * 0.25), Math.ceil(totalRounds * 0.5), Math.ceil(totalRounds * 0.75), totalRounds])].filter(Boolean);

  return (
    <section className="panel timeline-panel" aria-label="Economy timeline">
      <header className="panel-heading">
        <div>
          <h2><Activity size={17} aria-hidden="true" /> Economy timeline</h2>
          <p>Credit difference by round</p>
        </div>
        <span className="chart-legend"><i /> Turning point</span>
      </header>

      <div className="timeline-grid">
        <div className="timeline-axis" aria-hidden="true">
          <span>+{limit / 1000}k</span><span>0</span><span>−{limit / 1000}k</span>
        </div>
        <div className="timeline-plot">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity=".42" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity=".04" />
              </linearGradient>
            </defs>
            {area && <path d={area} fill={`url(#${gradientId})`} />}
            {line && <path d={line} fill="none" stroke="#b6a0ff" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
          </svg>

          {changePoints.map((point) => {
            const tick = ticks.find((item) => item.sequence_id === point.tick_sequence);
            return tick && (
              <button key={point.tick_sequence} type="button" className="chart-marker"
                style={{ left: `${x(tick.sequence_id)}%`, top: `${y(tick.gold_diff)}%` }}
                aria-label={`Inspect round ${point.tick_sequence + 1}, ${point.algorithm} turning point`}
                aria-pressed={inspected?.sequence_id === point.tick_sequence}
                onClick={() => setInspectedRound(point.tick_sequence)} />
            );
          })}
          {inspected && !inspectedChange && (
            <span className="chart-dot" aria-hidden="true" style={{ left: `${x(inspected.sequence_id)}%`, top: `${y(inspected.gold_diff)}%` }} />
          )}
          {!latest && <p className="chart-empty">Start or step through the replay to see the lead change.</p>}
        </div>
        <div className="timeline-rounds" aria-hidden="true">{axisRounds.map((round) => <span key={round}>R{round}</span>)}</div>
      </div>

      {inspected && (
        <div className="chart-reading">
          <label className="compact-field">
            <span>Inspect</span>
            <select value={selected?.sequence_id ?? ''} onChange={(event) => {
              setInspectedRound(event.target.value === '' ? null : Number(event.target.value));
            }}>
              <option value="">Latest round</option>
              {ticks.map((tick) => <option value={tick.sequence_id} key={tick.sequence_id}>Round {tick.sequence_id + 1}</option>)}
            </select>
          </label>
          <p>
            <strong>Round {inspected.sequence_id + 1}</strong>
            {' · '}{inspected.gold_diff === 0 ? 'Even economy' : `${number.format(Math.abs(inspected.gold_diff))} credits to ${inspected.gold_diff > 0 ? blueName : redName}`}
            {inspectedChange && ` · ${inspectedChange.algorithm} turning point`}
          </p>
        </div>
      )}
    </section>
  );
}
