import { Gauge } from 'lucide-react';

export default function WinProbabilityGauge({ latestPrediction, blueName, redName }) {
  const blue = latestPrediction && Math.round(latestPrediction.win_probability_blue * 100);
  const red = latestPrediction && 100 - blue;
  const momentum = latestPrediction?.momentum_score;
  const favored = blue >= 55 ? blueName : red >= 55 ? redName : null;
  const momentumLabel = momentum > 0.1 ? blueName : momentum < -0.1 ? redName : 'Balanced';

  return (
    <section className="panel outlook-panel" aria-label="Win outlook">
      <header className="panel-heading">
        <div><h2><Gauge size={17} aria-hidden="true" /> Win outlook</h2><p>Estimate from replay telemetry</p></div>
      </header>
      <div className="outlook-values">
        <div><span>{blueName}</span><strong>{latestPrediction ? `${blue}%` : '—'}</strong></div>
        <div><span>{redName}</span><strong>{latestPrediction ? `${red}%` : '—'}</strong></div>
      </div>
      <div className={`outlook-meter ${latestPrediction ? 'has-estimate' : ''}`} aria-hidden="true">
        {latestPrediction && <span style={{ width: `${blue}%` }} />}
      </div>
      <p className="outlook-note">
        {latestPrediction ? (favored ? `${favored} favored to win the match.` : 'The replay model sees a close match.') : 'Win estimates appear after the first round.'}
      </p>
      {latestPrediction && <p className="outlook-momentum"><span>Momentum</span><strong>{momentumLabel}</strong></p>}
    </section>
  );
}
