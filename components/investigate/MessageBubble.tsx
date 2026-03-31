"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

function formatContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const bolded = line.replace(
      /\*\*(.+?)\*\*/g,
      "<strong>$1</strong>"
    );
    return (
      <p
        key={i}
        className="mb-1 last:mb-0"
        dangerouslySetInnerHTML={{ __html: bolded }}
      />
    );
  });
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex gap-3 max-w-[95%]",
        isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]">
          <Shield className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-sm prose prose-invert max-w-none",
          isUser
            ? "bg-[var(--accent-cyan)]/25 text-[var(--text-primary)] border border-[var(--accent-cyan)]/30"
            : "bg-[var(--surface-2)] border-l-2 border-[var(--accent-cyan)] text-[var(--text-secondary)]"
        )}
      >
        {formatContent(content)}
      </div>
    </div>
  );
}
