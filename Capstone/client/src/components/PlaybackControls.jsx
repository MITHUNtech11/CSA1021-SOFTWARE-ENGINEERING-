import { useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

const SPEEDS = [1, 2, 5, 10];

export default function PlaybackControls({ status, isConnected, preferredSpeed, onSpeedChange, onPlay, onPause, onStep, onReset, onSeek }) {
  const { is_playing: playing, playback_speed: activeSpeed, current_index: played, total_ticks: total } = status;
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const finished = total > 0 && played >= total;
  const speed = playing ? activeSpeed : preferredSpeed ?? activeSpeed;
  const disabled = pending || !isConnected || total === 0;

  async function run(action) {
    if (inFlight.current || disabled) return;
    inFlight.current = true;
    setPending(true);
    try {
      await action();
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  function togglePlayback() {
    run(async () => {
      if (playing) {
        await onPause();
        return;
      }
      if (!finished || await onReset()) await onPlay(speed);
    });
  }

  return (
    <section className="panel playback-panel" aria-labelledby="replay-heading" aria-busy={pending}>
      <div className="playback-info">
        <div>
          <h2 id="replay-heading">Replay controls</h2>
          <span className="subtle">{played} of {total} rounds played</span>
        </div>
        <progress aria-label="Replay progress" max={total || 1} value={played} />
      </div>
      <div className="playback-actions">
        <button type="button" className="ui-button ui-primary" onClick={togglePlayback} disabled={disabled}>
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {playing ? 'Pause' : finished ? 'Replay' : 'Play replay'}
        </button>
        <button type="button" className="ui-button" onClick={() => run(onStep)} disabled={disabled || playing || finished}>
          <SkipForward size={16} aria-hidden="true" /> Step
        </button>
        <button type="button" className="ui-button" onClick={() => run(onReset)} disabled={disabled || (!playing && played === 0)}>
          <RotateCcw size={15} aria-hidden="true" /> Reset
        </button>
        <label className="compact-field">
          <span>Speed</span>
          <select value={speed} disabled={disabled} onChange={(event) => {
            const nextSpeed = Number(event.target.value);
            onSpeedChange(nextSpeed);
            if (playing) run(() => onPlay(nextSpeed));
          }}>
            {!SPEEDS.includes(speed) && <option value={speed}>{speed}?</option>}
            {SPEEDS.map((value) => <option key={value} value={value}>{value}Ã—</option>)}
          </select>
        </label>
        <label className="compact-field">
          <span>Jump to</span>
          <select value={played} disabled={disabled} onChange={(event) => {
            const round = Number(event.target.value);
            run(round === 0 ? onReset : () => onSeek(round - 1));
          }}>
            <option value={0}>Start</option>
            {Array.from({ length: total }, (_, index) => <option key={index} value={index + 1}>Round {index + 1}</option>)}
          </select>
        </label>
      </div>
    </section>
  );
}
