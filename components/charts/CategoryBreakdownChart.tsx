"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTransactionStore } from "@/store/useTransactionStore";
import type { TransactionCategory } from "@/types";

export function CategoryBreakdownChart() {
  const transactions = useTransactionStore((s) => s.transactions);

  const data = useMemo(() => {
    const m = new Map<TransactionCategory, { fraud: number; total: number }>();
    transactions.forEach((t) => {
      const cur = m.get(t.merchantCategory) ?? { fraud: 0, total: 0 };
      cur.total += 1;
      if (t.status === "FLAGGED" || t.status === "BLOCKED") cur.fraud += 1;
      m.set(t.merchantCategory, cur);
    });
    return [...m.entries()]
      .map(([name, v]) => ({
        name: name.replace(/_/g, " "),
        fraud: v.fraud,
        rate: v.total ? (v.fraud / v.total) * 100 : 0,
      }))
      .sort((a, b) => b.fraud - a.fraud);
  }, [transactions]);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" />
          <XAxis type="number" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            stroke="#64748b"
            tick={{ fill: "#94a3b8", fontSize: 9 }}
          />
          <Tooltip
            contentStyle={{
              background: "#0D1421",
              border: "1px solid #1E2D45",
            }}
          />
          <Bar dataKey="fraud" fill="#EF4444" radius={[0, 4, 4, 0]} name="Fraud count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
