import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import PlaybackControls from './components/PlaybackControls';
import LiveHUDOverlay from './components/LiveHUDOverlay';
import MatchVideoPlayer from './components/MatchVideoPlayer';
import WinProbabilityGauge from './components/WinProbabilityGauge';
import ChangePointTimeline from './components/ChangePointTimeline';
import InflectionLog from './components/InflectionLog';
import TeamComparisonCards from './components/TeamComparisonCards';
import BehaviorRadar from './components/BehaviorRadar';
import PELTSegmentsCard from './components/PELTSegmentsCard';
import { useEsportWebSocket } from './hooks/useEsportWebSocket';

export default function App() {
  const {
    isConnected,
    ticks,
    predictions,
    changePoints,
    simulatorStatus,
    isLiveBroadcasting,
    liveHudState,
    liveWinProbability,
    liveInflectionEvents,
    step,
    play,
    pause,
    reset,
    startLiveAnalysis,
    stopLiveAnalysis,
    analyzeYouTubeVideo,
    seekToRound
  } = useEsportWebSocket();

  const currentTick = ticks.length > 0 ? ticks[ticks.length - 1] : null;
  const latestPrediction = predictions.length > 0 ? predictions[predictions.length - 1] : null;

  // Fetch PELT segmentation boundaries when enough ticks have been processed
  const [peltSegments, setPeltSegments] = useState([]);
  const fetchPeltSegments = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/analytics/pelt');
      if (res.ok) {
        const data = await res.json();
        setPeltSegments(data.segments || []);
      }
    } catch (e) { /* silent */ }
  }, []);

  useEffect(() => {
    if (ticks.length >= 6) fetchPeltSegments();
  }, [ticks.length, fetchPeltSegments]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* Clean Top Navigation Bar */}
      <Header
        isConnected={isConnected}
        currentTick={currentTick}
        matchName="VCT Champions Grand Finals • Map: Ascent"
        blueName="Sentinels"
        redName="Fnatic"
      />

      {/* Main Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Live Broadcast Computer Vision & HUD Extraction Bar */}
        <LiveHUDOverlay
          isLiveBroadcasting={isLiveBroadcasting}
          liveHudState={liveHudState}
          liveWinProbability={liveWinProbability}
          liveInflectionEvents={liveInflectionEvents}
          onStartLive={startLiveAnalysis}
          onStopLive={stopLiveAnalysis}
        />

        {/* Playback & Story Controller */}
        <PlaybackControls
          status={simulatorStatus}
          onPlay={play}
          onPause={pause}
          onStep={step}
          onReset={reset}
        />

        {/* Live Match Broadcast Video Feed (Synchronized with Telemetry) */}
        <MatchVideoPlayer
          isPlaying={simulatorStatus.is_playing}
          currentTimeSeconds={simulatorStatus.current_game_time}
          currentTick={currentTick}
          latestPrediction={latestPrediction}
          changePoints={changePoints}
          onPlay={play}
          onPause={pause}
          onReset={reset}
          onAnalyzeYouTube={analyzeYouTubeVideo}
          onSeek={seekToRound}
        />

        {/* Match Vitals Scoreboard Strip */}
        <TeamComparisonCards
          currentTick={currentTick}
          blueName="Sentinels (SEN)"
          redName="Fnatic (FNC)"
        />

        {/* Primary Story View: Lead Timeline (2/3) + Win Outlook (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          <div className="lg:col-span-2">
            <ChangePointTimeline ticks={ticks} changePoints={changePoints} />
          </div>
          <div className="lg:col-span-1">
            <WinProbabilityGauge
              latestPrediction={latestPrediction}
              blueName={currentTick?.blue_team?.team_name || "Sentinels (SEN)"}
              redName={currentTick?.red_team?.team_name || "Fnatic (FNC)"}
            />
          </div>
        </div>

        {/* Chronological Match Story & Turning Points Feed */}
        <div>
          <InflectionLog predictions={predictions} />
        </div>

        {/* Advanced Analytics: Tactical Behavior Radar + PELT Macro-Phase Segmentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <BehaviorRadar
            currentTick={currentTick}
            blueName="Sentinels"
            redName="Fnatic"
          />
          <PELTSegmentsCard
            segments={peltSegments}
            totalMinutes={24}
          />
        </div>
      </main>

      {/* Reassuring Academic Footer */}
      <footer className="border-t border-warm-200/80 bg-white px-6 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-warm-500 gap-2">
          <div className="font-medium">
            EsportEcho Predict • Live Computer Vision & Statistical Change-Point Analytics Engine
          </div>
          <div>
            S. Mithun Senthil (Reg. No: 192324056) • CSA1021 Capstone Project
          </div>
        </div>
      </footer>
    </div>
  );
}
