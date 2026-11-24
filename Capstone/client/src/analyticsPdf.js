import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { formatElapsed, matchPhases, teamBehavior, teamMetrics } from './analytics';

const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const percent = (value) => Number.isFinite(value) ? `${Math.round(value * 100)}%` : 'Unavailable';

function report(title, subtitle) {
  const doc = new jsPDF({ compress: true });
  doc.setProperties({ title, author: 'EsportEcho Predict' });
  doc.setTextColor('#49377b').setFontSize(10).text('ESPORTECHO  /  VALORANT', 14, 17);
  doc.setTextColor('#202032').setFont('helvetica', 'bold').setFontSize(21).text(title, 14, 29);
  doc.setFont('helvetica', 'normal').setFontSize(11).text(subtitle, 14, 38);
  return doc;
}

function section(doc, title, columns, rows, emptyMessage) {
  autoTable(doc, {
    startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 45,
    margin: { top: 15, bottom: 17, left: 14, right: 14 },
    head: [
      [{ content: title, colSpan: columns.length, styles: { fillColor: '#3c315c', textColor: '#ffffff', fontSize: 11 } }],
      columns,
    ],
    body: rows.length ? rows : [[{ content: emptyMessage, colSpan: columns.length }]],
    styles: { fontSize: 9, cellPadding: 2, textColor: '#232333' },
    headStyles: { fillColor: '#e8e5f0', textColor: '#252134' },
    rowPageBreak: 'avoid',
  });
}

function download(doc, name) {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFontSize(9).setTextColor('#636073').text('EsportEcho Predict', 14, 287);
    doc.text(`${page} / ${pages}`, 196, 287, { align: 'right' });
  }
  doc.save(`esportecho-${name.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()}.pdf`);
}

export function downloadReplayPdf({ ticks, predictions, changePoints, peltSegments, totalRounds, blueName, redName }) {
  const latest = ticks.at(-1);
  const round = latest.sequence_id + 1;
  const doc = report('Match analytics', `${blueName} vs ${redName}  |  Simulated replay  |  ${round} of ${totalRounds} rounds`);
  const teams = ['Metric', blueName, redName];
  section(doc, `Team comparison through round ${round}`, teams,
    teamMetrics.map(([label, key]) => [label, number.format(latest.blue_team[key]), number.format(latest.red_team[key])]));

  const blueBehavior = teamBehavior(latest.blue_team);
  const redBehavior = teamBehavior(latest.red_team);
  section(doc, 'Team behavior (normalized, 0 to 1)', teams,
    Object.entries(blueBehavior).map(([label, value]) => [label, value.toFixed(2), redBehavior[label].toFixed(2)]));

  const byRound = new Map(predictions.map((prediction) => [prediction.tick_sequence, prediction]));
  section(doc, 'Round history', ['Round', 'Game time', 'Credits (blue - red)', `${blueName} win`, `${redName} win`, 'Momentum'],
    ticks.map((tick) => {
      const prediction = byRound.get(tick.sequence_id);
      return [tick.sequence_id + 1, formatElapsed(tick.game_time_seconds), number.format(tick.gold_diff),
        percent(prediction?.win_probability_blue), percent(prediction?.win_probability_red),
        prediction?.momentum_score?.toFixed(2) ?? 'Unavailable'];
    }));
  section(doc, 'Turning points', ['Round', 'Detector', 'Change', 'Score', 'Confidence'],
    changePoints.map((point) => [point.tick_sequence + 1, point.algorithm, point.change_type.replaceAll('_', ' '),
      number.format(point.score), percent(point.confidence)]), 'No turning points detected.');
  section(doc, 'Match phases (PELT)', ['Phase', 'First round', 'Last round'],
    matchPhases(peltSegments, round).map(({ start, end }, i) => [i + 1, start, end]),
    'Match phases are available after six rounds.');
  section(doc, 'Tactical shifts', ['Round', 'Impact', 'Explanation'],
    predictions.filter((p) => p.is_inflection_point).map((p) => [p.tick_sequence + 1, p.turning_point_impact_score, p.explanation]),
    'No tactical shifts detected.');
  download(doc, `${latest.match_id}-round-${round}`);
}

export function downloadHudPdf({ source, videoId, blueName, redName, seconds, hud, probability, events }) {
  const doc = report('Broadcast HUD analytics', `${source}  |  Analysis time ${formatElapsed(seconds)}${videoId ? `  |  Video ${videoId}` : ''}`);
  section(doc, 'Latest HUD reading', ['Metric', blueName, redName], [
    ['Players alive', hud.alive_blue, hud.alive_red],
    ['Round win estimate', percent(probability?.round_blue), percent(probability?.round_red)],
    ['Match win estimate', percent(probability?.match_blue), percent(probability?.match_red)],
  ]);
  section(doc, 'Tactical state', ['Metric', 'Reading'], [
    ['Spike', hud.spike_planted ? 'Planted' : 'Clear'],
    ['Clutch', hud.is_clutch_scenario ? hud.clutch_player_side : 'None'],
    ['Detection confidence', percent(hud.confidence)],
  ]);
  section(doc, 'Recent broadcast events (latest first)', ['Analysis time', 'Event'],
    events.map((event) => [formatElapsed(event.analysis_seconds), event.description]), 'No tactical events detected.');
  download(doc, `hud-${videoId || source}-${Math.floor(seconds ?? 0)}s`);
}
