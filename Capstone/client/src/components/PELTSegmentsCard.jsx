import { Layers3 } from 'lucide-react';

export default function PELTSegmentsCard({ segments, processedRounds }) {
  const boundaries = [0, ...segments.filter((point) => point > 0 && point < processedRounds), processedRounds];
  const intervals = processedRounds < 6 ? [] : boundaries.slice(1).map((end, index) => ({ start: boundaries[index], end }));

  return (
    <section className="panel" aria-label="Match phases">
      <header className="panel-heading"><div><h2><Layers3 size={17} aria-hidden="true" /> Match phases</h2><p>Economy-based segments detected by PELT</p></div></header>
      {intervals.length ? (
        <ol className="phase-list">
          {intervals.map(({ start, end }, index) => <li key={start}><strong>Phase {index + 1}</strong><span>Rounds {start + 1}–{end}</span></li>)}
        </ol>
      ) : <p className="empty-copy">Play at least six rounds to see match phases.</p>}
    </section>
  );
}
