import { Columns3 } from 'lucide-react';

import { teamMetrics } from '../analytics';

const format = new Intl.NumberFormat();

export default function TeamComparisonCards({ currentTick, blueName, redName }) {
  return (
    <section className="panel" aria-label="Team comparison">
      <header className="panel-heading">
        <div><h2><Columns3 size={17} aria-hidden="true" /> Team comparison</h2><p>{currentTick ? `Totals through round ${currentTick.sequence_id + 1}` : 'Waiting for the first replay round'}</p></div>
      </header>
      <table className="comparison-table">
        <thead><tr><th scope="col">Metric</th><th scope="col" className="side-blue">{blueName}</th><th scope="col" className="side-red">{redName}</th></tr></thead>
        <tbody>
          {teamMetrics.map(([label, key]) => (
            <tr key={key}>
              <th scope="row">{label}</th>
              <td>{currentTick ? format.format(currentTick.blue_team[key]) : '—'}</td>
              <td>{currentTick ? format.format(currentTick.red_team[key]) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
