"use client";

import { useMemo } from "react";

interface PulsePoint {
  risk_score: number;
  is_fraud_predicted: boolean;
}

/**
 * Renders recent transaction risk scores as a heartbeat-style waveform —
 * a flat, quiet line that spikes sharply on flagged fraud. This is the
 * platform's signature visual: it makes the core idea (signal vs. noise
 * in a stream of transactions) legible at a glance, and it's driven by
 * real prediction data rather than being decorative.
 */
export function RiskPulse({
  points,
  height = 72,
}: {
  points: PulsePoint[];
  height?: number;
}) {
  const { path, dots, width } = useMemo(() => {
    const w = Math.max(points.length * 14, 280);
    const midY = height / 2;
    const amp = height / 2 - 8;

    if (points.length === 0) {
      return { path: `M0,${midY} L${w},${midY}`, dots: [], width: w };
    }

    const step = w / Math.max(points.length - 1, 1);
    let d = "";
    const dotPositions: { x: number; y: number; fraud: boolean; score: number }[] = [];

    points.forEach((p, i) => {
      const x = i * step;
      // quiet baseline that spikes proportional to risk score, sharper for fraud
      const spike = p.is_fraud_predicted
        ? amp * (0.55 + p.risk_score * 0.45)
        : amp * p.risk_score * 0.35;
      const y = midY - spike;

      if (i === 0) {
        d += `M${x},${midY} `;
      }
      // little zigzag in toward the spike and back out, like an ECG blip
      const preX = x - step * 0.25;
      const postX = x + step * 0.25;
      d += `L${preX},${midY} L${x},${y} L${postX},${midY} `;
      dotPositions.push({ x, y, fraud: p.is_fraud_predicted, score: p.risk_score });
    });
    d += `L${w},${midY}`;

    return { path: d, dots: dotPositions, width: w };
  }, [points, height]);

  return (
    <div className="relative overflow-hidden rounded-lg">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        className="block"
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="var(--color-panel-border)"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        <path
          d={path}
          fill="none"
          stroke="var(--color-signal-safe)"
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.fraud ? 4 : 2}
            fill={
              d.fraud
                ? "var(--color-signal-danger)"
                : d.score > 0.02
                  ? "var(--color-signal-warn)"
                  : "var(--color-signal-safe)"
            }
          >
            {d.fraud && (
              <animate
                attributeName="r"
                values="4;6;4"
                dur="1.6s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}
      </svg>
    </div>
  );
}
