import { NextResponse } from "next/server";
import { ruleBasedAnalysis } from "@/lib/fraud-scoring";
import { getOpenAI } from "@/lib/openai";
import type { AnalysisResult, Transaction } from "@/types";

export const runtime = "nodejs";

async function analyzeOne(txn: Transaction): Promise<AnalysisResult> {
  const openai = getOpenAI();
  if (!openai) return ruleBasedAnalysis(txn);

  const userPrompt = `Analyze transaction ${txn.id}: $${txn.amount} at ${txn.merchantName}, country ${txn.merchantCountry}, user ${txn.userLocation}, velocity ${txn.velocityCount}, flags: ${txn.flagReasons.join(", ")}. Return ONLY compact JSON with keys riskScore,riskLevel,flagReasons,explanation,recommendation,confidence,detectedPatterns.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Return ONLY valid JSON for fraud analysis. No markdown.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 400,
    });
    const text = completion.choices[0]?.message?.content ?? "";
    const trimmed = text.trim().replace(/^```json\s*|\s*```$/g, "");
    const o = JSON.parse(trimmed) as AnalysisResult;
    if (typeof o.riskScore === "number") return o;
  } catch {
    /* fallback */
  }
  return ruleBasedAnalysis(txn);
}

export async function POST(req: Request) {
  let body: { transactions?: Transaction[] };
  try {
    body = (await req.json()) as { transactions?: Transaction[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const list = body.transactions;
  if (!Array.isArray(list) || list.length === 0) {
    return NextResponse.json({ error: "transactions array required" }, { status: 400 });
  }
  const slice = list.slice(0, 20);
  const results: { id: string; result: AnalysisResult }[] = [];
  for (const txn of slice) {
    const result = await analyzeOne(txn);
    results.push({ id: txn.id, result });
  }
  return NextResponse.json({ results });
}
