import React from 'react';
import { Coins, Swords, Shield, Flame, Trophy } from 'lucide-react';

export default function TeamComparisonCards({ currentTick, blueName = "T1", redName = "Weibo Gaming" }) {
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
        {/* Blue Team Lead Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-team-blue flex items-center justify-center font-bold text-sm border border-blue-100">
            T1
          </div>
          <div>
            <div className="text-sm font-bold text-warm-900">{blueName}</div>
            <div className="text-xs text-warm-500 font-mono">
              {(blue.total_gold / 1000).toFixed(1)}k Gold
            </div>
          </div>
        </div>

        {/* Lead Summary Badge */}
        <div className="text-center bg-warm-50 border border-warm-200/80 rounded-xl px-4 py-1.5">
          <div className="text-[11px] font-semibold text-warm-500 uppercase tracking-wider">
            Current Advantage
          </div>
          <div className={`text-sm font-bold ${isBlueLeading ? 'text-team-blue' : 'text-team-red'}`}>
            {isBlueLeading ? `T1 +${Math.abs(goldDiff).toLocaleString()}g` : `WBG +${Math.abs(goldDiff).toLocaleString()}g`}
          </div>
        </div>

        {/* Red Team Lead Badge */}
        <div className="flex items-center gap-3 flex-row-reverse sm:flex-row">
          <div className="text-right">
            <div className="text-sm font-bold text-warm-900">{redName}</div>
            <div className="text-xs text-warm-500 font-mono">
              {(red.total_gold / 1000).toFixed(1)}k Gold
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-red-50 text-team-red flex items-center justify-center font-bold text-sm border border-red-100">
            WBG
          </div>
        </div>
      </div>

      {/* 4 Essential Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {/* Kills */}
        <div className="bg-warm-50/70 rounded-xl p-2.5 border border-warm-200/50">
          <div className="flex items-center justify-center gap-1 text-xs text-warm-500 mb-1">
            <Swords className="w-3.5 h-3.5" />
            <span>Total Kills</span>
          </div>
          <div className="text-base font-bold text-warm-800">
            <span className="text-team-blue">{blue.total_kills}</span>
            <span className="text-warm-300 mx-1.5">-</span>
            <span className="text-team-red">{red.total_kills}</span>
          </div>
        </div>

        {/* Turrets */}
        <div className="bg-warm-50/70 rounded-xl p-2.5 border border-warm-200/50">
          <div className="flex items-center justify-center gap-1 text-xs text-warm-500 mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Towers Destroyed</span>
          </div>
          <div className="text-base font-bold text-warm-800">
            <span className="text-team-blue">{blue.turrets_destroyed}</span>
            <span className="text-warm-300 mx-1.5">-</span>
            <span className="text-team-red">{red.turrets_destroyed}</span>
          </div>
        </div>

        {/* Dragons */}
        <div className="bg-warm-50/70 rounded-xl p-2.5 border border-warm-200/50">
          <div className="flex items-center justify-center gap-1 text-xs text-warm-500 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Dragons</span>
          </div>
          <div className="text-base font-bold text-warm-800">
            <span className="text-team-blue">{blue.dragons}</span>
            <span className="text-warm-300 mx-1.5">-</span>
            <span className="text-team-red">{red.dragons}</span>
          </div>
        </div>

        {/* Barons */}
        <div className="bg-warm-50/70 rounded-xl p-2.5 border border-warm-200/50">
          <div className="flex items-center justify-center gap-1 text-xs text-warm-500 mb-1">
            <Trophy className="w-3.5 h-3.5 text-purple-600" />
            <span>Baron Nashor</span>
          </div>
          <div className="text-base font-bold text-warm-800">
            <span className="text-team-blue">{blue.barons}</span>
            <span className="text-warm-300 mx-1.5">-</span>
            <span className="text-team-red">{red.barons}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
