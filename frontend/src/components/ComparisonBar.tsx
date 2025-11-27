"use client";

interface ComparisonBarProps {
  sourceScore: number;
  referenceScore: number;
}

export function ComparisonBar({ sourceScore, referenceScore }: ComparisonBarProps) {
  const maxScore = 10;
  const sourcePercent = (sourceScore / maxScore) * 100;
  const referencePercent = (referenceScore / maxScore) * 100;

  return (
    <div className="space-y-2">
      {/* Source bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-cream-100/50 w-16 text-right">You</span>
        <div className="flex-1 h-2 bg-cream-100/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ember-500 to-ember-400 rounded-full transition-all duration-700"
            style={{ width: `${sourcePercent}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-ember-400 w-8">{sourceScore}</span>
      </div>

      {/* Reference bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-cream-100/50 w-16 text-right">Competitor</span>
        <div className="flex-1 h-2 bg-cream-100/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-electric-500 to-electric-400 rounded-full transition-all duration-700"
            style={{ width: `${referencePercent}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-electric-400 w-8">{referenceScore}</span>
      </div>
    </div>
  );
}

