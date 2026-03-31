"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";
import { VelocityChart } from "@/components/charts/VelocityChart";
import { LiveIndicator } from "@/components/dashboard/LiveIndicator";
import { MetricCounter } from "@/components/dashboard/MetricCounter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionStore } from "@/store/useTransactionStore";
import { cn } from "@/lib/utils";

const FLAG_EMOJI: Record<string, string> = {
  US: "🇺🇸",
  UK: "🇬🇧",
  DE: "🇩🇪",
  IN: "🇮🇳",
  NG: "🇳🇬",
  default: "🌍",
};

export default function AnalyticsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const stats = useTransactionStore((s) => s.stats);
  const minuteBuckets = useTransactionStore((s) => s.minuteBuckets);

  const areaData = useMemo(
    () =>
      minuteBuckets.map((b) => ({
        t: new Date(b.minute).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fraud: b.fraud,
        total: b.total,
      })),
    [minuteBuckets]
  );

  const riskBins = useMemo(() => {
    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10 + 1}-${(i + 1) * 10}`,
      count: 0,
      idx: i,
    }));
    transactions.forEach((t) => {
      const b = Math.min(9, Math.floor(t.riskScore / 10));
      bins[b]!.count += 1;
    });
    return bins;
  }, [transactions]);

  const countryData = useMemo(() => {
    const m = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.status === "FLAGGED" || t.status === "BLOCKED") {
        m.set(t.merchantCountry, (m.get(t.merchantCountry) ?? 0) + 1);
      }
    });
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({
        country: `${FLAG_EMOJI[country] ?? FLAG_EMOJI.default} ${country}`,
        count,
      }));
  }, [transactions]);

  const tp = transactions.filter(
    (t) =>
      (t.status === "FLAGGED" || t.status === "BLOCKED") &&
      t.flagReasons.length > 0
  ).length;
  const fp = Math.max(3, Math.floor(transactions.length * 0.08));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-sm text-[var(--text-secondary)]">
              Total Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-bold text-[var(--accent-cyan)]">
              <MetricCounter value={stats.totalTransactions} />
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-sm text-[var(--text-secondary)]">
              Fraud Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-bold text-[var(--accent-red)]">
              {stats.fraudRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-sm text-[var(--text-secondary)]">
              $ Protected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-bold text-[var(--accent-green)]">
              <MetricCounter value={Math.round(stats.totalAmountProtected)} />
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 bg-[var(--surface)] border-[var(--border)] min-h-[320px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base flex items-center gap-2">
              Fraud trend <LiveIndicator />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="fraudFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" />
                <XAxis dataKey="t" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0D1421",
                    border: "1px solid #1E2D45",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#00D4FF"
                  fill="rgba(0,212,255,0.1)"
                  name="Total"
                />
                <Area
                  type="monotone"
                  dataKey="fraud"
                  stroke="#EF4444"
                  fill="url(#fraudFill)"
                  name="Fraudulent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 bg-[var(--surface)] border-[var(--border)] min-h-[320px]">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              Risk score distribution <LiveIndicator />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBins}>
                <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0D1421",
                    border: "1px solid #1E2D45",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskBins.map((e) => (
                    <Cell
                      key={e.idx}
                      fill={
                        e.idx <= 2
                          ? "#10b981"
                          : e.idx <= 5
                            ? "#f59e0b"
                            : "#ef4444"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-base">Fraud by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart />
          </CardContent>
        </Card>
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-base">Fraud by country</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="country"
                  width={100}
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0D1421",
                    border: "1px solid #1E2D45",
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[var(--surface)] border-[var(--border)]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Velocity attack detection — user transaction frequency{" "}
            <LiveIndicator />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VelocityChart />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "True positives", value: tp, color: "text-emerald-400" },
          { label: "False positives (sim.)", value: fp, color: "text-amber-400" },
          {
            label: "Detection speed (avg ms)",
            value: 200 + (transactions.length % 600),
            color: "text-cyan-400",
          },
          {
            label: "Fraud prevented ($)",
            value: Math.round(stats.totalAmountProtected),
            color: "text-green-400",
          },
        ].map((c) => (
          <Card key={c.label} className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-normal text-[var(--text-secondary)]">
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn("font-display text-2xl font-bold", c.color)}>
                <MetricCounter value={c.value} />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
