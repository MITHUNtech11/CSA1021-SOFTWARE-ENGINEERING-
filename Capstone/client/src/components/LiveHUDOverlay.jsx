import { useState } from 'react';
import { Activity, Play, Radio, Square } from 'lucide-react';

const SOURCES = {
  SYNTHETIC: 'Synthetic demo',
  YOUTUBE_LIVE: 'YouTube stream',
  LOCAL_VIDEO: 'Server recording',
};

export default function LiveHUDOverlay({
  isConnected, isLiveBroadcasting, sourceType, liveHudState, liveWinProbability,
  liveInflectionEvents, onStartLive, onStopLive,
}) {
  const [source, setSource] = useState('SYNTHETIC');
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const isDemo = source === 'SYNTHETIC';

  async function submit(event) {
    event.preventDefault();
    if (pending || !isConnected) return;
    setPending(true);
    try {
      if (isLiveBroadcasting) await onStopLive();
      else await onStartLive({ source: isDemo ? 'SYNTHETIC' : input.trim(), source_type: source, fps: 1 });
    } finally {
      setPending(false);
    }
  }

  const blueSide = sourceType === 'SYNTHETIC' ? 'Sentinels' : 'Blue side';
  const redSide = sourceType === 'SYNTHETIC' ? 'Fnatic' : 'Red side';

  return (
    <section className="panel" aria-label="HUD analysis" aria-busy={pending}>
      <header className="panel-heading">
        <div><h2><Radio size={17} aria-hidden="true" /> HUD analysis</h2><p>Read player counts and spike state from compatible broadcasts.</p></div>
        <span className={`source-status ${isLiveBroadcasting ? 'source-running' : ''}`}>
          {isLiveBroadcasting ? SOURCES[sourceType] : 'Standby'}
        </span>
      </header>

      <form className="source-form" onSubmit={submit}>
        {!isLiveBroadcasting && (
          <>
            <label className="field">
              <span>Source</span>
              <select value={source} disabled={pending} onChange={(event) => {
                setSource(event.target.value);
                setInput('');
              }}>
                {Object.entries(SOURCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            {!isDemo && (
              <label className="field field-grow">
                <span>{source === 'YOUTUBE_LIVE' ? 'YouTube URL or video ID' : 'Recording filename'}</span>
                <input value={input} onChange={(event) => setInput(event.target.value)} disabled={pending} required maxLength={2048}
                  placeholder={source === 'YOUTUBE_LIVE' ? 'https://www.youtube.com/watch?v=…' : 'match.mp4'} />
              </label>
            )}
          </>
        )}
        <button type="submit" className="ui-button ui-primary" disabled={pending || !isConnected || (!isLiveBroadcasting && !isDemo && !input.trim())}>
          {isLiveBroadcasting ? <Square size={15} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {isLiveBroadcasting ? (pending ? 'Stopping…' : 'Stop analysis') : (pending ? 'Starting…' : 'Start analysis')}
        </button>
      </form>

      {liveHudState ? (
        <div className="hud-results">
          <div className="hud-metrics">
            <div><span className="side-blue">{blueSide} alive</span><strong>{liveHudState.alive_blue}<small>/5</small></strong></div>
            <div><span className="side-red">{redSide} alive</span><strong>{liveHudState.alive_red}<small>/5</small></strong></div>
            <div><span>Spike</span><strong>{liveHudState.spike_planted ? 'Planted' : 'Clear'}</strong></div>
            <div><span>Clutch</span><strong>{liveHudState.is_clutch_scenario ? (liveHudState.clutch_player_side === 'BLUE' ? blueSide : redSide) : 'None'}</strong></div>
          </div>
          {liveWinProbability && (
            <div className="hud-estimates">
              <span>Round estimate</span><strong className="side-blue">{blueSide} {Math.round(liveWinProbability.round_blue * 100)}%</strong>
              <strong className="side-red">{redSide} {Math.round(liveWinProbability.round_red * 100)}%</strong>
            </div>
          )}
          <h3>Broadcast events</h3>
          {liveInflectionEvents.length ? (
            <ul className="event-list">
              {liveInflectionEvents.map((event, index) => <li key={`${event.timestamp}-${event.type}-${index}`}>{event.description}</li>)}
            </ul>
          ) : <p className="subtle">No tactical events detected yet.</p>}
        </div>
      ) : (
        <div className="panel-empty">
          <Activity size={22} aria-hidden="true" />
          <p>{isLiveBroadcasting ? 'Waiting for the first HUD reading.' : 'HUD readings will appear here when analysis starts.'}</p>
        </div>
      )}
    </section>
  );
}
