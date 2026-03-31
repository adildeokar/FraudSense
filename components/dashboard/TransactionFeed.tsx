"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { LiveIndicator } from "@/components/dashboard/LiveIndicator";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/store/useTransactionStore";
import type { Transaction, TransactionStatus } from "@/types";
import { cn } from "@/lib/utils";

const FLAG_EMOJI: Record<string, string> = {
  US: "🇺🇸",
  UK: "🇬🇧",
  DE: "🇩🇪",
  IN: "🇮🇳",
  NG: "🇳🇬",
  default: "🌍",
};

function flagFor(country: string) {
  return FLAG_EMOJI[country] ?? FLAG_EMOJI.default;
}

function riskBadgeClass(score: number) {
  if (score <= 30) return "bg-emerald-500/20 text-emerald-400";
  if (score <= 60) return "bg-amber-500/20 text-amber-400";
  if (score <= 80) return "bg-orange-500/20 text-orange-400";
  return "bg-red-500/20 text-red-400";
}

function StatusIcon({ status }: { status: TransactionStatus }) {
  if (status === "PENDING")
    return <Loader2 className="h-4 w-4 animate-spin text-[var(--text-tertiary)]" />;
  if (status === "FLAGGED" || status === "REVIEWING")
    return <AlertTriangle className="h-4 w-4 text-[var(--accent-red)]" />;
  if (status === "BLOCKED")
    return <Ban className="h-4 w-4 text-[var(--accent-red)] animate-pulse" />;
  return <CheckCircle2 className="h-4 w-4 text-[var(--accent-green)]" />;
}

export function TransactionFeed() {
  const transactions = useTransactionStore((s) => s.transactions);
  const [openId, setOpenId] = useState<string | null>(null);
  const slice = useMemo(() => transactions.slice(0, 15), [transactions]);
  const selected = useMemo(
    () => slice.find((t) => t.id === openId) ?? null,
    [slice, openId]
  );

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 h-full min-h-[420px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold">Live Transaction Feed</h2>
        <LiveIndicator />
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {slice.map((t) => (
            <motion.button
              type="button"
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={() => setOpenId(t.id)}
              className={cn(
                "w-full text-left rounded-lg border border-[var(--border)]/80 bg-[var(--surface-2)]/50 p-3 flex flex-wrap items-center gap-3 hover:border-[var(--accent-cyan)]/40 transition-colors",
                t.status === "PENDING" && "animate-pulse",
                t.status === "FLAGGED" && "animate-flash-red"
              )}
            >
              <StatusIcon status={t.status} />
              <span className="font-mono text-xs text-[var(--accent-cyan)]">
                {t.id}
              </span>
              <span className="flex-1 min-w-[120px] text-sm font-medium truncate">
                {t.merchantName}
              </span>
              <span
                className={cn(
                  "font-mono text-sm font-bold",
                  t.status === "FLAGGED" || t.status === "BLOCKED"
                    ? "text-[var(--accent-red)]"
                    : t.status === "CLEARED"
                      ? "text-[var(--accent-green)]"
                      : "text-[var(--text-primary)]"
                )}
              >
                ${t.amount.toLocaleString()}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                  riskBadgeClass(t.riskScore)
                )}
              >
                {t.riskScore}
              </span>
              <span className="text-lg" title={t.merchantCountry}>
                {flagFor(t.merchantCountry)}
              </span>
              <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(t.timestamp), { addSuffix: true })}
              </span>
              {t.status === "PENDING" && (
                <div className="w-full h-1 rounded bg-[var(--surface-2)] overflow-hidden">
                  <div className="h-full w-1/3 bg-[var(--accent-cyan)] animate-shimmer" />
                </div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <Link href="/transactions" className="mt-4 block">
        <Button variant="ghost" className="w-full text-[var(--accent-cyan)]">
          View All Transactions →
        </Button>
      </Link>

      <TransactionModal
        transaction={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </div>
  );
}
