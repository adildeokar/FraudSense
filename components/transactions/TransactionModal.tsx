"use client";

import { Bot, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";
import { RiskMeter } from "@/components/dashboard/RiskMeter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTransactionStore } from "@/store/useTransactionStore";
import type { Transaction } from "@/types";

interface TransactionModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionModal({
  transaction,
  open,
  onOpenChange,
}: TransactionModalProps) {
  const blockTransaction = useTransactionStore((s) => s.blockTransaction);
  const clearTransaction = useTransactionStore((s) => s.clearTransaction);
  const getByUser = useTransactionStore((s) => s.getTransactionsByUser);
  const transactions = useTransactionStore((s) => s.transactions);

  const live = useMemo(() => {
    if (!transaction) return null;
    return transactions.find((t) => t.id === transaction.id) ?? null;
  }, [transactions, transaction]);
  const t = live ?? transaction;

  const userHistory = useMemo(
    () => (t ? getByUser(t.userId).slice(0, 10) : []),
    [t, getByUser]
  );

  const chartData = useMemo(
    () =>
      [...userHistory]
        .reverse()
        .map((x, i) => ({ i, amt: x.amount })),
    [userHistory]
  );

  const flaggedPrior = userHistory.filter(
    (x) => x.status === "FLAGGED" || x.status === "BLOCKED"
  ).length;

  if (!t) return null;

  const geoMismatch =
    t.userLocation &&
    !t.userLocation.toLowerCase().includes(t.merchantCountry.toLowerCase());

  const rec = t.recommendation ?? "REVIEW";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-[var(--border)] bg-[var(--surface)]">
        <DialogHeader>
          <DialogTitle className="font-mono text-[var(--accent-cyan)]">
            {t.id}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Transaction Details</TabsTrigger>
            <TabsTrigger value="ai">AI Risk Analysis</TabsTrigger>
            <TabsTrigger value="history">User History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[var(--text-tertiary)]">Amount</p>
                <p className="font-mono text-lg font-bold">
                  ${t.amount.toLocaleString()} {t.currency}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-tertiary)]">Status</p>
                <Badge>{t.status}</Badge>
              </div>
              <div>
                <p className="text-[var(--text-tertiary)]">Merchant</p>
                <p>{t.merchantName}</p>
                <Badge variant="outline" className="mt-1">
                  {t.merchantCategory}
                </Badge>
              </div>
              <div>
                <p className="text-[var(--text-tertiary)]">Location</p>
                <p>
                  {t.merchantCity}, {t.merchantCountry}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {t.userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{t.userName}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{t.userEmail}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <p>
                <span className="text-[var(--text-tertiary)]">IP</span>{" "}
                <span className="font-mono">{t.ipAddress}</span>
              </p>
              <p>
                <span className="text-[var(--text-tertiary)]">Device</span>{" "}
                <span className="font-mono truncate block">{t.deviceFingerprint}</span>
              </p>
              <p>VPN: {t.isVPN ? "Yes" : "No"}</p>
              <p>New device: {t.isNewDevice ? "Yes" : "No"}</p>
            </div>
            <div
              className={`rounded-lg border p-3 ${
                geoMismatch
                  ? "border-[var(--accent-amber)]/50 bg-amber-500/5"
                  : "border-[var(--border)]"
              }`}
            >
              <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">
                Location comparison
              </p>
              <p className="text-sm mt-1">
                User registered: <strong>{t.userLocation}</strong>
              </p>
              <p className="text-sm">
                Transaction from:{" "}
                <strong>
                  {t.merchantCity}, {t.merchantCountry}
                </strong>
              </p>
              {geoMismatch && (
                <p className="text-xs text-[var(--accent-amber)] mt-2">
                  Possible geographic anomaly — verify travel or ATO.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai" className="mt-4 space-y-4">
            <div className="flex justify-center">
              <RiskMeter score={t.riskScore} />
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-center">
              <Badge variant="destructive">{t.riskLevel}</Badge>
              <span className="text-sm text-[var(--text-secondary)]">
                Confidence
              </span>
              <Progress
                value={t.aiConfidence ?? 70}
                className="w-32 h-2"
              />
              <span className="text-sm font-mono">{t.aiConfidence ?? 70}%</span>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--text-tertiary)] mb-2">
                Flag reasons
              </p>
              <div className="flex flex-wrap gap-1">
                {t.flagReasons.map((f) => (
                  <Badge key={f} variant="destructive">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
            <blockquote className="border-l-4 border-[var(--accent-cyan)] pl-4 py-2 text-sm text-[var(--text-secondary)] bg-[var(--surface-2)]/50 rounded-r-lg">
              {t.aiExplanation || "Awaiting AI narrative after analysis completes."}
            </blockquote>
            {t.detectedPatterns && t.detectedPatterns.length > 0 && (
              <div>
                <p className="text-xs uppercase mb-1">Detected patterns</p>
                <ul className="list-disc list-inside text-sm text-[var(--text-secondary)]">
                  {t.detectedPatterns.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-center">
              <Badge
                className="text-base px-4 py-1"
                variant={
                  rec === "BLOCK"
                    ? "destructive"
                    : rec === "CLEAR"
                      ? "success"
                      : "warning"
                }
              >
                {rec}
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              This user has{" "}
              <strong className="text-[var(--accent-amber)]">{flaggedPrior}</strong>{" "}
              flagged / blocked transactions in recent history.
            </p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="amt"
                    stroke="#00D4FF"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="max-h-40 overflow-y-auto text-xs space-y-1">
              {userHistory.map((x) => (
                <div
                  key={x.id}
                  className="flex justify-between border-b border-[var(--border)]/50 py-1"
                >
                  <span className="font-mono text-[var(--accent-cyan)]">{x.id}</span>
                  <span>${x.amount}</span>
                  <Badge variant="outline">{x.status}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border)]">
          <Button variant="destructive" onClick={() => blockTransaction(t.id)}>
            Block Transaction
          </Button>
          <Button
            className="bg-[var(--accent-green)] text-[#080c14] hover:brightness-110"
            onClick={() => clearTransaction(t.id)}
          >
            Clear Transaction
          </Button>
          <Button
            variant="secondary"
            className="border-[var(--accent-amber)] text-[var(--accent-amber)]"
            onClick={() =>
              useTransactionStore.getState().updateTransaction(t.id, {
                status: "REVIEWING",
              })
            }
          >
            Escalate for Review
          </Button>
          <Link href={`/investigate?txn=${t.id}`}>
            <Button variant="outline" className="gap-2">
              <Bot className="h-4 w-4" />
              Investigate with AI
              <ExternalLink className="h-3 w-3 opacity-50" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
