"use client";

import { useEffect, useRef } from "react";
import { generateTransaction, type GeneratorContext } from "@/lib/transaction-generator";
import { useTransactionStore } from "@/store/useTransactionStore";

export function useTransactionSimulator() {
  const isRunning = useTransactionStore((s) => s.isSimulatorRunning);
  const speed = useTransactionStore((s) => s.simulatorSpeed);
  const fraudBias = useTransactionStore((s) => s.fraudRateBias);
  const settings = useTransactionStore((s) => s.simulatorSettings);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }

    const tick = () => {
      const txs = useTransactionStore.getState().transactions;
      const ctx: Partial<GeneratorContext> = {
        fraudRateBias: fraudBias,
        transactions: txs,
        patternVelocity: settings.patternVelocity,
        patternGeo: settings.patternGeo,
        patternAmount: settings.patternAmount,
        patternVpn: settings.patternVpn,
        patternNewDevice: settings.patternNewDevice,
        patternCardTesting: settings.patternCardTesting,
        amountMin: settings.amountMin,
        amountMax: settings.amountMax,
      };
      const txn = generateTransaction(ctx);
      addTransaction(txn);
    };

    tickRef.current = setInterval(tick, Math.max(500, speed));
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [
    isRunning,
    speed,
    fraudBias,
    settings.patternVelocity,
    settings.patternGeo,
    settings.patternAmount,
    settings.patternVpn,
    settings.patternNewDevice,
    settings.patternCardTesting,
    settings.amountMin,
    settings.amountMax,
    addTransaction,
  ]);
}
