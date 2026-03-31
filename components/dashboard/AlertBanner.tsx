"use client";

import { motion } from "framer-motion";
import { AlertOctagon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ALERT_TYPE_LABELS } from "@/lib/fraud-patterns";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function AlertBanner() {
  const alertsRaw = useTransactionStore((s) => s.alerts);
  const alerts = useMemo(
    () => alertsRaw.filter((a) => !a.isAcknowledged).slice(0, 5),
    [alertsRaw]
  );
  const acknowledgeAlert = useTransactionStore((s) => s.acknowledgeAlert);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 h-full min-h-[420px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold">Critical Alerts</h2>
        <Badge variant="destructive">{alerts.length}</Badge>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[480px]">
        {alerts.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)] py-8 text-center">
            No active alerts. System nominal.
          </p>
        ) : (
          alerts.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "rounded-lg border p-3 bg-[var(--surface-2)]/60",
                a.severity === "CRITICAL" &&
                  "border-l-4 border-l-[var(--accent-red)] shadow-[var(--glow-red)]",
                a.severity === "HIGH" && "border-l-4 border-l-[var(--accent-amber)]"
              )}
            >
              <div className="flex items-start gap-2">
                <AlertOctagon
                  className={cn(
                    "h-5 w-5 shrink-0 mt-0.5",
                    a.severity === "CRITICAL" && "text-[var(--accent-red)] animate-pulse"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                    {ALERT_TYPE_LABELS[a.alertType] ?? a.alertType}
                  </p>
                  <p className="text-sm font-mono text-[var(--accent-cyan)] mt-1">
                    {a.transactionId}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {a.transaction.userName} ·{" "}
                    {formatDistanceToNow(new Date(a.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Link href={`/investigate?txn=${a.transactionId}`}>
                      <Button size="sm" variant="secondary" className="gap-1">
                        Investigate <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => acknowledgeAlert(a.id)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
