import { useState } from 'react';
import { Activity, TrendingUp } from 'lucide-react';

const roundPosition = (sequence, totalRounds) => 4 + Math.min(sequence / Math.max(totalRounds - 1, 1), 1) * 92;
const probabilityY = (value) => 94 - value * 88;
const momentumY = (value) => 50 - value * 44;
const percentage = (value) => `${Math.round(value * 100)}%`;

function TrendPlot({ label, axis, rounds, totalRounds, selected, children }) {
  const position = selected && roundPosition(selected.tick_sequence, totalRounds);
  return (
    <div className="timeline-grid trend-grid">
      <div className="timeline-axis" aria-hidden="true">{axis.map((mark) => <span key={mark}>{mark}</span>)}</div>
      <div className="timeline-plot trend-plot">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={label}>
          {selected && <line x1={position} x2={position} y1="0" y2="100" stroke="#797792" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
          {children}
        </svg>
        {!selected && <p className="chart-empty">Play or step through the replay to see a trend.</p>}
      </div>
      <div className="timeline-rounds trend-rounds" aria-hidden="true">
        {rounds.map((round) => <span key={round} style={{ left: `${roundPosition(round - 1, totalRounds)}%` }}>R{round}</span>)}
      </div>
    </div>
  );
}

export default function ReplayTrends({ predictions, totalRounds, blueName, redName }) {
  const [round, setRound] = useState(null);
  const selected = predictions.find((record) => record.tick_sequence === round);
  const shown = selected ?? predictions.at(-1);
  const rounds = [...new Set([1, Math.ceil(totalRounds / 2), totalRounds])].filter(Boolean);
  const points = (key) => predictions.map((record) => `${roundPosition(record.tick_sequence, totalRounds)},${probabilityY(record[key])}`).join(' ');
  const barWidth = Math.min(6, 68 / Math.max(totalRounds, 1));
  const currentX = shown && roundPosition(shown.tick_sequence, totalRounds);
  const momentum = shown?.momentum_score;
  const momentumSide = momentum > 0 ? blueName : momentum < 0 ? redName : 'Balanced';

  return (
    <section className="view-stack" aria-labelledby="replay-trends-title">
      <div className="trend-heading">
        <div><h2 id="replay-trends-title">Replay trends</h2><p className="subtle">Compare model estimates across the simulated match.</p></div>
        {shown && (
          <label className="compact-field">
            <span>Inspect round</span>
            <select value={selected?.tick_sequence ?? ''} onChange={(event) => setRound(event.target.value === '' ? null : Number(event.target.value))}>
              <option value="">Latest round</option>
              {predictions.map((record) => <option key={record.tick_sequence} value={record.tick_sequence}>Round {record.tick_sequence + 1}</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="analysis-grid">
        <section className="panel" aria-label="Win probability history">
          <header className="panel-heading"><div><h2><TrendingUp size={17} aria-hidden="true" /> Win probability</h2><p>Estimated chance of winning the match at each round</p></div></header>
          <TrendPlot label="Line chart of the two teams’ win probability by round" axis={['100%', '50%', '0%']} rounds={rounds} totalRounds={totalRounds} selected={shown}>
            <polyline points={points('win_probability_blue')} fill="none" stroke="var(--blue)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            <polyline points={points('win_probability_red')} fill="none" stroke="var(--red)" strokeWidth="2.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
            {shown && ['win_probability_blue', 'win_probability_red'].map((key, index) => (
              <line key={key} x1={currentX} x2={currentX} y1={probabilityY(shown[key]) - 1.5} y2={probabilityY(shown[key]) + 1.5}
                stroke={index ? 'var(--red)' : 'var(--blue)'} strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            ))}
          </TrendPlot>
          {shown && <p className="trend-reading"><span>Round {shown.tick_sequence + 1}</span><strong className="side-blue">{blueName} {percentage(shown.win_probability_blue)}</strong><strong className="side-red">{redName} {percentage(shown.win_probability_red)}</strong></p>}
        </section>
        <section className="panel" aria-label="Momentum history">
          <header className="panel-heading"><div><h2><Activity size={17} aria-hidden="true" /> Round momentum</h2><p>Bars above zero favor {blueName}. Bars below zero favor {redName}.</p></div></header>
          <TrendPlot label="Diverging bars of round momentum from minus one to plus one" axis={['+1', '0', '−1']} rounds={rounds} totalRounds={totalRounds} selected={shown}>
            {predictions.map((record) => {
              const value = record.momentum_score;
              return <rect key={record.tick_sequence} x={roundPosition(record.tick_sequence, totalRounds) - barWidth / 2}
                y={Math.min(50, momentumY(value))} width={barWidth} height={Math.max(0.8, Math.abs(50 - momentumY(value)))}
                fill={value === 0 ? 'var(--dim)' : value > 0 ? 'var(--blue)' : 'var(--red)'}
                opacity={shown?.tick_sequence === record.tick_sequence ? '1' : '.72'} />;
            })}
          </TrendPlot>
          {shown && <p className="trend-reading"><span>Round {shown.tick_sequence + 1}</span><strong>{momentumSide}</strong><span>{momentum > 0 ? '+' : ''}{momentum.toFixed(2)}</span></p>}
        </section>
      </div>
    </section>
  );
}
