import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Tv, ChevronDown, ChevronUp, Video, Globe, Upload, Play, Pause,
  Map, ExternalLink, Sparkles, Shield, Flame, Trophy, Swords,
  AlertTriangle, Crosshair, Zap, Radio, Layers, Target, Eye,
  Columns, Maximize2, RefreshCw, CheckCircle2
} from 'lucide-react';

export default function MatchVideoPlayer({
  activeVideo = null,
  totalRounds = 24,
  currentTimeSeconds = 0,
  currentTick = null,
  latestPrediction = null,
  changePoints = [],
  onAnalyzeYouTube = async () => {},
  onSeek = () => {}
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [displayMode, setDisplayMode] = useState('split'); // 'split' (video + radar) | 'video' | 'radar' | 'local'
  const [inputUrl, setInputUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);

  const [localVideoUrl, setLocalVideoUrl] = useState(null);
  const [localFileName, setLocalFileName] = useState('');

  const fileInputRef = useRef(null);
  useEffect(() => () => {
    if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
  }, [localVideoUrl]);

  const handleAnalyzeSubmit = async (event) => {
    event.preventDefault();
    setIsAnalyzing(true);
    setAnalysisSuccess(false);
    try {
      const result = await onAnalyzeYouTube(inputUrl.trim());
      setAnalysisSuccess(Boolean(result));
      if (result) setDisplayMode('split');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderReferenceVideo = () => activeVideo ? (
    <iframe
      title={activeVideo.title || 'YouTube reference video'}
      src={`https://www.youtube-nocookie.com/embed/${activeVideo.video_id}`}
      className="w-full h-full"
      allow="encrypted-media; picture-in-picture"
      allowFullScreen
    />
  ) : (
    <p className="grid h-full place-items-center p-4 text-center text-sm text-slate-300">
      Add a YouTube video to view it alongside the simulated replay.
    </p>
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalVideoUrl(url);
      setLocalFileName(file.name);
      setDisplayMode('local');
    }
  };

  // Round calculation (0s to 1380s maps to 24 rounds)
  const effectiveSeconds = currentTimeSeconds;
  const currentRound = Math.min(totalRounds, Math.floor(effectiveSeconds / 60) + 1);
  const roundMins = Math.floor(effectiveSeconds / 60);
  const roundSecs = Math.floor(effectiveSeconds % 60);
  const timeStr = `${String(roundMins).padStart(2, '0')}:${String(roundSecs).padStart(2, '0')}`;

  const blue = currentTick?.blue_team || {
    team_name: "SEN", total_gold: 2500, total_kills: 0, turrets_destroyed: 0, dragons: 0, barons: 0
  };
  const red = currentTick?.red_team || {
    team_name: "FNC", total_gold: 2500, total_kills: 0, turrets_destroyed: 0, dragons: 0, barons: 0
  };
  const credsDiff = currentTick?.gold_diff ?? (blue.total_gold - red.total_gold);
  const isBlueAhead = credsDiff >= 0;

  // Valorant Phase Classification
  const phaseInfo = useMemo(() => {
    if (currentRound <= 3) {
      return {
        label: `Round ${currentRound}: Pistol & Anti-Eco Phase`,
        buyType: "Pistol / Light Shields",
        description: "Teams duel with Ghosts and Sheriffs; TenZ secures opening frags on Ascent A-Site."
      };
    } else if (currentRound <= 7) {
      return {
        label: `Round ${currentRound}: Early Gun Rounds & B-Site Clash`,
        buyType: "Full Buy (Vandals & Phantoms)",
        description: "Fnatic executes B-Site with Omen smokes; Sentinels retake and defuse Spike."
      };
    } else if (currentRound <= 12) {
      return {
        label: `Round ${currentRound}: Mid-Control & Operator Duels`,
        buyType: "Operator / Heavy Shields",
        description: "TenZ dominates Mid Courtyard with Operator. Sentinels build an 8-4 halftime advantage."
      };
    } else if (currentRound <= 17) {
      return {
        label: `Round ${currentRound}: Second Half Gun Rounds & Retakes`,
        buyType: "Second Halftime Gun Rounds",
        description: "Sides swapped: Sentinels on Attack, Fnatic on Defense. Tactical trades continue."
      };
    } else if (currentRound <= 20) {
      return {
        label: `Round ${currentRound}: Decisive 1v3 Clutch (BOCPD Turning Point)`,
        buyType: "Max Buy / Ultimates Online",
        description: "TenZ executes an unreal 1v3 A-Site clutch with Jett knives! Statistically breaks Fnatic's economy."
      };
    } else {
      return {
        label: `Round ${currentRound}: Match Point & VCT Trophy Finish`,
        buyType: "Match Point / Save Pressure",
        description: "Sentinels break Fnatic's defense to secure their 13th round and win the Grand Finals!"
      };
    }
  }, [currentRound]);

  // Valorant Live Event Broadcast Callout
  const liveEventCallout = useMemo(() => {
    if (currentRound >= 23) {
      return {
        type: 'VICTORY',
        icon: '🏆',
        title: 'MATCH COMPLETE: SENTINELS WIN 13 - 6',
        detail: 'Sentinels eliminate Fnatic on A-Site to close out the VCT Champions Grand Finals on Ascent!',
        highlight: 'bg-emerald-50 border-emerald-300 text-emerald-900',
        spike: 'DEFUSED'
      };
    }
    if (currentRound >= 18) {
      return {
        type: 'CLUTCH',
        icon: '💥',
        title: 'TENZ 1v3 JETT CLUTCH & SPIKE DEFUSE (BOCPD INFLECTION POINT)',
        detail: 'TenZ activates Bladestorm, aces A-Site against Derke, Boaster & Chronicle, defusing Spike with 1.4s left! Win probability surges from 65% to 88% (+7.3k Creds).',
        highlight: 'bg-purple-50 border-purple-300 text-purple-900 ring-2 ring-purple-400/40',
        spike: 'DEFUSED'
      };
    }
    if (currentRound >= 16) {
      return {
        type: 'ECO_BREAK',
        icon: '🎯',
        title: 'A-SITE EXECUTE: ZEKKEN 3K WITH RAZE ULTIMATE',
        detail: 'zekken launches Showstopper into A Hell, clearing site for an easy Spike plant.',
        highlight: 'bg-amber-50 border-amber-300 text-amber-900',
        spike: 'PLANTED'
      };
    }
    if (currentRound >= 12) {
      return {
        type: 'HALFTIME',
        icon: '🔄',
        title: 'HALFTIME SIDE SWAP: SENTINELS LEAD 8 - 4',
        detail: 'Teams swap sides on Ascent! Sentinels switch to Attackers; Fnatic moves to Defenders.',
        highlight: 'bg-blue-50 border-blue-300 text-blue-900',
        spike: 'CARRIED'
      };
    }
    if (currentRound >= 8) {
      return {
        type: 'MID_CONTROL',
        icon: '🎯',
        title: 'TENZ OPERATOR PICK ON MID CATWALK',
        detail: 'TenZ holds Mid Catwalk with Operator, picking off Derke to secure early man advantage.',
        highlight: 'bg-slate-50 border-slate-300 text-slate-900',
        spike: 'CARRIED'
      };
    }
    if (currentRound >= 5) {
      return {
        type: 'B_SITE_EXECUTE',
        icon: '💣',
        title: 'SPIKE PLANTED AT B-SITE (RETAKE UNDERWAY)',
        detail: 'Fnatic rushes B Main and plants in Boathouse; Sacy & johnqt execute retake through Market.',
        highlight: 'bg-amber-50 border-amber-300 text-amber-900',
        spike: 'PLANTED'
      };
    }
    if (currentRound >= 3) {
      return {
        type: 'FIRST_BLOOD',
        icon: '🩸',
        title: 'FIRST BLOOD: TENZ ELIMINATES DERKE IN MID',
        detail: 'Aggressive duel in Mid Courtyard; TenZ lands opening headshot with Sheriff.',
        highlight: 'bg-rose-50 border-rose-300 text-rose-900',
        spike: 'CARRIED'
      };
    }
    return {
      type: 'PISTOL',
      icon: '🎯',
      title: 'PISTOL ROUND: DEFENDERS HOLDING ASCENT A-SITE',
      detail: 'Sentinels set up Cypher wires on B Site and Sova recon on A Main for opening pistol round.',
      highlight: 'bg-slate-50 border-slate-200 text-slate-800',
      spike: 'CARRIED'
    };
  }, [currentRound]);

  // Tactical Agent Positions on ASCENT (640 x 360 Canvas)
  const agents = useMemo(() => {
    if (currentRound <= 2) {
      return {
        blue: [
          { name: 'TenZ', agent: 'Jett', role: 'DUELIST', x: 470, y: 85, color: '#06B6D4', alive: true, gun: 'Ghost' },
          { name: 'zekken', agent: 'Raze', role: 'DUELIST', x: 310, y: 155, color: '#F97316', alive: true, gun: 'Classic' },
          { name: 'Sacy', agent: 'Sova', role: 'INITIATOR', x: 440, y: 110, color: '#3B82F6', alive: true, gun: 'Ghost' },
          { name: 'johnqt', agent: 'Cypher', role: 'SENTINEL', x: 170, y: 95, color: '#EAB308', alive: true, gun: 'Classic' },
          { name: 'Zellsis', agent: 'KAY/O', role: 'FLEX', x: 235, y: 125, color: '#A855F7', alive: true, gun: 'Classic' }
        ],
        red: [
          { name: 'Derke', agent: 'Jett', role: 'DUELIST', x: 490, y: 230, color: '#EF4444', alive: true, gun: 'Ghost' },
          { name: 'Chronicle', agent: 'Breach', role: 'INITIATOR', x: 470, y: 245, color: '#EF4444', alive: true, gun: 'Classic' },
          { name: 'Alfajer', agent: 'Killjoy', role: 'SENTINEL', x: 320, y: 250, color: '#EF4444', alive: true, gun: 'Classic' },
          { name: 'Boaster', agent: 'Omen', role: 'CONTROLLER', x: 505, y: 260, color: '#EF4444', alive: true, gun: 'Ghost' },
          { name: 'Leo', agent: 'Fade', role: 'INITIATOR', x: 340, y: 260, color: '#EF4444', alive: true, gun: 'Classic' }
        ]
      };
    }
    if (currentRound <= 4) {
      return {
        blue: [
          { name: 'TenZ', agent: 'Jett', role: 'DUELIST', x: 345, y: 145, color: '#06B6D4', alive: true, gun: 'Operator', action: 'Op Pick!' },
          { name: 'zekken', agent: 'Raze', role: 'DUELIST', x: 460, y: 100, color: '#F97316', alive: true, gun: 'Spectre' },
          { name: 'Sacy', agent: 'Sova', role: 'INITIATOR', x: 430, y: 90, color: '#3B82F6', alive: true, gun: 'Vandal' },
          { name: 'johnqt', agent: 'Cypher', role: 'SENTINEL', x: 160, y: 110, color: '#EAB308', alive: true, gun: 'Sheriff' },
          { name: 'Zellsis', agent: 'KAY/O', role: 'FLEX', x: 245, y: 130, color: '#A855F7', alive: true, gun: 'Vandal' }
        ],
        red: [
          { name: 'Derke', agent: 'Jett', role: 'DUELIST', x: 330, y: 205, color: '#EF4444', alive: false, respawning: true, gun: 'Sheriff' },
          { name: 'Chronicle', agent: 'Breach', role: 'INITIATOR', x: 480, y: 230, color: '#EF4444', alive: true, gun: 'Vandal' },
          { name: 'Alfajer', agent: 'Killjoy', role: 'SENTINEL', x: 145, y: 220, color: '#EF4444', alive: true, gun: 'Spectre' },
          { name: 'Boaster', agent: 'Omen', role: 'CONTROLLER', x: 310, y: 240, color: '#EF4444', alive: true, gun: 'Vandal' },
          { name: 'Leo', agent: 'Fade', role: 'INITIATOR', x: 470, y: 250, color: '#EF4444', alive: true, gun: 'Vandal' }
        ]
      };
    }
    if (currentRound <= 7) {
      return {
        blue: [
          { name: 'TenZ', agent: 'Jett', role: 'DUELIST', x: 185, y: 80, color: '#06B6D4', alive: true, gun: 'Vandal', action: 'Retaking B' },
          { name: 'zekken', agent: 'Raze', role: 'DUELIST', x: 205, y: 120, color: '#F97316', alive: true, gun: 'Phantom', action: '2k Retake' },
          { name: 'Sacy', agent: 'Sova', role: 'INITIATOR', x: 225, y: 135, color: '#3B82F6', alive: true, gun: 'Vandal' },
          { name: 'johnqt', agent: 'Cypher', role: 'SENTINEL', x: 155, y: 75, color: '#EAB308', alive: true, gun: 'Phantom', action: 'Defusing' },
          { name: 'Zellsis', agent: 'KAY/O', role: 'FLEX', x: 135, y: 65, color: '#A855F7', alive: true, gun: 'Vandal' }
        ],
        red: [
          { name: 'Derke', agent: 'Jett', role: 'DUELIST', x: 135, y: 125, color: '#EF4444', alive: false, respawning: true },
          { name: 'Chronicle', agent: 'Breach', role: 'INITIATOR', x: 165, y: 130, color: '#EF4444', alive: false, respawning: true },
          { name: 'Alfajer', agent: 'Killjoy', role: 'SENTINEL', x: 120, y: 110, color: '#EF4444', alive: true, gun: 'Vandal', action: 'Planted Spike' },
          { name: 'Boaster', agent: 'Omen', role: 'CONTROLLER', x: 150, y: 155, color: '#EF4444', alive: false, respawning: true },
          { name: 'Leo', agent: 'Fade', role: 'INITIATOR', x: 130, y: 185, color: '#EF4444', alive: true, gun: 'Phantom' }
        ]
      };
    }
    if (currentRound <= 17) {
      return {
        blue: [
          { name: 'TenZ', agent: 'Jett', role: 'DUELIST', x: 335, y: 135, color: '#06B6D4', alive: true, gun: 'Operator', action: 'Op Locked' },
          { name: 'zekken', agent: 'Raze', role: 'DUELIST', x: 460, y: 105, color: '#F97316', alive: true, gun: 'Vandal' },
          { name: 'Sacy', agent: 'Sova', role: 'INITIATOR', x: 420, y: 110, color: '#3B82F6', alive: true, gun: 'Vandal' },
          { name: 'johnqt', agent: 'Cypher', role: 'SENTINEL', x: 165, y: 100, color: '#EAB308', alive: true, gun: 'Vandal' },
          { name: 'Zellsis', agent: 'KAY/O', role: 'FLEX', x: 260, y: 140, color: '#A855F7', alive: true, gun: 'Vandal' }
        ],
        red: [
          { name: 'Derke', agent: 'Jett', role: 'DUELIST', x: 490, y: 220, color: '#EF4444', alive: true, gun: 'Vandal' },
          { name: 'Chronicle', agent: 'Breach', role: 'INITIATOR', x: 470, y: 235, color: '#EF4444', alive: true, gun: 'Vandal' },
          { name: 'Alfajer', agent: 'Killjoy', role: 'SENTINEL', x: 310, y: 230, color: '#EF4444', alive: true, gun: 'Spectre' },
          { name: 'Boaster', agent: 'Omen', role: 'CONTROLLER', x: 140, y: 210, color: '#EF4444', alive: true, gun: 'Sheriff' },
          { name: 'Leo', agent: 'Fade', role: 'INITIATOR', x: 160, y: 225, color: '#EF4444', alive: true, gun: 'Vandal' }
        ]
      };
    }
    if (currentRound <= 20) {
      return {
        blue: [
          { name: 'TenZ', agent: 'Jett', role: 'DUELIST', x: 465, y: 105, color: '#06B6D4', alive: true, gun: 'Bladestorm Knives', action: '1v3 CLUTCH & DEFUSE!', buff: 'Clutch' },
          { name: 'zekken', agent: 'Raze', role: 'DUELIST', x: 440, y: 130, color: '#F97316', alive: false, respawning: true },
          { name: 'Sacy', agent: 'Sova', role: 'INITIATOR', x: 485, y: 70, color: '#3B82F6', alive: false, respawning: true },
          { name: 'johnqt', agent: 'Cypher', role: 'SENTINEL', x: 420, y: 100, color: '#EAB308', alive: false, respawning: true },
          { name: 'Zellsis', agent: 'KAY/O', role: 'FLEX', x: 380, y: 120, color: '#A855F7', alive: false, respawning: true }
        ],
        red: [
          { name: 'Derke', agent: 'Jett', role: 'DUELIST', x: 485, y: 115, color: '#EF4444', alive: false, respawning: true },
          { name: 'Chronicle', agent: 'Breach', role: 'INITIATOR', x: 450, y: 90, color: '#EF4444', alive: false, respawning: true },
          { name: 'Alfajer', agent: 'Killjoy', role: 'SENTINEL', x: 495, y: 135, color: '#EF4444', alive: false, respawning: true },
          { name: 'Boaster', agent: 'Omen', role: 'CONTROLLER', x: 470, y: 125, color: '#EF4444', alive: false, respawning: true },
          { name: 'Leo', agent: 'Fade', role: 'INITIATOR', x: 505, y: 160, color: '#EF4444', alive: false, respawning: true }
        ]
      };
    }
    return {
      blue: [
        { name: 'TenZ', agent: 'Jett', role: 'DUELIST', x: 480, y: 95, color: '#06B6D4', alive: true, gun: 'Vandal', action: 'VICTORY 13-6', buff: 'Champions' },
        { name: 'zekken', agent: 'Raze', role: 'DUELIST', x: 460, y: 110, color: '#F97316', alive: true, gun: 'Vandal', action: 'VICTORY' },
        { name: 'Sacy', agent: 'Sova', role: 'INITIATOR', x: 440, y: 100, color: '#3B82F6', alive: true, gun: 'Vandal', action: 'VICTORY' },
        { name: 'johnqt', agent: 'Cypher', role: 'SENTINEL', x: 495, y: 125, color: '#EAB308', alive: true, gun: 'Vandal', action: 'VICTORY' },
        { name: 'Zellsis', agent: 'KAY/O', role: 'FLEX', x: 470, y: 70, color: '#A855F7', alive: true, gun: 'Vandal', action: 'VICTORY' }
      ],
      red: [
        { name: 'Derke', agent: 'Jett', role: 'DUELIST', x: 515, y: 140, color: '#EF4444', alive: false, respawning: true },
        { name: 'Chronicle', agent: 'Breach', role: 'INITIATOR', x: 500, y: 160, color: '#EF4444', alive: false, respawning: true },
        { name: 'Alfajer', agent: 'Killjoy', role: 'SENTINEL', x: 485, y: 155, color: '#EF4444', alive: false, respawning: true },
        { name: 'Boaster', agent: 'Omen', role: 'CONTROLLER', x: 465, y: 175, color: '#EF4444', alive: false, respawning: true },
        { name: 'Leo', agent: 'Fade', role: 'INITIATOR', x: 525, y: 170, color: '#EF4444', alive: false, respawning: true }
      ]
    };
  }, [currentRound]);

  // Key Round Jump Presets
  const keyEvents = [
    { round: 1, label: 'Rnd 01: Pistol Round', icon: '🎯' },
    { round: 3, label: 'Rnd 03: Mid Op Duel', icon: '🩸' },
    { round: 5, label: 'Rnd 05: B-Site Plant', icon: '💣' },
    { round: 12, label: 'Rnd 12: Halftime 8-4', icon: '🔄' },
    { round: 18, label: 'Rnd 18: TenZ 1v3 Clutch', icon: '💥' },
    { round: 23, label: 'Rnd 23: Champions Win', icon: '🏆' }
  ];

  // Helper to render the Ascent Radar SVG
  const renderAscentRadar = (isCompact = false) => (
    <div className={`relative ${isCompact ? 'aspect-video' : 'aspect-video'} w-full rounded-xl overflow-hidden bg-[#070B14] shadow-2xl border border-slate-800 p-2 select-none flex flex-col justify-between`}>
      <svg viewBox="0 0 640 360" className="w-full h-full">
        <defs>
          <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0B132B" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#070A12" stopOpacity="1"/>
          </radialGradient>
          <radialGradient id="omenSmoke" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B0764" stopOpacity="0.85"/>
            <stop offset="70%" stopColor="#1E1B4B" stopOpacity="0.75"/>
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0"/>
          </radialGradient>
          <filter id="jettGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="spikeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="640" height="360" fill="url(#radarBg)" rx="10"/>

        {/* Radar Compass Lines */}
        <circle cx="320" cy="180" r="140" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 6" opacity="0.35"/>
        <circle cx="320" cy="180" r="80" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 5" opacity="0.25"/>
        <line x1="320" y1="20" x2="320" y2="340" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" opacity="0.25"/>
        <line x1="20" y1="180" x2="620" y2="180" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" opacity="0.25"/>

        {/* Spawns */}
        <rect x="250" y="20" width="140" height="28" fill="#0F172A" stroke="#334155" strokeWidth="1.5" rx="6"/>
        <text x="320" y="37" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="1">
          DEFENDER SPAWN (CT)
        </text>

        <rect x="250" y="312" width="140" height="28" fill="#0F172A" stroke="#334155" strokeWidth="1.5" rx="6"/>
        <text x="320" y="329" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="1">
          ATTACKER SPAWN (T)
        </text>

        {/* Corridor Connections */}
        <path d="M 270 310 L 160 270 L 160 160" fill="none" stroke="#1E293B" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M 370 310 L 485 270 L 485 160" fill="none" stroke="#1E293B" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M 320 310 L 320 180 L 320 50" fill="none" stroke="#1E293B" strokeWidth="20" strokeLinecap="round"/>
        <path d="M 320 160 L 400 135 L 450 110" fill="none" stroke="#1E293B" strokeWidth="11" strokeLinejoin="round"/>
        <path d="M 320 180 L 240 145 L 180 120" fill="none" stroke="#1E293B" strokeWidth="11" strokeLinejoin="round"/>
        <path d="M 270 40 L 180 65 L 170 95" fill="none" stroke="#1E293B" strokeWidth="11" strokeLinejoin="round"/>
        <path d="M 370 40 L 470 65 L 480 95" fill="none" stroke="#1E293B" strokeWidth="11" strokeLinejoin="round"/>

        {/* MID COURTYARD */}
        <rect x="270" y="145" width="100" height="70" fill="#0F172A" stroke="#334155" strokeWidth="1.5" rx="4"/>
        <text x="320" y="182" fill="#64748B" fontSize="10" fontWeight="bold" textAnchor="middle">
          MID COURTYARD
        </text>

        {/* A SITE PLANT ZONE */}
        <rect x="440" y="85" width="80" height="55" fill="#1E293B" fillOpacity="0.6" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="4 3" rx="4"/>
        <text x="480" y="115" fill="#FDE047" fontSize="12" fontWeight="extrabold" textAnchor="middle">SITE A</text>
        <text x="480" y="128" fill="#FACC15" fontSize="8" textAnchor="middle">(PLANT ZONE)</text>
        <rect x="435" y="95" width="14" height="20" fill="#475569" stroke="#94A3B8" strokeWidth="1" rx="2"/>

        {/* B SITE PLANT ZONE */}
        <rect x="130" y="85" width="80" height="55" fill="#1E293B" fillOpacity="0.6" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="4 3" rx="4"/>
        <text x="170" y="115" fill="#FDE047" fontSize="12" fontWeight="extrabold" textAnchor="middle">SITE B</text>
        <text x="170" y="128" fill="#FACC15" fontSize="8" textAnchor="middle">(PLANT ZONE)</text>
        <rect x="110" y="95" width="18" height="35" fill="#475569" stroke="#94A3B8" strokeWidth="1" rx="2"/>

        {/* SMOKES */}
        <circle cx="485" cy="180" r="20" fill="url(#omenSmoke)"/>
        <circle cx="245" cy="140" r="18" fill="url(#omenSmoke)"/>

        {/* SPIKE (C4) STATUS */}
        {(currentRound >= 16 && currentRound <= 20) && (
          <g filter="url(#spikeGlow)">
            <circle cx="470" cy="110" r="26" fill="none" stroke="#EF4444" strokeWidth="2.5" className="animate-ping" opacity="0.9"/>
            <circle cx="470" cy="110" r="12" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2"/>
            <text x="470" y="114" fill="#FFFFFF" fontSize="10" fontWeight="black" textAnchor="middle">💣</text>
          </g>
        )}

        {(currentRound >= 5 && currentRound <= 7) && (
          <g filter="url(#spikeGlow)">
            <circle cx="165" cy="110" r="26" fill="none" stroke="#F59E0B" strokeWidth="2.5" className="animate-ping" opacity="0.85"/>
            <circle cx="165" cy="110" r="12" fill="#D97706" stroke="#FFFFFF" strokeWidth="2"/>
            <text x="165" y="114" fill="#FFFFFF" fontSize="10" fontWeight="black" textAnchor="middle">💣</text>
          </g>
        )}

        {/* BLUE TEAM AGENTS: SENTINELS (SEN) */}
        {agents.blue.map((agent) => (
          <g key={agent.name} className="transition-all duration-700">
            {agent.buff === 'Clutch' && (
              <circle cx={agent.x} cy={agent.y} r="16" fill="none" stroke="#06B6D4" strokeWidth="2.5" strokeDasharray="3 3" className="animate-spin"/>
            )}
            <circle
              cx={agent.x}
              cy={agent.y}
              r="10"
              fill={agent.alive ? agent.color : "#334155"}
              stroke="#FFFFFF"
              strokeWidth="1.8"
              filter={agent.alive ? "url(#jettGlow)" : undefined}
            />
            <text x={agent.x} y={agent.y + 3.5} fill="#FFFFFF" fontSize="7" fontWeight="black" textAnchor="middle">
              {agent.agent.slice(0, 3).toUpperCase()}
            </text>
            <text x={agent.x} y={agent.y - 12} fill="#E0F2FE" fontSize="8" fontWeight="bold" textAnchor="middle">
              {agent.name}
            </text>
            {agent.action && (
              <text x={agent.x} y={agent.y + 20} fill="#FDE047" fontSize="7.5" fontWeight="black" textAnchor="middle">
                {agent.action}
              </text>
            )}
          </g>
        ))}

        {/* RED TEAM AGENTS: FNATIC (FNC) */}
        {agents.red.map((agent) => (
          <g key={agent.name} className="transition-all duration-700" opacity={agent.alive ? 1 : 0.35}>
            <circle
              cx={agent.x}
              cy={agent.y}
              r="10"
              fill={agent.alive ? "#DC2626" : "#475569"}
              stroke={agent.alive ? "#FFFFFF" : "#94A3B8"}
              strokeWidth="1.8"
            />
            <text x={agent.x} y={agent.y + 3.5} fill="#FFFFFF" fontSize="7" fontWeight="black" textAnchor="middle">
              {agent.alive ? agent.agent.slice(0, 3).toUpperCase() : '✕'}
            </text>
            <text x={agent.x} y={agent.y - 12} fill={agent.alive ? "#FECACA" : "#94A3B8"} fontSize="8" fontWeight="bold" textAnchor="middle">
              {agent.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );

  return (
    <div className="bg-white border border-warm-200/90 rounded-2xl shadow-card overflow-hidden transition-all">
      {/* Real-Time YouTube Input & Broadcast Bar */}
      <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* URL Input Form */}
        <form onSubmit={handleAnalyzeSubmit} className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 relative flex items-center">
            <Globe className="w-4 h-4 text-cyan-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={inputUrl}
              aria-label="YouTube video URL or ID"
              required
              maxLength={2048}
              onChange={(e) => { setInputUrl(e.target.value); setAnalysisSuccess(false); }}
              placeholder="YouTube reference video URL or ID"
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isAnalyzing || !inputUrl.trim()}
            className="px-4 py-2 bg-team-blue hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Loading replay...</span>
              </>
            ) : analysisSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Replay loaded</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Load Simulated Replay</span>
              </>
            )}
          </button>
        </form>

        {/* View Layout Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 p-1 rounded-xl text-xs font-medium self-end lg:self-auto">
          <button
            onClick={() => setDisplayMode('split')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              displayMode === 'split' ? 'bg-team-blue text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Split Screen: Live Video on Left + Ascent Radar on Right"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Screen</span>
          </button>

          <button
            onClick={() => setDisplayMode('video')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              displayMode === 'video' ? 'bg-team-blue text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Full Video Mode"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Full Video</span>
          </button>

          <button
            onClick={() => setDisplayMode('radar')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              displayMode === 'radar' ? 'bg-team-blue text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Full Radar Mode"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ascent Radar</span>
          </button>

          <button
            onClick={() => setDisplayMode('local')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              displayMode === 'local' ? 'bg-team-blue text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Upload Local Video File"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Local File</span>
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Broadcast Canvas */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4 bg-[#080D1A]">
          {/* Tactical Top Telemetry HUD */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 text-white px-4 py-2.5 rounded-xl text-xs font-mono border border-slate-800 shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-400/30">
                ROUND {currentRound} / {totalRounds}
              </span>
              <span className="text-slate-300 hidden sm:inline font-sans font-medium">
                {phaseInfo.label}
              </span>
            </div>

            {/* Scoreboard */}
            <div className="flex items-center gap-3 font-sans">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-blue-400">SEN</span>
                <span className="text-base font-extrabold text-cyan-300 bg-blue-950 px-2.5 py-0.5 rounded border border-blue-700">
                  {blue.total_kills}
                </span>
              </div>
              <span className="text-slate-500 font-bold">:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-rose-300 bg-red-950 px-2.5 py-0.5 rounded border border-red-700">
                  {red.total_kills}
                </span>
                <span className="font-extrabold text-red-400">FNC</span>
              </div>
            </div>

            {/* Economy & Spike */}
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                Economy: <strong className={isBlueAhead ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isBlueAhead ? `+${(Math.abs(credsDiff) / 1000).toFixed(1)}k Creds (SEN)` : `+${(Math.abs(credsDiff) / 1000).toFixed(1)}k (FNC)`}
                </strong>
              </span>
              <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  liveEventCallout.spike === 'PLANTED'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse'
                    : liveEventCallout.spike === 'DEFUSED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {liveEventCallout.spike === 'PLANTED' ? '💣 SPIKE PLANTED' : liveEventCallout.spike === 'DEFUSED' ? '🛡️ SPIKE DEFUSED' : '📦 SPIKE CARRIED'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300">Replay telemetry and map positions are simulated. Reference video playback is independent.</p>

          {/* VIEW MODE 1: SPLIT SCREEN (YOUTUBE VIDEO ON LEFT + ASCENT RADAR ON RIGHT) */}
          {displayMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
              {/* Left Column: YouTube Video Feed */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
                {renderReferenceVideo()}
                <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md font-mono border border-slate-700 flex items-center gap-1.5 pointer-events-none">
                  <span className={`w-2 h-2 rounded-full bg-slate-400`}></span>
                  <span>Reference video</span>
                </div>
              </div>

              {/* Right Column: Tactical 2D Ascent Radar */}
              <div className="w-full">
                {renderAscentRadar(true)}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: FULL YOUTUBE VIDEO */}
          {displayMode === 'video' && (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl">
              {renderReferenceVideo()}
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-md font-mono border border-slate-700 flex items-center gap-2 pointer-events-none">
                <span className={`w-2 h-2 rounded-full bg-slate-400`}></span>
                <span>Reference video</span>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: FULL ASCENT RADAR */}
          {displayMode === 'radar' && (
            <div>
              {renderAscentRadar(false)}
            </div>
          )}

          {/* VIEW MODE 4: LOCAL VIDEO FILE */}
          {displayMode === 'local' && (
            <div className="space-y-3">
              {localVideoUrl ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 shadow-inner border border-slate-800 flex flex-col justify-center">
                  <video
                    src={localVideoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-xs px-2.5 py-1 rounded-md font-mono border border-slate-700">
                    File: {localFileName} • Sync: {isPlaying ? 'Playing' : 'Paused'}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video w-full rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-400 bg-slate-900/60 hover:bg-slate-800/50 flex flex-col items-center justify-center cursor-pointer transition-all p-6 text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 shadow-sm border border-slate-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-cyan-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mb-1">
                    Select Local Match Video from Your Computer
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md">
                    Choose any MP4 or WebM video. Plays and pauses in exact sync with the story player.
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Real-Time Combat Event Callout Banner */}
          <div className={`p-3.5 rounded-xl border transition-all shadow-xs flex items-start gap-3 ${liveEventCallout.highlight}`}>
            <div className="text-2xl mt-0.5 select-none">{liveEventCallout.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {liveEventCallout.title}
                </h4>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-white/80 shadow-2xs">
                  Round {currentRound} of {totalRounds}
                </span>
              </div>
              <p className="text-xs mt-0.5 leading-relaxed">
                {liveEventCallout.detail}
              </p>
              {/* BOCPD Statistical Confirmation */}
              {latestPrediction?.is_inflection_point && (
                <div className="mt-2 text-[11px] font-semibold text-purple-800 bg-purple-100/90 px-2.5 py-1 rounded-lg border border-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>
                    {latestPrediction.explanation} Blue win estimate {Math.round(latestPrediction.win_probability_blue * 100)}%. Impact score {latestPrediction.turning_point_impact_score}.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Jump Buttons for Teacher Evaluation */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              Jump to Key Round:
            </span>
            {keyEvents.map((ev) => (
              <button
                key={ev.round}
                onClick={() => onSeek(ev.round - 1)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all flex items-center gap-1.5 ${
                  currentRound === ev.round
                    ? 'bg-team-blue text-white border-blue-500 font-bold shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <span>{ev.icon}</span>
                <span>{ev.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
