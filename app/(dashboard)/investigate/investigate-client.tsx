"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChatInterface } from "@/components/investigate/ChatInterface";
import { RiskMeter } from "@/components/dashboard/RiskMeter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransactionStore } from "@/store/useTransactionStore";

export function InvestigateClient() {
  const params = useSearchParams();
  const paramId = params.get("txn");
  const transactions = useTransactionStore((s) => s.transactions);
  const getByUser = useTransactionStore((s) => s.getTransactionsByUser);
  const [loadId, setLoadId] = useState(paramId ?? "");
  const [activeId, setActiveId] = useState<string | null>(paramId);

  useEffect(() => {
    if (paramId) setActiveId(paramId);
  }, [paramId]);

  const txn = useMemo(
    () => transactions.find((t) => t.id === activeId) ?? null,
    [transactions, activeId]
  );

  const userTx = txn ? getByUser(txn.userId).slice(0, 5) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[calc(100vh-6rem)]"
    >
      <div className="lg:col-span-2 space-y-4">
        <div className="glass-panel rounded-xl p-4 border border-[var(--border)]">
          <p className="text-xs uppercase text-[var(--text-tertiary)] mb-2">
            Load transaction
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="TXN-XXXXXX"
              value={loadId}
              onChange={(e) => setLoadId(e.target.value)}
              className="font-mono"
            />
            <Button onClick={() => setActiveId(loadId.trim() || null)}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {txn ? (
          <>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-[var(--accent-cyan)]">{txn.id}</p>
                  <p className="text-lg font-semibold">{txn.merchantName}</p>
                </div>
                <Badge>{txn.status}</Badge>
              </div>
              <p className="text-2xl font-mono font-bold">
                ${txn.amount.toLocaleString()}
              </p>
              <RiskMeter score={txn.riskScore} size={160} />
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase text-[var(--text-tertiary)] mb-2">
                User profile
              </p>
              <p className="font-medium">{txn.userName}</p>
              <p className="text-sm text-[var(--text-secondary)]">{txn.userEmail}</p>
              <p className="text-xs mt-2 text-[var(--text-tertiary)]">
                Registered: {txn.userLocation}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase text-[var(--text-tertiary)] mb-2">
                Recent activity
              </p>
              <div className="space-y-2 text-xs">
                {userTx.map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between border-b border-[var(--border)]/50 py-1"
                  >
                    <span className="font-mono text-[var(--accent-cyan)]">{t.id}</span>
                    <span>${t.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase text-[var(--text-tertiary)] mb-2">
                Device
              </p>
              <p className="text-sm font-mono break-all">{txn.ipAddress}</p>
              <p className="text-xs mt-1">VPN: {txn.isVPN ? "Yes" : "No"}</p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase text-[var(--text-tertiary)] mb-2">
                Pattern flags
              </p>
              <div className="flex flex-wrap gap-1">
                {txn.flagReasons.map((f) => (
                  <Badge key={f} variant="destructive">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--text-tertiary)]">
            Enter a transaction ID to load context for the AI investigator.
          </p>
        )}
      </div>

      <div className="lg:col-span-3">
        <ChatInterface key={txn?.id ?? "none"} transaction={txn} />
      </div>
    </motion.div>
  );
}
