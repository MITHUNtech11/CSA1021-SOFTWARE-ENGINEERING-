import { Zap } from 'lucide-react';

const CATEGORY_LABELS = {
  DECISIVE_COMEBACK: 'Comeback',
  SNOWBALL_ACCELERATION: 'Lead accelerating',
  OBJECTIVE_STEAL_SWING: 'Objective swing',
  STALEMATE_BREAK: 'Stalemate broken',
};

export default function InflectionLog({ predictions, rounds }) {
  const events = predictions.filter((item) => item.is_inflection_point).reverse();
  return (
    <section className="panel" aria-label="Tactical shifts">
      <header className="panel-heading"><div><h2><Zap size={17} aria-hidden="true" /> Tactical shifts</h2><p>Round-by-round model explanations for major changes</p></div></header>
      {events.length ? (
        <ol className="inflection-list">
          {events.map((item) => (
            <li key={item.tick_sequence}>
              <div><strong>Round {item.tick_sequence + 1}</strong><span>{CATEGORY_LABELS[item.inflection_category] || 'Turning point'}</span></div>
              <p>{item.explanation}</p>
            </li>
          ))}
        </ol>
      ) : <p className="empty-copy">{rounds ? `No tactical shifts detected in ${rounds} played ${rounds === 1 ? 'round' : 'rounds'}.` : 'Tactical shifts will appear as you play the replay.'}</p>}
    </section>
  );
}
