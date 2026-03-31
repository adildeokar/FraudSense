"use client";

import { useMemo, useState, useEffect } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { LiveIndicator } from "@/components/dashboard/LiveIndicator";
import { useTransactionStore } from "@/store/useTransactionStore";

export function FraudTrendChart() {
  const minuteBuckets = useTransactionStore((s) => s.minuteBuckets);
  const [dash, setDash] = useState("");

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setDash(i % 2 === 0 ? "5 5" : "10 5");
      i++;
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const data = useMemo(
    () =>
      minuteBuckets.map((b, idx) => ({
        t: format(new Date(b.minute), "HH:mm"),
        total: b.total + idx * 0,
        fraud: b.fraud,
      })),
    [minuteBuckets]
  );

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          Transaction Volume vs Fraud — Last 60 Minutes
        </h3>
        <LiveIndicator />
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" />
            <XAxis dataKey="t" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "#0D1421",
                border: "1px solid #1E2D45",
                borderRadius: 8,
              }}
              labelStyle={{ color: "#f1f5f9" }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#00D4FF"
              strokeWidth={2}
              dot={false}
              strokeDasharray={dash}
              isAnimationActive
            />
            <Line
              type="monotone"
              dataKey="fraud"
              name="Fraudulent"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
