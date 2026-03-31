"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTransactionStore } from "@/store/useTransactionStore";

export function VelocityChart() {
  const transactions = useTransactionStore((s) => s.transactions);

  const lineData = useMemo(() => {
    const byUser = new Map<string, number>();
    transactions.forEach((t) => {
      byUser.set(t.userId, Math.max(byUser.get(t.userId) ?? 0, t.velocityCount));
    });
    return [...byUser.entries()]
      .map(([userId, v], i) => ({
        user: userId.replace("USR-", "U"),
        velocity: v,
        i,
      }))
      .slice(0, 40);
  }, [transactions]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lineData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" />
          <XAxis dataKey="user" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
          <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              background: "#0D1421",
              border: "1px solid #1E2D45",
            }}
          />
          <Line
            type="stepAfter"
            dataKey="velocity"
            stroke="#00D4FF"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              const high = payload.velocity > 5;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={high ? 6 : 3}
                  fill={high ? "#EF4444" : "#00D4FF"}
                  stroke={high ? "#fecaca" : "none"}
                />
              );
            }}
            name="Peak velocity / hr"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
