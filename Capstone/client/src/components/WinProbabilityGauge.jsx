import React from 'react';
import { TrendingUp, TrendingDown, Minus, Compass } from 'lucide-react';

export default function WinProbabilityGauge({ latestPrediction, blueName = "T1", redName = "Weibo Gaming" }) {
  const probBlue = latestPrediction ? latestPrediction.win_probability_blue : 0.50;
  const probRed = latestPrediction ? latestPrediction.win_probability_red : 0.50;
  const momentum = latestPrediction ? latestPrediction.momentum_score : 0.0;

  const pctBlue = Math.round(probBlue * 100);
  const pctRed = Math.round(probRed * 100);

  // Friendly human explanation of current win odds
  let outlookTitle = "Dead Even Match";
  let outlookDescription = "Both teams are trading resources evenly. Any sudden fight could tip the balance.";
  let badgeColor = "bg-warm-100 text-warm-700 border-warm-200";

  if (pctBlue >= 70) {
    outlookTitle = `${blueName} in Strong Control`;
    outlookDescription = `${blueName} holds significant map advantage and economic lead. High statistical likelihood of closing out.`;
    badgeColor = "bg-blue-50 text-team-blue border-blue-200";
  } else if (pctBlue >= 55) {
    outlookTitle = `${blueName} Slight Advantage`;
    outlookDescription = `${blueName} leads in key skirmishes, but the match remains competitive.`;
    badgeColor = "bg-blue-50 text-team-blue border-blue-200";
  } else if (pctRed >= 70) {
    outlookTitle = `${redName} in Strong Control`;
    outlookDescription = `${redName} commands the pace and objectives across the map.`;
    badgeColor = "bg-red-50 text-team-red border-red-200";
  } else if (pctRed >= 55) {
    outlookTitle = `${redName} Slight Advantage`;
    outlookDescription = `${redName} holds tactical momentum, but a teamfight could still flip the result.`;
    badgeColor = "bg-red-50 text-team-red border-red-200";
  }

  return (
    <div className="bg-white border border-warm-200/80 rounded-2xl p-5 shadow-card flex flex-col justify-between h-full">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between border-b border-warm-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-team-blue" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-warm-600">
              Live Win Outlook
            </h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
            {outlookTitle}
          </span>
        </div>

        {/* Big Reassuring Percentage Comparison */}
        <div className="text-center my-3">
          <div className="text-4xl font-extrabold tracking-tight text-warm-900">
            {pctBlue}% <span className="text-base font-medium text-warm-400">vs</span> {pctRed}%
          </div>
          <div className="flex justify-between text-xs font-semibold text-warm-600 px-1 mt-1">
            <span className="text-team-blue font-bold">{blueName}</span>
            <span className="text-team-red font-bold">{redName}</span>
          </div>
        </div>

        {/* Two-Tone Progress Bar */}
        <div className="w-full h-3.5 rounded-full bg-warm-100 p-0.5 border border-warm-200/80 my-3 flex overflow-hidden">
          <div
            style={{ width: `${pctBlue}%` }}
            className="bg-team-blue h-full rounded-l-full transition-all duration-500"
          />
          <div
            style={{ width: `${pctRed}%` }}
            className="bg-team-red h-full rounded-r-full transition-all duration-500"
          />
        </div>

        {/* Narrative Description */}
        <p className="text-xs text-warm-600 leading-relaxed bg-warm-50 rounded-xl p-3 border border-warm-100 mt-2">
          {outlookDescription}
        </p>
      </div>

      {/* Momentum Footer */}
      <div className="mt-4 pt-3 border-t border-warm-100 flex items-center justify-between text-xs">
        <span className="text-warm-500 font-medium">Tactical Momentum:</span>
        <div className="font-semibold">
          {momentum > 0.1 ? (
            <span className="text-team-blue flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Accelerating ({blueName})
            </span>
          ) : momentum < -0.1 ? (
            <span className="text-team-red flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Accelerating ({redName})
            </span>
          ) : (
            <span className="text-warm-500 flex items-center gap-1">
              <Minus className="w-3.5 h-3.5" /> Balanced Pace
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
