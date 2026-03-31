"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedTransactions } from "@/data/seed-transactions";
import type {
  DashboardStats,
  FraudAlert,
  RiskLevel,
  Transaction,
  TransactionStatus,
} from "@/types";
import type { SimulatorSettings } from "@/types";

const MAX_TX = 500;

function mapRecommendationToStatus(
  rec: "BLOCK" | "FLAG" | "REVIEW" | "CLEAR",
  riskLevel: RiskLevel
): TransactionStatus {
  if (rec === "BLOCK") return "BLOCKED";
  if (rec === "CLEAR") return "CLEARED";
  if (rec === "REVIEW") return "REVIEWING";
  if (riskLevel === "CRITICAL" || riskLevel === "HIGH") return "FLAGGED";
  return "CLEARED";
}

function computeStats(transactions: Transaction[], alerts: FraudAlert[]): DashboardStats {
  const total = transactions.length;
  const flagged = transactions.filter(
    (t) => t.status === "FLAGGED" || t.status === "REVIEWING"
  ).length;
  const blocked = transactions.filter((t) => t.status === "BLOCKED").length;
  const cleared = transactions.filter((t) => t.status === "CLEARED").length;
  const blockedSum = transactions
    .filter((t) => t.status === "BLOCKED")
    .reduce((s, t) => s + t.amount, 0);
  const fraudRate = total ? ((flagged + blocked) / total) * 100 : 0;
  const avgRisk = total
    ? transactions.reduce((s, t) => s + t.riskScore, 0) / total
    : 0;
  const alertsActive = alerts.filter((a) => !a.isAcknowledged).length;
  return {
    totalTransactions: total,
    flaggedCount: flagged,
    blockedCount: blocked,
    clearedCount: cleared,
    totalAmountProtected: blockedSum,
    fraudRate,
    avgRiskScore: Math.round(avgRisk * 10) / 10,
    alertsActive,
  };
}

function alertTypeFromFlags(
  flags: string[]
): FraudAlert["alertType"] {
  if (flags.some((f) => f.includes("VELOCITY") || f.includes("CARD_TESTING")))
    return "VELOCITY";
  if (flags.some((f) => f.includes("GEO"))) return "GEO_ANOMALY";
  if (flags.some((f) => f.includes("AMOUNT"))) return "AMOUNT_SPIKE";
  if (flags.some((f) => f.includes("VPN") || f.includes("PROXY")))
    return "VPN_DETECTED";
  if (flags.some((f) => f.includes("NEW_DEVICE"))) return "NEW_DEVICE";
  return "PATTERN_MATCH";
}

const defaultSimulatorSettings: SimulatorSettings = {
  velocityThreshold: 5,
  highAmountThreshold: 5000,
  geoAnomalyKm: 500,
  autoBlockCritical: true,
  patternVelocity: true,
  patternGeo: true,
  patternAmount: true,
  patternVpn: true,
  patternNewDevice: true,
  patternCardTesting: true,
  amountMin: 5,
  amountMax: 15000,
  animationSpeed: "normal",
  soundEnabled: false,
};

export interface TransactionStore {
  transactions: Transaction[];
  alerts: FraudAlert[];
  stats: DashboardStats;
  isSimulatorRunning: boolean;
  simulatorSpeed: number;
  fraudRateBias: number;
  selectedTransaction: Transaction | null;
  simulatorSettings: SimulatorSettings;
  minuteBuckets: { minute: number; total: number; fraud: number }[];

  addTransaction: (txn: Transaction) => void;
  addTransactionsBulk: (txns: Transaction[]) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  addAlert: (alert: FraudAlert) => void;
  acknowledgeAlert: (id: string, by?: string) => void;
  acknowledgeAlerts: (ids: string[], by?: string) => void;
  setSelectedTransaction: (txn: Transaction | null) => void;
  setSimulatorRunning: (running: boolean) => void;
  setSimulatorSpeed: (speed: number) => void;
  setFraudRateBias: (bias: number) => void;
  setSimulatorSettings: (partial: Partial<SimulatorSettings>) => void;
  clearTransaction: (id: string) => void;
  blockTransaction: (id: string) => void;
  applyAnalysis: (
    id: string,
    result: {
      riskScore: number;
      riskLevel: RiskLevel;
      flagReasons: string[];
      explanation: string;
      recommendation: "BLOCK" | "FLAG" | "REVIEW" | "CLEAR";
      confidence: number;
      detectedPatterns: string[];
    }
  ) => void;
  getStats: () => DashboardStats;
  getTransactionsByUser: (userId: string) => Transaction[];
  getRecentAlerts: (limit: number) => FraudAlert[];
  pushMinuteSample: (totalInc: number, fraudInc: number) => void;
}

const initialAlerts: FraudAlert[] = [];

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: seedTransactions.map((t) => ({
        ...t,
        timestamp:
          t.timestamp instanceof Date ? t.timestamp : new Date(t.timestamp),
      })),
      alerts: initialAlerts,
      stats: computeStats(
        seedTransactions.map((t) => ({
          ...t,
          timestamp:
            t.timestamp instanceof Date ? t.timestamp : new Date(t.timestamp),
        })),
        initialAlerts
      ),
      isSimulatorRunning: true,
      simulatorSpeed: 2500,
      fraudRateBias: 30,
      selectedTransaction: null,
      simulatorSettings: defaultSimulatorSettings,
      minuteBuckets: Array.from({ length: 60 }, (_, i) => ({
        minute: Date.now() - (59 - i) * 60000,
        total: 0,
        fraud: 0,
      })),

      pushMinuteSample: (totalInc, fraudInc) => {
        set((s) => {
          const buckets = [...s.minuteBuckets];
          const last = buckets[buckets.length - 1]!;
          const now = Date.now();
          if (now - last.minute < 60000) {
            buckets[buckets.length - 1] = {
              ...last,
              total: last.total + totalInc,
              fraud: last.fraud + fraudInc,
            };
          } else {
            buckets.shift();
            buckets.push({ minute: now, total: totalInc, fraud: fraudInc });
          }
          return { minuteBuckets: buckets };
        });
      },

      addTransaction: (txn) => {
        set((s) => {
          let txs = [txn, ...s.transactions].slice(0, MAX_TX);
          let alerts = s.alerts;
          const settings = s.simulatorSettings;
          const buckets = [...s.minuteBuckets];
          const lastB = buckets[buckets.length - 1]!;
          const now = Date.now();
          if (now - lastB.minute < 60000) {
            buckets[buckets.length - 1] = {
              ...lastB,
              total: lastB.total + 1,
              fraud: lastB.fraud,
            };
          } else {
            buckets.shift();
            buckets.push({ minute: now, total: 1, fraud: 0 });
          }
          if (
            txn.riskScore > 80 &&
            !alerts.some((a) => a.transactionId === txn.id)
          ) {
            const alert: FraudAlert = {
              id: `ALT-${txn.id}-${Date.now()}`,
              transactionId: txn.id,
              transaction: txn,
              alertType: alertTypeFromFlags(txn.flagReasons),
              severity: txn.riskLevel,
              timestamp: new Date(),
              isAcknowledged: false,
            };
            alerts = [alert, ...alerts].slice(0, 200);
          }
          if (
            settings.autoBlockCritical &&
            txn.riskLevel === "CRITICAL" &&
            txn.status === "FLAGGED"
          ) {
            txs = txs.map((t) =>
              t.id === txn.id ? { ...t, status: "BLOCKED" as const } : t
            );
          }
          const stats = computeStats(txs, alerts);
          return { transactions: txs, alerts, stats, minuteBuckets: buckets };
        });
      },

      addTransactionsBulk: (txns) => {
        txns.forEach((t) => get().addTransaction(t));
      },

      updateTransaction: (id, updates) => {
        set((s) => {
          const txs = s.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          );
          const stats = computeStats(txs, s.alerts);
          return { transactions: txs, stats };
        });
      },

      addAlert: (alert) => {
        set((s) => {
          const alerts = [alert, ...s.alerts].slice(0, 200);
          return { alerts, stats: computeStats(s.transactions, alerts) };
        });
      },

      acknowledgeAlert: (id, by) => {
        set((s) => {
          const alerts = s.alerts.map((a) =>
            a.id === id
              ? { ...a, isAcknowledged: true, acknowledgedBy: by ?? "admin" }
              : a
          );
          return { alerts, stats: computeStats(s.transactions, alerts) };
        });
      },

      acknowledgeAlerts: (ids, by) => {
        set((s) => {
          const setIds = new Set(ids);
          const alerts = s.alerts.map((a) =>
            setIds.has(a.id)
              ? { ...a, isAcknowledged: true, acknowledgedBy: by ?? "admin" }
              : a
          );
          return { alerts, stats: computeStats(s.transactions, alerts) };
        });
      },

      setSelectedTransaction: (txn) => set({ selectedTransaction: txn }),

      setSimulatorRunning: (running) => set({ isSimulatorRunning: running }),

      setSimulatorSpeed: (speed) => set({ simulatorSpeed: speed }),

      setFraudRateBias: (bias) => set({ fraudRateBias: bias }),

      setSimulatorSettings: (partial) =>
        set((s) => ({
          simulatorSettings: { ...s.simulatorSettings, ...partial },
        })),

      clearTransaction: (id) => {
        get().updateTransaction(id, { status: "CLEARED", riskLevel: "SAFE" });
      },

      blockTransaction: (id) => {
        get().updateTransaction(id, { status: "BLOCKED" });
      },

      applyAnalysis: (id, result) => {
        const status = mapRecommendationToStatus(
          result.recommendation,
          result.riskLevel
        );
        set((s) => {
          let txs = s.transactions.map((t) =>
            t.id === id
              ? {
                  ...t,
                  riskScore: result.riskScore,
                  riskLevel: result.riskLevel,
                  flagReasons: result.flagReasons,
                  aiExplanation: result.explanation,
                  status,
                  isAnalyzed: true,
                  aiConfidence: result.confidence,
                  detectedPatterns: result.detectedPatterns,
                  recommendation: result.recommendation,
                }
              : t
          );
          const txn = txs.find((t) => t.id === id);
          let alerts = s.alerts;
          if (
            txn &&
            result.riskScore > 80 &&
            !alerts.some((a) => a.transactionId === id)
          ) {
            alerts = [
              {
                id: `ALT-${id}-${Date.now()}`,
                transactionId: id,
                transaction: txn,
                alertType: alertTypeFromFlags(result.flagReasons),
                severity: result.riskLevel,
                timestamp: new Date(),
                isAcknowledged: false,
              },
              ...alerts,
            ].slice(0, 200);
          }
          if (
            s.simulatorSettings.autoBlockCritical &&
            result.riskLevel === "CRITICAL" &&
            (status === "FLAGGED" || result.recommendation === "BLOCK")
          ) {
            txs = txs.map((t) =>
              t.id === id ? { ...t, status: "BLOCKED" as const } : t
            );
          }
          const fraudInc =
            status === "FLAGGED" || status === "BLOCKED" ? 1 : 0;
          const buckets = [...s.minuteBuckets];
          const last = buckets[buckets.length - 1]!;
          const now = Date.now();
          if (fraudInc > 0) {
            if (now - last.minute < 60000) {
              buckets[buckets.length - 1] = {
                ...last,
                fraud: last.fraud + fraudInc,
              };
            } else {
              buckets.shift();
              buckets.push({ minute: now, total: 0, fraud: fraudInc });
            }
          }
          return {
            transactions: txs,
            alerts,
            stats: computeStats(txs, alerts),
            minuteBuckets: buckets,
          };
        });
      },

      getStats: () => computeStats(get().transactions, get().alerts),

      getTransactionsByUser: (userId) =>
        get()
          .transactions.filter((t) => t.userId === userId)
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ),

      getRecentAlerts: (limit) =>
        get()
          .alerts.filter((a) => !a.isAcknowledged)
          .slice(0, limit),
    }),
    {
      name: "fraudsense-sim",
      partialize: (s) => ({
        simulatorSpeed: s.simulatorSpeed,
        fraudRateBias: s.fraudRateBias,
        simulatorSettings: s.simulatorSettings,
      }),
    }
  )
);
