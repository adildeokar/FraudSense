"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  DollarSign,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { FraudMap } from "@/components/dashboard/FraudMap";
import { FraudTrendChart } from "@/components/charts/FraudTrendChart";
import { RiskDistributionChart } from "@/components/charts/RiskDistributionChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
import { useTransactionStore } from "@/store/useTransactionStore";

export default function DashboardPage() {
  const stats = useTransactionStore((s) => s.stats);
  const transactions = useTransactionStore((s) => s.transactions);

  const spark = useMemo(() => {
    return transactions.slice(0, 20).map((t, i) => ({
      i,
      v: t.riskScore,
    }));
  }, [transactions]);

  const fraudDetected = stats.flaggedCount + stats.blockedCount;
  const protectedFmt = useCallback((n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Analyzed"
          value={stats.totalTransactions}
          icon={Shield}
          accent="cyan"
          delta="+live stream"
          deltaPositive
        />
        <StatCard
          label="Fraud Detected"
          value={fraudDetected}
          icon={AlertTriangle}
          accent="red"
          delta={`${stats.fraudRate.toFixed(1)}% fraud rate`}
          deltaPositive={false}
        />
        <StatCard
          label="Amount Protected"
          value={Math.round(stats.totalAmountProtected)}
          icon={DollarSign}
          accent="green"
          subtitle="Fraudulent value intercepted"
          format={protectedFmt}
        />
        <StatCard
          label="Avg Risk Score"
          value={Math.round(stats.avgRiskScore)}
          icon={TrendingUp}
          accent="amber"
        >
          <div className="mt-3 h-12 w-full opacity-90">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </StatCard>
        <StatCard
          label="Active Alerts"
          value={stats.alertsActive}
          icon={Bell}
          accent="red"
          pulse={stats.alertsActive > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <TransactionFeed />
        </div>
        <div className="lg:col-span-2">
          <AlertBanner />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <FraudTrendChart />
        </div>
        <div className="lg:col-span-2">
          <RiskDistributionChart />
        </div>
      </div>

      <FraudMap />
    </motion.div>
  );
}
