import {
  deriveRiskLevel,
  generateTransaction,
  type GeneratorContext,
} from "@/lib/transaction-generator";
import type { Transaction } from "@/types";

function buildCtx(seed: number): GeneratorContext {
  return {
    fraudRateBias: 35,
    transactions: [],
    patternVelocity: true,
    patternGeo: true,
    patternAmount: true,
    patternVpn: true,
    patternNewDevice: true,
    patternCardTesting: true,
    amountMin: 5,
    amountMax: 15000,
  };
}

/** Deterministic PRNG for reproducible seed data */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeedTransactions(count = 50): Transaction[] {
  const rng = mulberry32(42);
  const originalRandom = Math.random;
  Math.random = rng as () => number;
  const list: Transaction[] = [];
  const ctx = buildCtx(42);
  try {
    for (let i = 0; i < count; i++) {
      ctx.transactions = [...list];
      const t = generateTransaction(ctx);
      const analyzed = i % 3 !== 0;
      if (analyzed) {
        const score =
          t.flagReasons.length > 0
            ? Math.min(99, 40 + t.flagReasons.length * 15)
            : Math.max(5, 15 + (i % 20));
        const level = deriveRiskLevel(score);
        const flagged = level === "CRITICAL" || level === "HIGH";
        list.push({
          ...t,
          timestamp: new Date(Date.now() - (count - i) * 120000),
          riskScore: score,
          riskLevel: level,
          status: flagged ? "FLAGGED" : "CLEARED",
          isAnalyzed: true,
          aiExplanation:
            flagged
              ? "Multiple fraud indicators correlate with elevated risk for this transaction profile."
              : "Transaction aligns with established user behavior and merchant category norms.",
          aiConfidence: 72 + (i % 25),
          detectedPatterns: t.flagReasons.slice(0, 3),
          recommendation: flagged ? "FLAG" : "CLEAR",
        });
      } else {
        list.push(t);
      }
    }
  } finally {
    Math.random = originalRandom;
  }
  return list;
}

export const seedTransactions: Transaction[] = createSeedTransactions(50);
