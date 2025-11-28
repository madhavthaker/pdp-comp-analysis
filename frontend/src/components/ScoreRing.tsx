"use client";

import { clsx } from "clsx";

interface ScoreRingProps {
  score: number;
  size?: number;
  color?: "coral" | "teal" | "forest" | "honey" | "rose";
  showLabel?: boolean;
}

const colorMap = {
  coral: {
    stroke: "#E94560",
    glow: "rgba(233, 69, 96, 0.25)",
    bg: "rgba(233, 69, 96, 0.08)",
  },
  teal: {
    stroke: "#0F4C5C",
    glow: "rgba(15, 76, 92, 0.25)",
    bg: "rgba(15, 76, 92, 0.08)",
  },
  forest: {
    stroke: "#2D6A4F",
    glow: "rgba(45, 106, 79, 0.25)",
    bg: "rgba(45, 106, 79, 0.08)",
  },
  honey: {
    stroke: "#D97706",
    glow: "rgba(217, 119, 6, 0.25)",
    bg: "rgba(217, 119, 6, 0.08)",
  },
  rose: {
    stroke: "#E11D48",
    glow: "rgba(225, 29, 72, 0.25)",
    bg: "rgba(225, 29, 72, 0.08)",
  },
};

export function ScoreRing({ score, size = 140, color = "coral", showLabel = true }: ScoreRingProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const colors = colorMap[color];

  // Determine score quality for text styling
  const getScoreStyle = () => {
    if (score >= 80) return { text: "text-forest-600", label: "Excellent" };
    if (score >= 60) return { text: "text-honey-500", label: "Good" };
    if (score >= 40) return { text: "text-coral-600", label: "Fair" };
    return { text: "text-rose-500", label: "Needs Work" };
  };

  const scoreStyle = getScoreStyle();

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: `drop-shadow(0 4px 16px ${colors.glow})` }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={colors.bg}
          stroke="rgba(228, 226, 221, 0.5)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={clsx("font-display text-4xl font-bold", scoreStyle.text)}>
          {score}
        </span>
        <span className="text-xs font-medium text-ink-50 uppercase tracking-wide">
          / 100
        </span>
      </div>
      {showLabel && (
        <span className={clsx(
          "mt-3 text-sm font-semibold uppercase tracking-wide",
          scoreStyle.text
        )}>
          {scoreStyle.label}
        </span>
      )}
    </div>
  );
}
