"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useFraudAnalysis } from "@/hooks/useFraudAnalysis";
import { useTransactionSimulator } from "@/hooks/useTransactionSimulator";
import { useTransactionStore } from "@/store/useTransactionStore";

export function DashboardEffects() {
  useTransactionSimulator();
  useFraudAnalysis();
  const transactions = useTransactionStore((s) => s.transactions);
  const prevRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const prev = prevRef.current;
    transactions.forEach((t) => {
      const was = prev.get(t.id);
      if (
        was === "PENDING" &&
        t.status === "FLAGGED" &&
        t.riskLevel === "CRITICAL"
      ) {
        toast.error(
          `CRITICAL: ${t.id} flagged — $${t.amount.toLocaleString()} at ${t.merchantName}`,
          { duration: 5000 }
        );
      }
      prev.set(t.id, t.status);
    });
  }, [transactions]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        const s = useTransactionStore.getState();
        s.setSimulatorRunning(!s.isSimulatorRunning);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
