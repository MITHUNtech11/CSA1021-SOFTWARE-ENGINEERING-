import { useState } from 'react';
import { Activity, Play, Radio, Square, Video } from 'lucide-react';
import YouTubePlayer, { getYouTubeVideoId } from './YouTubePlayer';
import DownloadAnalytics from './DownloadAnalytics';
import { formatElapsed } from '../analytics';

const SOURCES = {
  SYNTHETIC: 'Synthetic demo',
  YOUTUBE_LIVE: 'YouTube stream',
  LOCAL_VIDEO: 'Server recording',
};

export default function LiveHUDOverlay({
  active, isConnected, isLiveBroadcasting, sourceType, videoId, analysisSeconds,
  liveHudState, liveWinProbability, liveInflectionEvents, onStartLive, onStopLive,
}) {
  const [source, setSource] = useState('SYNTHETIC');
  const [input, setInput] = useState('');
  const [previewId, setPreviewId] = useState(null);
  const [inputError, setInputError] = useState(null);
  const [pending, setPending] = useState(false);
  const isDemo = source === 'SYNTHETIC';
  const youtube = source === 'YOUTUBE_LIVE';
  const activeVideoId = isLiveBroadcasting ? videoId : null;
  const displayedVideoId = activeVideoId || ((!isLiveBroadcasting || sourceType === 'YOUTUBE_LIVE') ? previewId : null);

  function previewYouTube() {
    const id = getYouTubeVideoId(input);
    setInputError(id ? null : 'Enter a valid YouTube video URL or ID.');
    if (id) setPreviewId(id);
    return id;
  }

  async function submit(event) {
    event.preventDefault();
    if (pending || !isConnected) return;
    const id = !isLiveBroadcasting && youtube ? previewYouTube() : null;
    if (!isLiveBroadcasting && youtube && !id) return;
    setPending(true);
    try {
      if (isLiveBroadcasting) await onStopLive();
      else await onStartLive({ source: isDemo ? 'SYNTHETIC' : id || input.trim(), source_type: source, fps: 1 });
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
                setInputError(null);
                setPreviewId(null);
              }}>
                {Object.entries(SOURCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            {!isDemo && (
              <label className="field field-grow">
                <span>{youtube ? 'YouTube URL or video ID' : 'Recording filename'}</span>
                <input value={input} onChange={(event) => {
                  setInput(event.target.value);
                  setInputError(null);
                }} disabled={pending} required maxLength={2048}
                  aria-invalid={inputError ? true : undefined} aria-describedby={inputError ? 'broadcast-source-error' : undefined}
                  placeholder={youtube ? 'https://www.youtube.com/watch?v=…' : 'match.mp4'} />
              </label>
            )}
          </>
        )}
        <button type="submit" className="ui-button ui-primary" disabled={pending || !isConnected || (!isLiveBroadcasting && !isDemo && !input.trim())}>
          {isLiveBroadcasting ? <Square size={15} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {isLiveBroadcasting ? (pending ? 'Stopping…' : 'Stop analysis') : (pending ? 'Starting…' : 'Start analysis')}
        </button>
        {!isLiveBroadcasting && youtube && (
          <button type="button" className="ui-button" onClick={previewYouTube} disabled={pending || !input.trim()}>
            <Video size={16} aria-hidden="true" /> Watch only
          </button>
        )}
        {inputError && <p id="broadcast-source-error" role="alert" className="form-help inline-error">{inputError}</p>}
      </form>

      <div className={`broadcast-results ${displayedVideoId ? 'with-video' : ''}`}>
        {active && displayedVideoId && (
          <div className="broadcast-player">
            <div className="broadcast-player-heading">
              <h3>Broadcast video</h3>
              {!activeVideoId && <button type="button" className="ui-button" onClick={() => setPreviewId(null)}>Close video</button>}
            </div>
            <YouTubePlayer videoId={displayedVideoId} title="YouTube broadcast video" autoplay={previewId === displayedVideoId} />
            {activeVideoId && <p className="subtle">YouTube playback and HUD analysis can run at different delays.</p>}
          </div>
        )}
        {liveHudState ? (
          <div className="hud-results">
            <div className="panel-heading">
              <h3>{isLiveBroadcasting ? 'Latest HUD reading' : 'Last session reading'}</h3>
              <DownloadAnalytics kind="hud" data={{
                source: SOURCES[sourceType], videoId, blueName: blueSide, redName: redSide,
                seconds: analysisSeconds, hud: liveHudState, probability: liveWinProbability, events: liveInflectionEvents,
              }} />
            </div>
            {Number.isFinite(analysisSeconds) && <p className="analysis-clock">Analysis time <strong>{formatElapsed(analysisSeconds)}</strong></p>}
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
                {liveInflectionEvents.map((event, index) => (
                  <li key={`${event.timestamp}-${event.event_type}-${index}`}>
                    {Number.isFinite(event.analysis_seconds) && <span className="event-time">{formatElapsed(event.analysis_seconds)}</span>}
                    {event.description}
                  </li>
                ))}
              </ul>
            ) : <p className="subtle">No tactical events detected yet.</p>}
          </div>
        ) : (
          <div className="panel-empty">
            <Activity size={22} aria-hidden="true" />
            <p>{isLiveBroadcasting ? 'Waiting for the first HUD reading.' : 'HUD readings will appear here when analysis starts.'}</p>
          </div>
        )}
      </div>
    </section>
  );
}
