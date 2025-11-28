"use client";

import { clsx } from "clsx";

interface ComparisonBarProps {
  sourceScore: number;
  referenceScore: number;
}

export function ComparisonBar({ sourceScore, referenceScore }: ComparisonBarProps) {
  const maxScore = 10;
  const sourcePercent = (sourceScore / maxScore) * 100;
  const referencePercent = (referenceScore / maxScore) * 100;
  
  const sourceLeads = sourceScore > referenceScore;
  const referenceLeads = referenceScore > sourceScore;

  return (
    <div className="space-y-4">
      {/* Source bar */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-ink-200 w-24 text-right">You</span>
        <div className="flex-1 h-3 bg-canvas-200 rounded-full overflow-hidden relative">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-700 ease-out",
              sourceLeads 
                ? "bg-gradient-to-r from-coral-400 to-coral-500" 
                : "bg-gradient-to-r from-canvas-400 to-ink-50"
            )}
            style={{ width: `${sourcePercent}%` }}
          />
        </div>
        <span className={clsx(
          "text-lg font-bold w-10 text-right tabular-nums",
          sourceLeads ? "text-coral-600" : "text-ink-200"
        )}>
          {sourceScore}
        </span>
      </div>

      {/* Reference bar */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-ink-200 w-24 text-right">Competitor</span>
        <div className="flex-1 h-3 bg-canvas-200 rounded-full overflow-hidden relative">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-700 ease-out",
              referenceLeads 
                ? "bg-gradient-to-r from-teal-400 to-teal-500" 
                : "bg-gradient-to-r from-canvas-400 to-ink-50"
            )}
            style={{ width: `${referencePercent}%` }}
          />
        </div>
        <span className={clsx(
          "text-lg font-bold w-10 text-right tabular-nums",
          referenceLeads ? "text-teal-600" : "text-ink-200"
        )}>
          {referenceScore}
        </span>
      </div>
    </div>
  );
}
