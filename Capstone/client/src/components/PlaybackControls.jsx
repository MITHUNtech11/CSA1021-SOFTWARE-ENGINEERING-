import React from 'react';
import { Play, Pause, SkipForward, RotateCcw, FastForward } from 'lucide-react';

export default function PlaybackControls({ status, onPlay, onPause, onStep, onReset }) {
  const isPlaying = status?.is_playing || false;
  const currentSpeed = status?.playback_speed || 1.0;
  const currentIndex = status?.current_index || 0;
  const totalTicks = status?.total_ticks || 24;
  const progressPercent = totalTicks > 0 ? (currentIndex / totalTicks) * 100 : 0;

  const speeds = [1.0, 2.0, 5.0, 10.0];

  return (
    <div className="bg-white border border-warm-200/80 rounded-2xl p-4 shadow-card">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Playback Action Buttons */}
        <div className="flex items-center gap-2.5">
          {isPlaying ? (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-accent-amber hover:bg-amber-600 text-white transition-all shadow-sm active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" />
              Pause Match
            </button>
          ) : (
            <button
              onClick={() => onPlay(currentSpeed)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-team-blue hover:bg-blue-700 text-white transition-all shadow-sm active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Play Match Story
            </button>
          )}

          <button
            onClick={onStep}
            disabled={isPlaying}
            title="Step forward 1 minute"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-warm-50 hover:bg-warm-100 text-warm-700 border border-warm-200/90 disabled:opacity-40 transition-colors"
          >
            <SkipForward className="w-4 h-4 text-warm-500" />
            +1 Min
          </button>

          <button
            onClick={onReset}
            title="Rewind match to the beginning"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium bg-warm-50 hover:bg-warm-100 text-warm-600 border border-warm-200/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Story Scrubber Progress */}
        <div className="w-full md:w-5/12 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-medium text-warm-500">
            <span>Minute {currentIndex} of {totalTicks}</span>
            <span>{Math.round(progressPercent)}% Played</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-warm-100 overflow-hidden relative border border-warm-200/60">
            <div
              className="h-full bg-team-blue transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Speed Multipliers */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-warm-500 font-medium">Speed:</span>
          <div className="flex bg-warm-100 p-1 rounded-xl border border-warm-200/80">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onPlay(s)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  currentSpeed === s
                    ? 'bg-white text-team-blue shadow-sm font-bold'
                    : 'text-warm-500 hover:text-warm-900'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
