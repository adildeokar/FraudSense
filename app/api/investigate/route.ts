import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import type { Transaction } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM =
  "You are FraudSense AI, an expert fraud investigation analyst with 15 years of experience in financial crime detection. Your role is to help the fraud analyst investigate transactions. Provide specific, data-driven insights. Reference actual numbers from the transaction. Be decisive in your recommendations. Format responses clearly with sections when appropriate. Never say you cannot access data — all data has been provided to you.";

export async function POST(req: Request) {
  let body: {
    transaction?: Transaction;
    messages?: { role: "user" | "assistant" | "system"; content: string }[];
    stream?: boolean;
    reportMode?: boolean;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const txn = body.transaction;
  const messages = body.messages ?? [];
  const openai = getOpenAI();

  const txnContext = txn
    ? `\n\nTransaction data (JSON):\n${JSON.stringify(txn, null, 2)}`
    : "";

  if (body.reportMode) {
    if (!openai) {
      return NextResponse.json({
        report:
          "# Investigation Report\n\nOpenAI not configured. Add OPENAI_API_KEY.",
      });
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM + txnContext },
        {
          role: "user",
          content:
            "Generate a complete fraud investigation report in markdown with sections: Executive Summary, Transaction Details, Risk Assessment, Fraud Indicators, User History Analysis, Recommendation, Confidence Level.",
        },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });
    const report = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ report });
  }

  if (!openai) {
    const offline =
      "OpenAI API key is not configured. Review the transaction JSON in the left panel and apply your institution's policy.";
    if (body.stream) {
      const encoder = new TextEncoder();
      return new Response(encoder.encode(offline), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return NextResponse.json({ message: offline });
  }

  if (body.stream) {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: SYSTEM + txnContext },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
      temperature: 0.4,
      max_tokens: 1500,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch {
          controller.enqueue(
            encoder.encode("Stream interrupted. Please retry.")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM + txnContext },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ],
    temperature: 0.4,
    max_tokens: 1500,
  });
  const text = completion.choices[0]?.message?.content ?? "";
  return NextResponse.json({ message: text });
}
