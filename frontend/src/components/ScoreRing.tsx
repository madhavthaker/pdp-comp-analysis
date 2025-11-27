"use client";

import { clsx } from "clsx";

interface ScoreRingProps {
  score: number;
  size?: number;
  color?: "ember" | "electric" | "success" | "warning" | "danger";
}

const colorMap = {
  ember: {
    stroke: "#FB923C",
    glow: "rgba(251, 146, 60, 0.3)",
  },
  electric: {
    stroke: "#38BDF8",
    glow: "rgba(56, 189, 248, 0.3)",
  },
  success: {
    stroke: "#4ADE80",
    glow: "rgba(74, 222, 128, 0.3)",
  },
  warning: {
    stroke: "#FACC15",
    glow: "rgba(250, 204, 21, 0.3)",
  },
  danger: {
    stroke: "#F87171",
    glow: "rgba(248, 113, 113, 0.3)",
  },
};

export function ScoreRing({ score, size = 120, color = "ember" }: ScoreRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const colors = colorMap[color];

  // Determine score quality for text color
  const getScoreColor = () => {
    if (score >= 80) return "text-success-400";
    if (score >= 60) return "text-warning-400";
    if (score >= 40) return "text-ember-400";
    return "text-danger-400";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
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
        <span className={clsx("text-4xl font-bold", getScoreColor())}>
          {score}
        </span>
        <span className="text-xs text-cream-100/40 uppercase tracking-wide">
          / 100
        </span>
      </div>
    </div>
  );
}

