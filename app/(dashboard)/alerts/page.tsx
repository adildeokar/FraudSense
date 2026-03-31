"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { AlertTimeline } from "@/components/alerts/AlertTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactionStore } from "@/store/useTransactionStore";
import type { FraudAlert, RiskLevel } from "@/types";

type Tab = "all" | "open" | "critical" | "ack";

export default function AlertsPage() {
  const alerts = useTransactionStore((s) => s.alerts);
  const acknowledgeAlert = useTransactionStore((s) => s.acknowledgeAlert);
  const acknowledgeAlerts = useTransactionStore((s) => s.acknowledgeAlerts);
  const blockTransaction = useTransactionStore((s) => s.blockTransaction);
  const transactions = useTransactionStore((s) => s.transactions);
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState<"new" | "severity" | "amount">("new");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const counts = useMemo(() => {
    const bySev = (sev: RiskLevel) =>
      alerts.filter((a) => a.severity === sev && !a.isAcknowledged).length;
    return {
      critical: bySev("CRITICAL"),
      high: bySev("HIGH"),
      medium: bySev("MEDIUM"),
      ack: alerts.filter((a) => a.isAcknowledged).length,
    };
  }, [alerts]);

  const filtered = useMemo(() => {
    let list = [...alerts];
    if (tab === "open") list = list.filter((a) => !a.isAcknowledged);
    if (tab === "critical")
      list = list.filter((a) => a.severity === "CRITICAL" && !a.isAcknowledged);
    if (tab === "ack") list = list.filter((a) => a.isAcknowledged);
    if (sort === "new")
      list.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    if (sort === "severity") {
      const rank: Record<RiskLevel, number> = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
        SAFE: 0,
      };
      list.sort((a, b) => rank[b.severity] - rank[a.severity]);
    }
    if (sort === "amount")
      list.sort(
        (a, b) => b.transaction.amount - a.transaction.amount
      );
    return list;
  }, [alerts, tab, sort]);

  const toggleSel = (id: string, sel: boolean) => {
    setSelected((s) => {
      const n = new Set(s);
      if (sel) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  const bulkAck = () => {
    acknowledgeAlerts(Array.from(selected));
    setSelected(new Set());
  };

  const blockAllSelectedUsers = () => {
    const userIds = new Set<string>();
    filtered.forEach((a) => {
      if (selected.has(a.id)) userIds.add(a.transaction.userId);
    });
    transactions.forEach((t) => {
      if (userIds.has(t.userId)) blockTransaction(t.id);
    });
    setSelected(new Set());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap gap-3">
        <Badge variant="destructive" className="px-3 py-1">
          CRITICAL {counts.critical}
        </Badge>
        <Badge variant="warning" className="px-3 py-1">
          HIGH {counts.high}
        </Badge>
        <Badge className="px-3 py-1 bg-amber-500/20 text-amber-400">
          MEDIUM {counts.medium}
        </Badge>
        <Badge variant="secondary" className="px-3 py-1">
          ACKNOWLEDGED {counts.ack}
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Unacknowledged</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="ack">Acknowledged</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={sort === "new" ? "default" : "outline"}
            onClick={() => setSort("new")}
          >
            Newest
          </Button>
          <Button
            size="sm"
            variant={sort === "severity" ? "default" : "outline"}
            onClick={() => setSort("severity")}
          >
            Severity
          </Button>
          <Button
            size="sm"
            variant={sort === "amount" ? "default" : "outline"}
            onClick={() => setSort("amount")}
          >
            Amount
          </Button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <Button size="sm" onClick={bulkAck}>
            Acknowledge Selected ({selected.size})
          </Button>
          <Button size="sm" variant="destructive" onClick={blockAllSelectedUsers}>
            Block All (users)
          </Button>
        </div>
      )}

      <AlertTimeline
        alerts={filtered}
        selected={selected}
        onSelect={toggleSel}
        onAcknowledge={(id) => acknowledgeAlert(id)}
        onBlockUser={(userId) => {
          transactions
            .filter((t) => t.userId === userId)
            .forEach((t) => blockTransaction(t.id));
        }}
      />
    </motion.div>
  );
}
