import React from 'react';
import { Coins, Swords, Shield, Flame, Trophy, Crosshair, Target } from 'lucide-react';

export default function TeamComparisonCards({ currentTick, blueName = "Sentinels (SEN)", redName = "Fnatic (FNC)" }) {
  const blue = currentTick?.blue_team || {
    total_gold: 2500, total_kills: 0, turrets_destroyed: 0, dragons: 0, barons: 0
  };
  const red = currentTick?.red_team || {
    total_gold: 2500, total_kills: 0, turrets_destroyed: 0, dragons: 0, barons: 0
  };

  const goldDiff = currentTick?.gold_diff || 0;
  const isBlueLeading = goldDiff >= 0;

  return (
    <div className="bg-white border border-warm-200/80 rounded-2xl p-4 sm:p-5 shadow-card">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-warm-100 pb-4 mb-4">
        {/* Blue Team (Defenders / Sentinels) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-team-blue flex items-center justify-center font-extrabold text-sm border border-blue-200 shadow-2xs">
            SEN
          </div>
          <div>
            <div className="text-sm font-bold text-warm-900">{blueName}</div>
            <div className="text-xs text-warm-500 font-mono flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-500" />
              {(blue.total_gold / 1000).toFixed(1)}k Creds (Economy)
            </div>
          </div>
        </div>

        {/* Lead Summary Badge */}
        <div className="text-center bg-slate-900 border border-slate-700 text-white rounded-xl px-5 py-2 shadow-inner">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            Economic & Tactical Advantage
          </div>
          <div className={`text-sm font-extrabold font-mono ${isBlueLeading ? 'text-cyan-400' : 'text-rose-400'}`}>
            {isBlueLeading ? `SEN +${Math.abs(goldDiff).toLocaleString()} Creds (Full Buy)` : `FNC +${Math.abs(goldDiff).toLocaleString()} Creds`}
          </div>
        </div>

        {/* Red Team (Attackers / Fnatic) */}
        <div className="flex items-center gap-3 flex-row-reverse sm:flex-row">
          <div className="text-right">
            <div className="text-sm font-bold text-warm-900">{redName}</div>
            <div className="text-xs text-warm-500 font-mono flex items-center justify-end gap-1">
              {(red.total_gold / 1000).toFixed(1)}k Creds (Economy)
              <Coins className="w-3 h-3 text-amber-500" />
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-red-50 text-team-red flex items-center justify-center font-extrabold text-sm border border-red-200 shadow-2xs">
            FNC
          </div>
        </div>
      </div>

      {/* 4 Essential Valorant Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {/* Kills / Frags */}
        <div className="bg-warm-50/70 rounded-xl p-2.5 border border-warm-200/50">
          <div className="flex items-center justify-center gap-1 text-xs text-warm-500 mb-1">
            <Swords className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Frags (Kills)</span>
          </div>
          <div className="text-base font-extrabold text-warm-800 font-mono">
            <span className="text-team-blue">{blue.total_kills}</span>
            <span className="text-warm-300 mx-1.5">-</span>
            <span className="text-team-red">{red.total_kills}</span>
          </div>
        </div>

        {/* Spike Plants / Site Defuses */}
        <div className="bg-warm-50/70 rounded-xl p-2.5 border border-warm-200/50">
          <div className="flex items-center justify-center gap-1 text-xs text-warm-500 mb-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Spike Sites Won / Retakes</span>
          </div>
          <div className="text-base font-extrabold text-warm-800 font-mono">
            <span className="text-team-blue">{blue.turrets_destroyed}</span>
            <span className="text-warm-300 mx-1.5">-</span>
            <span className="text-team-red">{red.turrets_destroyed}</span>
          </div>
        </div>

        {/* First Bloods / Opening Picks */}
        <div className="bg-warm-50/70 rounded-xl p-2.5 border border-warm-200/50">
          <div className="flex items-center justify-center gap-1 text-xs text-warm-500 mb-1">
            <Target className="w-3.5 h-3.5 text-amber-500" />
            <span>Opening Picks (First Bloods)</span>
          </div>
          <div className="text-base font-extrabold text-warm-800 font-mono">
            <span className="text-team-blue">{blue.dragons}</span>
            <span className="text-warm-300 mx-1.5">-</span>
            <span className="text-team-red">{red.dragons}</span>
          </div>
        </div>

        {/* Round Clutches / Aces */}
        <div className="bg-warm-50/70 rounded-xl p-2.5 border border-warm-200/50">
          <div className="flex items-center justify-center gap-1 text-xs text-warm-500 mb-1">
            <Trophy className="w-3.5 h-3.5 text-purple-600" />
            <span>Round Clutches & Aces</span>
          </div>
          <div className="text-base font-extrabold text-warm-800 font-mono">
            <span className="text-team-blue">{blue.barons}</span>
            <span className="text-warm-300 mx-1.5">-</span>
            <span className="text-team-red">{red.barons}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
