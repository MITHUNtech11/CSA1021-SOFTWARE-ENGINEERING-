import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Activity, ArrowRight, ChartNoAxesCombined, Radio, X } from 'lucide-react';
import Header from './components/Header';
import PlaybackControls from './components/PlaybackControls';
import WinProbabilityGauge from './components/WinProbabilityGauge';
import ChangePointTimeline from './components/ChangePointTimeline';
import TeamComparisonCards from './components/TeamComparisonCards';
import InflectionLog from './components/InflectionLog';
import { useEsportWebSocket } from './hooks/useEsportWebSocket';

const LiveHUDOverlay = lazy(() => import('./components/LiveHUDOverlay'));
const MatchVideoPlayer = lazy(() => import('./components/MatchVideoPlayer'));
const BehaviorRadar = lazy(() => import('./components/BehaviorRadar'));
const PELTSegmentsCard = lazy(() => import('./components/PELTSegmentsCard'));
const ReplayTrends = lazy(() => import('./components/ReplayTrends'));

const VIEW_TITLES = {
  overview: 'Match overview',
  broadcast: 'Broadcast',
  analysis: 'Match analysis',
};

function currentView() {
  const hash = window.location.hash.slice(1);
  return Object.hasOwn(VIEW_TITLES, hash) ? hash : 'overview';
}

export default function App() {
  const {
    isConnected, ticks, predictions, changePoints, peltSegments, activeVideo,
    liveSourceType, liveVideoId, liveAnalysisSeconds, error, simulatorStatus, isLiveBroadcasting, liveHudState,
    liveWinProbability, liveInflectionEvents, dismissError, step, play, pause,
    reset, startLiveAnalysis, stopLiveAnalysis, analyzeYouTubeVideo, seekToRound,
  } = useEsportWebSocket();

  const [view, setView] = useState(currentView);
  const [broadcastVisited, setBroadcastVisited] = useState(() => currentView() === 'broadcast');
  const [preferredSpeed, setPreferredSpeed] = useState(null);
  const heading = useRef(null);

  useEffect(() => {
    function navigate() {
      const nextView = currentView();
      setView(nextView);
      if (nextView === 'broadcast') setBroadcastVisited(true);
      window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);

  useEffect(() => {
    document.title = `${VIEW_TITLES[view]} | EsportEcho Predict`;
    if (window.location.hash) heading.current?.focus({ preventScroll: true });
  }, [view]);

  const currentTick = ticks.at(-1);
  const latestPrediction = predictions.at(-1);
  const totalRounds = simulatorStatus.total_ticks;
  const processedRounds = simulatorStatus.current_index;
  const blueName = currentTick?.blue_team?.team_name || 'Sentinels';
  const redName = currentTick?.red_team?.team_name || 'Fnatic';
  const fullBlueName = blueName === 'SEN' ? 'Sentinels' : blueName;
  const fullRedName = redName === 'FNC' ? 'Fnatic' : redName;

  return (
    <div className="workspace">
      <a href="#main-content" className="skip-link" onClick={(event) => {
        event.preventDefault();
        heading.current?.focus();
      }}>Skip to main content</a>
      <Header view={view} isConnected={isConnected} isLiveBroadcasting={isLiveBroadcasting} />
      <main id="main-content" className="workspace-main">
        <div className="workspace-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow"><span /> VALORANT <span className="eyebrow-divider">/</span> ASCENT</p>
              <h1 ref={heading} tabIndex={-1}>{VIEW_TITLES[view]}</h1>
            </div>
            {view === 'overview' && <a className="ui-button page-action broadcast-action" href="#broadcast"><Radio size={16} aria-hidden="true" /> Broadcast <ArrowRight size={15} aria-hidden="true" /></a>}
            {view === 'analysis' && <a className="ui-button page-action" href="#overview"><Activity size={16} aria-hidden="true" /> Replay controls</a>}
          </div>

          {!isConnected && <p className="connection-notice">Waiting for the gateway. Playback and analysis controls will be available once connected.</p>}
          {error && (
            <div className="error-banner">
              <p role="alert">{error}</p>
              <button type="button" className="icon-button" aria-label="Dismiss error" onClick={dismissError}><X size={17} aria-hidden="true" /></button>
            </div>
          )}

          {view === 'overview' && (
            <div className="view-stack">
              <section className="match-hero" aria-labelledby="match-title">
                <div className="hero-content">
                  <p className="hero-label"><span /> SIMULATED MATCH</p>
                  <h2 id="match-title">{fullBlueName} <span>vs</span> {fullRedName}</h2>
                  <p className="hero-detail">VCT-inspired replay <span aria-hidden="true">·</span> Ascent <span aria-hidden="true">·</span> {totalRounds} rounds</p>
                </div>
              </section>

              <PlaybackControls status={simulatorStatus} isConnected={isConnected} preferredSpeed={preferredSpeed} onSpeedChange={setPreferredSpeed} onPlay={play} onPause={pause} onStep={step} onReset={reset} onSeek={seekToRound} />

              <div className="overview-grid">
                <ChangePointTimeline ticks={ticks} changePoints={changePoints} totalRounds={totalRounds} blueName={fullBlueName} redName={fullRedName} />
                <WinProbabilityGauge latestPrediction={latestPrediction} blueName={fullBlueName} redName={fullRedName} />
              </div>
              <TeamComparisonCards currentTick={currentTick} blueName={fullBlueName} redName={fullRedName} />
              <a href="#analysis" className="analysis-link">
                <ChartNoAxesCombined size={20} aria-hidden="true" />
                <span><strong>Explore match analysis</strong><small>Turning points, team behavior and match phases</small></span>
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          )}

          {broadcastVisited && (
            <section hidden={view !== 'broadcast'} aria-label="Broadcast workspace">
              <Suspense fallback={<p role="status" className="panel">Loading broadcast tools…</p>}>
                <div className="view-stack">
                  <LiveHUDOverlay active={view === 'broadcast'} isConnected={isConnected} isLiveBroadcasting={isLiveBroadcasting} sourceType={liveSourceType}
                    videoId={liveVideoId} analysisSeconds={liveAnalysisSeconds}
                    liveHudState={liveHudState} liveWinProbability={liveWinProbability} liveInflectionEvents={liveInflectionEvents}
                    onStartLive={startLiveAnalysis} onStopLive={stopLiveAnalysis} />
                  <MatchVideoPlayer active={view === 'broadcast'} isConnected={isConnected} activeVideo={activeVideo} onAnalyzeYouTube={analyzeYouTubeVideo} />
                </div>
              </Suspense>
            </section>
          )}

          {view === 'analysis' && (
            <Suspense fallback={<p role="status" className="panel">Loading match analysis…</p>}>
              <div className="view-stack">
                <ChangePointTimeline ticks={ticks} changePoints={changePoints} totalRounds={totalRounds} blueName={fullBlueName} redName={fullRedName} />
                <ReplayTrends predictions={predictions} totalRounds={totalRounds} blueName={fullBlueName} redName={fullRedName} />
                <div className="analysis-grid">
                  <BehaviorRadar currentTick={currentTick} blueName={fullBlueName} redName={fullRedName} />
                  <PELTSegmentsCard segments={peltSegments} processedRounds={processedRounds} />
                </div>
                <InflectionLog predictions={predictions} rounds={processedRounds} />
              </div>
            </Suspense>
          )}

          <footer className="workspace-footer"><span>EsportEcho Predict</span><span>CSA1021 Software Engineering Capstone</span></footer>
        </div>
      </main>
    </div>
  );
}
