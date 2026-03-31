"use client";

import { memo } from "react";
import { Bot, Check, Eye, X } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Transaction } from "@/types";
import { cn } from "@/lib/utils";

interface TransactionRowProps {
  txn: Transaction;
  index: number;
  onView: (t: Transaction) => void;
  onClear: (id: string) => void;
  onBlock: (id: string) => void;
}

function riskClass(score: number) {
  if (score <= 30) return "bg-emerald-500/20 text-emerald-400";
  if (score <= 60) return "bg-amber-500/20 text-amber-400";
  if (score <= 80) return "bg-orange-500/20 text-orange-400";
  return "bg-red-500/20 text-red-400";
}

export const TransactionRow = memo(function TransactionRow({
  txn,
  index,
  onView,
  onClear,
  onBlock,
}: TransactionRowProps) {
  const conf = txn.aiConfidence ?? 0;
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => onView(txn)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onView(txn);
      }}
      tabIndex={0}
      role="button"
      aria-label={`Transaction ${txn.id}`}
    >
      <TableCell className="font-mono text-[var(--text-tertiary)]">
        {index + 1}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{txn.status}</Badge>
      </TableCell>
      <TableCell className="font-mono text-[var(--accent-cyan)]">{txn.id}</TableCell>
      <TableCell className="whitespace-nowrap text-xs">
        {format(new Date(txn.timestamp), "MMM d HH:mm")}
      </TableCell>
      <TableCell>{txn.userName}</TableCell>
      <TableCell className="max-w-[140px] truncate">{txn.merchantName}</TableCell>
      <TableCell className="text-xs">{txn.merchantCategory}</TableCell>
      <TableCell className="font-mono font-semibold">
        ${txn.amount.toLocaleString()}
      </TableCell>
      <TableCell>{txn.merchantCountry}</TableCell>
      <TableCell>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
            riskClass(txn.riskScore)
          )}
        >
          {txn.riskScore}
        </span>
      </TableCell>
      <TableCell className="w-28">
        <Progress value={conf} className="h-1.5" />
        <span className="text-[10px] text-[var(--text-tertiary)]">{conf}%</span>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label="View details"
            onClick={() => onView(txn)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link href={`/investigate?txn=${txn.id}`}>
            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="AI investigate">
              <Bot className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-[var(--accent-green)]"
            aria-label="Clear"
            onClick={() => onClear(txn.id)}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-[var(--accent-red)]"
            aria-label="Block"
            onClick={() => onBlock(txn.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
