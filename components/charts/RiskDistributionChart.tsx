"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTransactionStore } from "@/store/useTransactionStore";
import type { RiskLevel } from "@/types";
import { LiveIndicator } from "@/components/dashboard/LiveIndicator";

const ORDER: RiskLevel[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "SAFE"];
const COLORS: Record<RiskLevel, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#f59e0b",
  LOW: "#84cc16",
  SAFE: "#10b981",
};

export function RiskDistributionChart() {
  const transactions = useTransactionStore((s) => s.transactions);
  const stats = useTransactionStore((s) => s.stats);

  const data = useMemo(() => {
    const counts: Record<RiskLevel, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      SAFE: 0,
    };
    transactions.forEach((t) => {
      counts[t.riskLevel] = (counts[t.riskLevel] ?? 0) + 1;
    });
    return ORDER.map((name) => ({
      name,
      value: counts[name],
      color: COLORS[name],
    })).filter((d) => d.value > 0);
  }, [transactions]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Risk distribution
        </h3>
        <LiveIndicator />
      </div>
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={88}
              paddingAngle={2}
              isAnimationActive
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#0D1421",
                border: "1px solid #1E2D45",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pr-4 pb-6">
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-[var(--accent-cyan)]">
              {stats.fraudRate.toFixed(1)}%
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase">
              fraud rate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
