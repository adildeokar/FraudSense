import { NextResponse } from "next/server";
import { ruleBasedAnalysis } from "@/lib/fraud-scoring";
import { getOpenAI } from "@/lib/openai";
import type { AnalysisResult, Transaction } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 25;

function parseAnalysisJson(text: string): AnalysisResult | null {
  const trimmed = text.trim().replace(/^```json\s*|\s*```$/g, "");
  try {
    const o = JSON.parse(trimmed) as Record<string, unknown>;
    if (
      typeof o.riskScore !== "number" ||
      typeof o.riskLevel !== "string" ||
      !Array.isArray(o.flagReasons)
    ) {
      return null;
    }
    return {
      riskScore: Math.min(100, Math.max(0, o.riskScore)),
      riskLevel: o.riskLevel as AnalysisResult["riskLevel"],
      flagReasons: o.flagReasons as string[],
      explanation: String(o.explanation ?? ""),
      recommendation: o.recommendation as AnalysisResult["recommendation"],
      confidence: Math.min(100, Math.max(0, Number(o.confidence) || 0)),
      detectedPatterns: Array.isArray(o.detectedPatterns)
        ? (o.detectedPatterns as string[])
        : [],
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: { transaction?: Transaction };
  try {
    body = (await req.json()) as { transaction?: Transaction };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const txn = body.transaction;
  if (!txn || !txn.id) {
    return NextResponse.json({ error: "transaction required" }, { status: 400 });
  }

  const openai = getOpenAI();
  if (!openai) {
    const fallback = ruleBasedAnalysis(txn);
    return NextResponse.json(fallback);
  }

  const userPrompt = `Analyze this financial transaction for fraud:

Transaction ID: ${txn.id}
Amount: $${txn.amount} ${txn.currency}
Merchant: ${txn.merchantName} (${txn.merchantCategory})
Merchant Country: ${txn.merchantCountry}
User Location: ${txn.userLocation}
Time: ${txn.timestamp}
Is New Device: ${txn.isNewDevice}
VPN Detected: ${txn.isVPN}
Transactions in Last Hour (velocity): ${txn.velocityCount}
Pre-detected flags: ${txn.flagReasons.join(", ")}

Return ONLY this JSON (no markdown, no extra text):
{
  "riskScore": <0-100>,
  "riskLevel": <"CRITICAL"|"HIGH"|"MEDIUM"|"LOW"|"SAFE">,
  "flagReasons": [<array of string flag codes>],
  "explanation": <"2-3 sentence natural language explanation for analyst">,
  "recommendation": <"BLOCK"|"FLAG"|"REVIEW"|"CLEAR">,
  "confidence": <0-100>,
  "detectedPatterns": [<array of pattern names>]
}

Risk score guide:
- 81-100: CRITICAL (clearly fraudulent, block immediately)
- 61-80: HIGH (strong fraud indicators, flag for review)
- 41-60: MEDIUM (suspicious, monitor)
- 21-40: LOW (minor anomalies, clear with note)
- 0-20: SAFE (legitimate transaction)`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a fraud detection AI. Analyze transactions and return ONLY valid JSON. No explanation outside the JSON.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });
    const text = completion.choices[0]?.message?.content ?? "";
    const parsed = parseAnalysisJson(text);
    if (parsed) {
      return NextResponse.json(parsed);
    }
  } catch {
    /* fall through */
  }

  return NextResponse.json(ruleBasedAnalysis(txn));
}
