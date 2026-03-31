import type { AnalysisResult, RiskLevel, Transaction } from "@/types";

function levelFromScore(score: number): RiskLevel {
  if (score >= 81) return "CRITICAL";
  if (score >= 61) return "HIGH";
  if (score >= 41) return "MEDIUM";
  if (score >= 21) return "LOW";
  return "SAFE";
}

export function ruleBasedAnalysis(txn: Transaction): AnalysisResult {
  let score = 10;
  const flags = [...txn.flagReasons];
  if (flags.includes("GEO_ANOMALY")) score += 28;
  if (flags.includes("VELOCITY_EXCEEDED")) score += 22;
  if (flags.includes("CARD_TESTING_PATTERN")) score += 20;
  if (flags.includes("AMOUNT_3X_AVERAGE")) score += 18;
  if (flags.includes("VPN_DETECTED") || flags.includes("PROXY_IP")) score += 12;
  if (flags.includes("NEW_DEVICE")) score += 8;
  if (flags.includes("OFF_HOURS_ACTIVITY")) score += 6;
  if (flags.includes("PATTERN_MATCH")) score += 15;
  if (flags.includes("UNUSUAL_CATEGORY")) score += 6;
  if (flags.includes("CARD_TESTING_SUSPECTED")) score += 10;
  score += Math.min(25, txn.velocityCount * 2);
  if (txn.isVPN) score += 8;
  if (txn.isNewDevice) score += 5;
  if (txn.amount > 5000) score += 10;
  if (txn.amount > 10000) score += 8;
  score = Math.min(100, Math.max(0, score));
  const riskLevel = levelFromScore(score);
  let recommendation: AnalysisResult["recommendation"] = "CLEAR";
  if (riskLevel === "CRITICAL") recommendation = "BLOCK";
  else if (riskLevel === "HIGH") recommendation = "FLAG";
  else if (riskLevel === "MEDIUM") recommendation = "REVIEW";
  else recommendation = "CLEAR";
  return {
    riskScore: score,
    riskLevel,
    flagReasons: flags.length ? flags : ["NO_PATTERN"],
    explanation:
      flags.length > 0
        ? `Rule engine elevated risk based on: ${flags.join(", ")}. Velocity: ${txn.velocityCount}, VPN: ${txn.isVPN}, new device: ${txn.isNewDevice}.`
        : "Rule engine found no strong fraud indicators for this transaction profile.",
    recommendation,
    confidence: 55 + Math.min(30, flags.length * 5),
    detectedPatterns: flags,
  };
}
