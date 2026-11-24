import { Layers3 } from 'lucide-react';

import { matchPhases } from '../analytics';

export default function PELTSegmentsCard({ segments, processedRounds }) {
  const intervals = matchPhases(segments, processedRounds);

  return (
    <section className="panel" aria-label="Match phases">
      <header className="panel-heading"><div><h2><Layers3 size={17} aria-hidden="true" /> Match phases</h2><p>Economy-based segments detected by PELT</p></div></header>
      {intervals.length ? (
        <ol className="phase-list">
          {intervals.map(({ start, end }, index) => <li key={start}><strong>Phase {index + 1}</strong><span>Rounds {start}–{end}</span></li>)}
        </ol>
      ) : <p className="empty-copy">Play at least six rounds to see match phases.</p>}
    </section>
  );
}
