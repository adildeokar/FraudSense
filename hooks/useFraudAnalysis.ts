"use client";

import { useCallback, useEffect, useRef } from "react";
import { ruleBasedAnalysis } from "@/lib/fraud-scoring";
import { useTransactionStore } from "@/store/useTransactionStore";
import type { AnalysisResult } from "@/types";

const MAX_CONCURRENT = 2;

export function useFraudAnalysis() {
  const transactions = useTransactionStore((s) => s.transactions);
  const applyAnalysis = useTransactionStore((s) => s.applyAnalysis);
  const activeCountRef = useRef(0);
  const queueRef = useRef<string[]>([]);
  const inflightRef = useRef<Set<string>>(new Set());

  const processNext = useCallback(() => {
    while (
      activeCountRef.current < MAX_CONCURRENT &&
      queueRef.current.length > 0
    ) {
      const id = queueRef.current.find((q) => !inflightRef.current.has(q));
      if (!id) break;
      const idx = queueRef.current.indexOf(id);
      queueRef.current.splice(idx, 1);
      inflightRef.current.add(id);
      activeCountRef.current += 1;

      const run = async () => {
        const txn = useTransactionStore
          .getState()
          .transactions.find((t) => t.id === id);
        if (!txn || txn.status !== "PENDING" || txn.isAnalyzed) {
          inflightRef.current.delete(id);
          activeCountRef.current -= 1;
          processNext();
          return;
        }
        try {
          const res = await fetch("/api/analyze-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transaction: txn }),
          });
          const data = (await res.json()) as AnalysisResult;
          if (data && typeof data.riskScore === "number") {
            applyAnalysis(id, data);
          } else {
            applyAnalysis(id, ruleBasedAnalysis(txn));
          }
        } catch {
          applyAnalysis(id, ruleBasedAnalysis(txn));
        } finally {
          inflightRef.current.delete(id);
          activeCountRef.current -= 1;
          processNext();
        }
      };
      void run();
    }
  }, [applyAnalysis]);

  useEffect(() => {
    const pending = transactions.filter(
      (t) => t.status === "PENDING" && !t.isAnalyzed
    );
    pending.forEach((t) => {
      if (inflightRef.current.has(t.id)) return;
      if (queueRef.current.includes(t.id)) return;
      queueRef.current.push(t.id);
    });
    processNext();
  }, [transactions, processNext]);
}
