"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

function colorForScore(score: number): string {
  if (score <= 30) return "#10b981";
  if (score <= 60) return "#f59e0b";
  if (score <= 80) return "#f97316";
  return "#ef4444";
}

interface RiskMeterProps {
  score: number;
  className?: string;
  size?: number;
}

export function RiskMeter({ score, className, size = 200 }: RiskMeterProps) {
  const mv = useMotionValue(0);
  const springOpts = useMemo(() => ({ stiffness: 80, damping: 18 }), []);
  const spring = useSpring(mv, springOpts);
  const angle = useTransform(spring, (s) => -90 + (s / 100) * 180);

  useEffect(() => {
    mv.set(score);
  }, [score, mv]);

  const r = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size * 0.65 }}>
      <svg width={size} height={size * 0.65} className="overflow-visible">
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          opacity={0.35}
        />
        <motion.g style={{ rotate: angle, transformOrigin: `${cx}px ${cy}px` }}>
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - r + 8}
            stroke={colorForScore(score)}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={6} fill={colorForScore(score)} />
        </motion.g>
      </svg>
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <span className="font-display text-3xl font-bold tabular-nums" style={{ color: colorForScore(score) }}>
          {Math.round(score)}
        </span>
        <span className="text-sm text-[var(--text-secondary)]"> / 100</span>
      </div>
    </div>
  );
}
