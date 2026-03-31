"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { MetricCounter } from "@/components/dashboard/MetricCounter";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: "cyan" | "red" | "green" | "amber";
  delta?: string;
  deltaPositive?: boolean;
  subtitle?: string;
  pulse?: boolean;
  format?: (n: number) => string;
  children?: React.ReactNode;
}

const accentMap = {
  cyan: "from-cyan-500/20 to-transparent border-t-cyan-500/50",
  red: "from-red-500/20 to-transparent border-t-red-500/50",
  green: "from-emerald-500/20 to-transparent border-t-emerald-500/50",
  amber: "from-amber-500/20 to-transparent border-t-amber-500/50",
};

const iconColor = {
  cyan: "text-[var(--accent-cyan)]",
  red: "text-[var(--accent-red)]",
  green: "text-[var(--accent-green)]",
  amber: "text-[var(--accent-amber)]",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  delta,
  deltaPositive,
  subtitle,
  pulse,
  format,
  children,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg",
        "bg-gradient-to-b",
        accentMap[accent],
        "border-t-2",
        pulse && "animate-border-pulse-red"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">
            <MetricCounter value={value} format={format} />
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">{subtitle}</p>
          )}
          {delta && (
            <span
              className={cn(
                "mt-2 inline-block rounded px-2 py-0.5 text-xs font-medium",
                deltaPositive
                  ? "bg-emerald-500/15 text-[var(--accent-green)]"
                  : "bg-red-500/15 text-[var(--accent-red)]"
              )}
            >
              {delta}
            </span>
          )}
        </div>
        <div
          className={cn(
            "rounded-lg bg-[var(--surface-2)] p-2.5 shadow-[var(--glow-cyan)]",
            iconColor[accent]
          )}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      </div>
      {children}
    </motion.div>
  );
}
