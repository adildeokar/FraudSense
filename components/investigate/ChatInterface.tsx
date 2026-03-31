"use client";

import { motion } from "framer-motion";
import { FileDown, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "@/components/investigate/MessageBubble";
import type { Transaction } from "@/types";

const SUGGESTED = [
  "Why is the risk score so high?",
  "Show me this user's transaction history",
  "What fraud pattern does this match?",
  "Should I block this transaction?",
  "Explain the velocity anomaly",
  "What's the recommended action?",
  "How confident is the AI in this assessment?",
];

interface ChatInterfaceProps {
  transaction: Transaction | null;
}

export function ChatInterface({ transaction }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    if (!transaction) {
      setMessages([]);
      return;
    }
    const lines = transaction.flagReasons.slice(0, 6).map(
      (r, i) => `${i + 1}. ${r.replace(/_/g, " ")}`
    );
    const text = `I've analyzed transaction **${transaction.id}**. Here's my initial assessment:

**Risk Score:** ${transaction.riskScore}/100 — **${transaction.riskLevel}**

This transaction exhibits the following indicators:
${lines.length ? lines.join("\n") : "• No hard-coded flags; profile appears nominal."}

**Merchant:** ${transaction.merchantName} (${transaction.merchantCountry})
**Amount:** $${transaction.amount.toLocaleString()}

What would you like to investigate further?`;
    setMessages([{ role: "assistant", content: text }]);
  }, [transaction?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- seed per transaction id

  const send = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const userMsg = text.trim();
      setInput("");
      setMessages((m) => [...m, { role: "user", content: userMsg }]);
      setLoading(true);
      setStreaming("");
      try {
        const history = [
          ...messagesRef.current,
          { role: "user" as const, content: userMsg },
        ];
        const res = await fetch("/api/investigate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction: transaction ?? undefined,
            messages: history.map((h) => ({
              role: h.role,
              content: h.content,
            })),
            stream: true,
          }),
        });
        if (!res.ok || !res.body) {
          const j = await res.json().catch(() => ({}));
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content:
                (j as { message?: string }).message ??
                "Request failed. Check API configuration.",
            },
          ]);
          return;
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          setStreaming(acc);
        }
        setMessages((m) => [...m, { role: "assistant", content: acc }]);
        setStreaming("");
      } catch {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: "Network error. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [transaction]
  );

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction,
          reportMode: true,
        }),
      });
      const j = (await res.json()) as { report?: string };
      const report = j.report ?? "";
      const blob = new Blob([report], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `fraud-report-${transaction?.id ?? "summary"}.txt`;
      a.click();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[480px] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between gap-2 p-3 border-b border-[var(--border)]">
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-[var(--text-secondary)]">
          Investigation chat
        </h2>
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={generateReport}
          disabled={loading || !transaction}
        >
          <FileDown className="h-4 w-4" />
          Generate Full Report
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streaming && (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
            Load a transaction and ask questions, or use suggested prompts below.
          </p>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} />
        ))}
        {streaming && (
          <MessageBubble role="assistant" content={streaming + "▍"} />
        )}
        {loading && !streaming && (
          <div className="flex gap-1 px-4">
            <span className="typing-dot h-2 w-2 rounded-full bg-[var(--accent-cyan)]" />
            <span className="typing-dot h-2 w-2 rounded-full bg-[var(--accent-cyan)]" />
            <span className="typing-dot h-2 w-2 rounded-full bg-[var(--accent-cyan)]" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {transaction && messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <motion.button
              key={s}
              type="button"
              whileHover={{ scale: 1.02 }}
              className="text-xs rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-secondary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]"
              onClick={() => send(s)}
            >
              {s}
            </motion.button>
          ))}
        </div>
      )}
      <form
        className="p-3 border-t border-[var(--border)] flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask FraudSense AI…"
          className="flex-1"
          disabled={loading}
          aria-label="Chat input"
        />
        <Button type="submit" disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
