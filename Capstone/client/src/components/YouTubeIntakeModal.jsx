import React, { useState } from 'react';
import { Play, Sparkles, Video, CheckCircle2, ArrowRight, X, AlertCircle, Crosshair, Radio, Layers, Activity } from 'lucide-react';

const SAMPLE_MATCHES = [
  {
    id: 's9pB4sD8QxM',
    url: 'https://www.youtube.com/watch?v=s9pB4sD8QxM',
    title: 'VCT Champions Grand Finals • Ascent',
    matchup: 'Sentinels vs Fnatic',
    map: 'Ascent',
    badge: 'Grand Finals',
    highlight: '24 Rounds • TenZ 1v3 Clutch & Defuse (Round 18) • Halftime 8-4 Comeback',
    thumbnail: 'https://img.youtube.com/vi/s9pB4sD8QxM/hqdefault.jpg'
  },
  {
    id: 'dQw4w9WgXcQ',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'VCT Masters Madrid • Lotus',
    matchup: 'Sentinels vs Gen.G',
    map: 'Lotus',
    badge: 'Masters Madrid',
    highlight: 'Overtime Map • Aggressive 3-Site Attacks • Eco Clutch Inflections',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
  },
  {
    id: '21X5lGlDOfg',
    url: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
    title: 'VCT Americas Kickoff • Split',
    matchup: 'LOUD vs NRG',
    map: 'Split',
    badge: 'Americas Kickoff',
    highlight: 'Mid-Control Operator Duels • B-Heaven Retake Regimes',
    thumbnail: 'https://img.youtube.com/vi/21X5lGlDOfg/hqdefault.jpg'
  }
];

export default function YouTubeIntakeModal({
  isOpen = false,
  onClose = () => {},
  onSelectVideo = async () => {},
  activeVideo = null
}) {
  const [inputUrl, setInputUrl] = useState(
    activeVideo?.videoId ? `https://www.youtube.com/watch?v=${activeVideo.videoId}` : 'https://www.youtube.com/watch?v=s9pB4sD8QxM'
  );
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputUrl.trim()) {
      setErrorMessage('Please enter a valid YouTube video or broadcast URL');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    setLoadingStep(1);

    const stepTimer1 = setTimeout(() => setLoadingStep(2), 700);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 1400);

    try {
      await onSelectVideo(inputUrl.trim());
      setTimeout(() => {
        setLoading(false);
        setLoadingStep(0);
        onClose();
      }, 500);
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setLoadingStep(0);
      setErrorMessage(err.message || 'Failed to retrieve video metadata. Please check URL.');
    }
  };

  const handleQuickSelect = (sample) => {
    setInputUrl(sample.url);
    onSelectVideo(sample.url).then(() => {
      onClose();
    }).catch((err) => {
      setErrorMessage(err.message || 'Failed to initialize sample match.');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-warm-200/90 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-warm-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/25">
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-warm-900">
                  Select VALORANT Match Broadcast
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                  YouTube Input
                </span>
              </div>
              <p className="text-xs text-warm-500 mt-0.5">
                Provide a YouTube URL to retrieve broadcast footage, extract 5v5 HUD telemetry via Computer Vision, and compute change-point analytics.
              </p>
            </div>
          </div>

          {activeVideo && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-warm-400 hover:text-warm-700 hover:bg-warm-100 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* URL Input Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-warm-700">
              YouTube Video or Live Stream URL
            </label>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={loading}
                  className="w-full px-4 py-3 text-sm bg-warm-50/70 border border-warm-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-team-blue/30 focus:border-team-blue font-mono text-warm-800 placeholder-warm-400 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-team-blue hover:bg-team-blue/90 text-white font-semibold text-xs tracking-wide shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Stream...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Retrieve & Run Analytics</span>
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>

          {/* Loading Pipeline Visualizer */}
          {loading && (
            <div className="bg-warm-50 border border-warm-200 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="text-xs font-bold text-warm-700 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-team-blue animate-pulse" />
                Initializing Multi-Tier Ingestion & Analytics Pipeline
              </div>
              <div className="space-y-2">
                <div className={`flex items-center gap-2.5 text-xs ${loadingStep >= 1 ? 'text-emerald-700 font-semibold' : 'text-warm-400'}`}>
                  {loadingStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-warm-300" />}
                  <span>1. Resolving stream metadata & stream pipe via yt-dlp / oEmbed</span>
                </div>
                <div className={`flex items-center gap-2.5 text-xs ${loadingStep >= 2 ? 'text-emerald-700 font-semibold' : 'text-warm-400'}`}>
                  {loadingStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-warm-300" />}
                  <span>2. Calibrating 5v5 living agent ROIs & Spike planting detector</span>
                </div>
                <div className={`flex items-center gap-2.5 text-xs ${loadingStep >= 3 ? 'text-emerald-700 font-semibold' : 'text-warm-400'}`}>
                  {loadingStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-warm-300" />}
                  <span>3. Synchronizing CUSUM, PELT & BOCPD statistical engines with video timeline</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick-Select Curated Matches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-warm-700">
                Or Select a Curated VCT Tournament Match
              </span>
              <span className="text-[11px] text-warm-500 font-medium">
                1-Click Quick Load
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_MATCHES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => !loading && handleQuickSelect(sample)}
                  className="group bg-warm-50/70 hover:bg-white border border-warm-200/80 hover:border-team-blue/60 rounded-2xl p-3.5 transition-all cursor-pointer shadow-xs hover:shadow-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-team-blue border border-blue-200">
                        {sample.badge}
                      </span>
                      <span className="text-[11px] font-mono text-warm-500 font-semibold">
                        {sample.map}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-warm-800 group-hover:text-team-blue transition-colors">
                      {sample.matchup}
                    </div>

                    <p className="text-[11px] text-warm-500 mt-1 line-clamp-2 leading-relaxed">
                      {sample.highlight}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-warm-100 flex items-center justify-between text-[11px] font-semibold text-team-blue">
                    <span>Load Match</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Pipeline Architecture Summary */}
          <div className="pt-4 border-t border-warm-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-warm-50/60 p-2.5 rounded-xl border border-warm-200/60">
              <Video className="w-4 h-4 text-team-blue mx-auto mb-1" />
              <div className="text-[11px] font-bold text-warm-800">yt-dlp Ingestion</div>
              <div className="text-[10px] text-warm-500">Live / VOD Stream Pipe</div>
            </div>
            <div className="bg-warm-50/60 p-2.5 rounded-xl border border-warm-200/60">
              <Crosshair className="w-4 h-4 text-red-500 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-warm-800">Computer Vision HUD</div>
              <div className="text-[10px] text-warm-500">5v5 Roster & Spike ROI</div>
            </div>
            <div className="bg-warm-50/60 p-2.5 rounded-xl border border-warm-200/60">
              <Layers className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-warm-800">Sequential CPD</div>
              <div className="text-[10px] text-warm-500">CUSUM + PELT + BOCPD</div>
            </div>
            <div className="bg-warm-50/60 p-2.5 rounded-xl border border-warm-200/60">
              <Sparkles className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-warm-800">Tactical Predictor</div>
              <div className="text-[10px] text-warm-500">Win Odds & Turning Points</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
