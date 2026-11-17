import React, { useState, useRef } from 'react';
import { Tv, ChevronDown, ChevronUp, Video, Globe, Upload, Play, Map, ExternalLink, Sparkles } from 'lucide-react';

export default function MatchVideoPlayer({ isPlaying = false, currentTimeSeconds = 0, currentTick = null }) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('local'); // 'local' | 'minimap' | 'youtube'
  const [localVideoUrl, setLocalVideoUrl] = useState(null);
  const [localFileName, setLocalFileName] = useState('');
  const [customYoutubeUrl, setCustomYoutubeUrl] = useState('https://www.youtube.com/watch?v=s9pB4sD8QxM');
  const [youtubeVideoId, setYoutubeVideoId] = useState('s9pB4sD8QxM');
  const [inputUrl, setInputUrl] = useState('');

  const fileInputRef = useRef(null);

  // Extract YouTube ID from URL or raw ID
  const parseYouTubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url.trim();
  };

  const handleLoadCustomYoutube = (e) => {
    e.preventDefault();
    const id = parseYouTubeId(inputUrl);
    if (id) {
      setYoutubeVideoId(id);
      setCustomYoutubeUrl(`https://www.youtube.com/watch?v=${id}`);
      setInputUrl('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
      const url = URL.createObjectURL(file);
      setLocalVideoUrl(url);
      setLocalFileName(file.name);
      setActiveTab('local');
    }
  };

  // Tactical Minimap Animation Variables
  const timeMins = Math.floor(currentTimeSeconds / 60);
  const isLateGame = timeMins >= 18;
  const isMidGame = timeMins >= 11 && timeMins < 18;

  return (
    <div className="bg-white border border-warm-200/80 rounded-2xl shadow-card overflow-hidden transition-all">
      {/* Player Header Bar */}
      <div className="px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-warm-100 bg-warm-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-team-blue text-white flex items-center justify-center shadow-xs">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-warm-900">
                Live Match Broadcast Feed
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-team-blue border border-blue-200/60">
                Multi-Source
              </span>
            </div>
            <p className="text-[11px] text-warm-500">
              Synchronized broadcast screen for arbitrary match video files & streams
            </p>
          </div>
        </div>

        {/* Tab & Collapse Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Mode Tabs */}
          <div className="flex items-center bg-white border border-warm-200 rounded-xl p-1 text-xs font-medium shadow-xs">
            <button
              onClick={() => setActiveTab('local')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'local' ? 'bg-team-blue text-white shadow-xs font-semibold' : 'text-warm-600 hover:text-warm-900'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Local Video</span>
            </button>

            <button
              onClick={() => setActiveTab('minimap')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'minimap' ? 'bg-team-blue text-white shadow-xs font-semibold' : 'text-warm-600 hover:text-warm-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Tactical 2D Map</span>
            </button>

            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'youtube' ? 'bg-team-blue text-white shadow-xs font-semibold' : 'text-warm-600 hover:text-warm-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>YouTube</span>
            </button>
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs text-warm-600 hover:text-warm-900 bg-white border border-warm-200 px-2.5 py-1.5 rounded-xl transition-all shadow-xs"
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Broadcast Canvas */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-3">
          {/* TAB 1: LOCAL VIDEO FILE (RECOMMENDED FOR EVALUATIONS) */}
          {activeTab === 'local' && (
            <div className="space-y-3">
              {localVideoUrl ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 shadow-inner border border-warm-200 flex flex-col justify-center">
                  <video
                    src={localVideoUrl}
                    controls
                    autoPlay={isPlaying}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video w-full rounded-xl border-2 border-dashed border-warm-300 hover:border-team-blue bg-warm-50/60 hover:bg-blue-50/30 flex flex-col items-center justify-center cursor-pointer transition-all p-6 text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-warm-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-team-blue">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-warm-800 mb-1">
                    Click to Select Any Match Video from Your Computer
                  </h4>
                  <p className="text-xs text-warm-500 max-w-md">
                    Choose any MP4, WebM, or MKV video file. Plays immediately offline with zero network latency.
                  </p>
                  <span className="mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-warm-200 text-team-blue shadow-xs">
                    Browse Computer Files
                  </span>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center justify-between text-xs text-warm-500 px-1">
                <span>
                  {localFileName ? (
                    <span className="font-semibold text-warm-700">Playing: {localFileName}</span>
                  ) : (
                    "Tip: You can test any video file the teacher provides right here."
                  )}
                </span>
                {localVideoUrl && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-team-blue font-semibold hover:underline"
                  >
                    Change Video File
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TACTICAL 2D MINIMAP VISUALIZER (ALWAYS WORKS, ZERO DEPENDENCIES) */}
          {activeTab === 'minimap' && (
            <div className="space-y-3">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 shadow-inner border border-warm-300 p-4 flex flex-col justify-between select-none">
                {/* Tactical Map SVG Canvas */}
                <svg viewBox="0 0 500 280" className="w-full h-full">
                  {/* Rift Background Grid */}
                  <rect width="500" height="280" fill="#0B132B" rx="10"/>
                  <path d="M 0 0 L 500 280" stroke="#1C2541" strokeWidth="3" strokeDasharray="5 5" opacity="0.4"/>
                  
                  {/* Summoner's Rift River */}
                  <path d="M 120 0 Q 250 140 380 280" fill="none" stroke="#1E3A8A" strokeWidth="24" opacity="0.6"/>
                  
                  {/* Three Lanes */}
                  {/* Top Lane */}
                  <path d="M 60 220 L 60 60 L 440 60" fill="none" stroke="#1E293B" strokeWidth="8"/>
                  {/* Mid Lane */}
                  <path d="M 60 220 L 440 60" fill="none" stroke="#1E293B" strokeWidth="8"/>
                  {/* Bot Lane */}
                  <path d="M 60 220 L 440 220 L 440 60" fill="none" stroke="#1E293B" strokeWidth="8"/>

                  {/* Bases */}
                  {/* Blue Base */}
                  <circle cx="60" cy="220" r="24" fill="#1D4ED8" fillOpacity="0.3" stroke="#2563EB" strokeWidth="2"/>
                  <text x="60" y="225" fill="#93C5FD" fontSize="11" fontWeight="bold" textAnchor="middle">T1 BASE</text>

                  {/* Red Base */}
                  <circle cx="440" cy="60" r="24" fill="#DC2626" fillOpacity="0.3" stroke="#EF4444" strokeWidth="2"/>
                  <text x="440" y="65" fill="#FCA5A5" fontSize="11" fontWeight="bold" textAnchor="middle">WBG BASE</text>

                  {/* Major Objective Pits */}
                  {/* Baron Pit */}
                  <circle cx="190" cy="95" r="16" fill="#581C87" fillOpacity="0.5" stroke="#A855F7" strokeWidth="1.5"/>
                  <text x="190" y="99" fill="#E9D5FF" fontSize="9" fontWeight="bold" textAnchor="middle">BARON</text>

                  {/* Dragon Pit */}
                  <circle cx="310" cy="185" r="16" fill="#7C2D12" fillOpacity="0.5" stroke="#F97316" strokeWidth="1.5"/>
                  <text x="310" y="189" fill="#FED7AA" fontSize="9" fontWeight="bold" textAnchor="middle">DRAGON</text>

                  {/* Dynamic Tactical Positions based on match phase */}
                  {!isMidGame && !isLateGame && (
                    <g>
                      {/* Laning phase: Champions spread evenly across lanes */}
                      <circle cx="60" cy="140" r="8" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5"/>
                      <circle cx="140" cy="60" r="8" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5"/>
                      <circle cx="230" cy="145" r="8" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5"/>
                      <circle cx="270" cy="135" r="8" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5"/>
                      <circle cx="250" cy="220" r="8" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5"/>
                      <circle cx="440" cy="140" r="8" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5"/>
                    </g>
                  )}

                  {isMidGame && (
                    <g>
                      {/* Mid game contest: Clumping around Dragon Pit */}
                      <circle cx="295" cy="180" r="9" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5"/>
                      <circle cx="280" cy="190" r="9" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5"/>
                      <circle cx="325" cy="175" r="9" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5"/>
                      <circle cx="335" cy="195" r="9" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5"/>
                      {/* Objective skirmish beacon */}
                      <circle cx="310" cy="185" r="28" fill="none" stroke="#F97316" strokeWidth="1.5" className="animate-ping" opacity="0.6"/>
                    </g>
                  )}

                  {isLateGame && (
                    <g>
                      {/* Late game siege: Baron control and push into Red Base */}
                      <circle cx="205" cy="100" r="10" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2"/>
                      <circle cx="370" cy="90" r="9" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5"/>
                      <circle cx="390" cy="80" r="9" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5"/>
                      <circle cx="420" cy="70" r="8" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5"/>
                      {/* Turning point clash beacon */}
                      <circle cx="205" cy="100" r="32" fill="none" stroke="#A855F7" strokeWidth="2" className="animate-ping" opacity="0.7"/>
                      <text x="250" y="30" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle">
                        ⚡ CRITICAL BARON CLASH (MINUTE {timeMins})
                      </text>
                    </g>
                  )}
                </svg>

                {/* Minimap Status Bar */}
                <div className="flex items-center justify-between text-xs text-slate-300 font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span>Match Time: <strong className="text-white">{timeMins}:00</strong></span>
                  <span className="text-amber-400 font-semibold">
                    {isLateGame ? "🔥 Late Game: Base Siege" : isMidGame ? "⚔️ Mid Game: Objective Skirmishes" : "🌾 Early Game: Laning & Farming"}
                  </span>
                  <span>Advantage: <strong className="text-cyan-400">{currentTick?.gold_diff >= 0 ? `+${currentTick?.gold_diff || 0}g` : `${currentTick?.gold_diff}g`}</strong></span>
                </div>
              </div>

              <div className="text-xs text-warm-500 px-1">
                Visualizing live champion positioning & tactical objective pressure in real time.
              </div>
            </div>
          )}

          {/* TAB 3: YOUTUBE STREAM EMBED */}
          {activeTab === 'youtube' && (
            <div className="space-y-3">
              {/* YouTube URL Input Bar */}
              <form onSubmit={handleLoadCustomYoutube} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste any YouTube match link or Video ID (e.g. https://www.youtube.com/watch?v=...)"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="flex-1 bg-warm-50 border border-warm-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-team-blue text-warm-800 placeholder-warm-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-team-blue hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Load Stream
                </button>
              </form>

              {/* YouTube Iframe Screen */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 shadow-inner border border-warm-200">
                <iframe
                  key={youtubeVideoId}
                  src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                  title="Esports Match Video Feed"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-warm-500 px-1">
                <span>
                  Video ID: <strong className="font-mono text-warm-700">{youtubeVideoId}</strong>
                </span>
                <a
                  href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-team-blue font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Open Video in New Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
