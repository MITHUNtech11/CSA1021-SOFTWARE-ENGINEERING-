export const teamMetrics = [
  ['Credits', 'total_gold'],
  ['Eliminations', 'total_kills'],
  ['Sites won', 'turrets_destroyed'],
  ['Opening picks', 'dragons'],
  ['Clutches', 'barons'],
];

export function teamBehavior(team) {
  const sites = team?.turrets_destroyed ?? 0;
  return {
    Aggression: Math.min(1, 0.2 + (team?.total_kills ?? 0) * 0.04),
    Economy: Math.min(1, (team?.total_gold ?? 0) / 55000),
    Objectives: Math.min(1, 0.1 + sites * 0.07 + (team?.dragons ?? 0) * 0.1 + (team?.barons ?? 0) * 0.25),
    Vision: Math.min(1, (team?.vision_score ?? 0) / 100),
    'Structure Pressure': Math.min(1, 0.15 + sites * 0.08),
  };
}

export function matchPhases(segments, processedRounds) {
  if (processedRounds < 6) return [];
  const boundaries = [0, ...segments.filter((point) => point > 0 && point < processedRounds), processedRounds];
  return boundaries.slice(1).map((end, index) => ({ start: boundaries[index] + 1, end }));
}

export function formatElapsed(seconds) {
  if (!Number.isFinite(seconds)) return 'Unavailable';
  const rounded = Math.floor(seconds);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')}`;
}
