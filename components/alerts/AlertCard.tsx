"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FraudAlert } from "@/types";
import { cn } from "@/lib/utils";

function descriptionFor(a: FraudAlert): string {
  const t = a.transaction;
  switch (a.alertType) {
    case "VELOCITY":
      return `${t.userName} made ${t.velocityCount} transactions in the last hour — threshold exceeded (limit: 5/hr).`;
    case "GEO_ANOMALY":
      return `Transaction from ${t.merchantCountry} while user is registered in ${t.userLocation}.`;
    case "AMOUNT_SPIKE":
      return `Amount $${t.amount.toLocaleString()} is elevated versus typical profile.`;
    case "NEW_DEVICE":
      return `First-time device fingerprint observed for this account.`;
    case "VPN_DETECTED":
      return `Transaction originated from VPN/proxy IP ${t.ipAddress}.`;
    case "PATTERN_MATCH":
      return `Pattern matches elevated fraud signature — coordinated activity suspected.`;
    default:
      return "Review recommended based on composite risk signals.";
  }
}

interface AlertCardProps {
  alert: FraudAlert;
  selected?: boolean;
  onSelect?: (id: string, sel: boolean) => void;
  onAcknowledge: (id: string) => void;
  onBlockUser: (userId: string) => void;
}

export function AlertCard({
  alert,
  selected,
  onSelect,
  onAcknowledge,
  onBlockUser,
}: AlertCardProps) {
  const t = alert.transaction;
  const ack = alert.isAcknowledged;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 bg-[var(--surface-2)]/50",
        ack && "opacity-60",
        selected && "ring-2 ring-[var(--accent-cyan)]",
        alert.severity === "CRITICAL" && "border-l-4 border-l-[var(--accent-red)]",
        alert.severity === "HIGH" && "border-l-4 border-l-[var(--accent-amber)]"
      )}
    >
      {onSelect && (
        <label className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-2">
          <input
            type="checkbox"
            checked={!!selected}
            onChange={(e) => onSelect(alert.id, e.target.checked)}
            aria-label="Select alert"
          />
          Select
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="destructive">{alert.severity}</Badge>
        <span className="text-sm font-semibold">{alert.alertType}</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mt-2">
        {descriptionFor(alert)}
      </p>
      <p className="font-mono text-xs text-[var(--accent-cyan)] mt-2">
        {alert.transactionId}
      </p>
      <p className="text-xs text-[var(--text-tertiary)] mt-1">
        Affected amount:{" "}
        <strong>${t.amount.toLocaleString()}</strong> ·{" "}
        {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
      </p>
      {ack ? (
        <p className="text-xs text-[var(--text-tertiary)] mt-3">
          Acknowledged by {alert.acknowledgedBy} —{" "}
          {formatDistanceToNow(new Date(alert.timestamp), {
            addSuffix: true,
          })}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 mt-4">
          <Button size="sm" variant="secondary" onClick={() => onAcknowledge(alert.id)}>
            Acknowledge
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onBlockUser(t.userId)}
          >
            Block All from User
          </Button>
          <Link href={`/investigate?txn=${t.id}`}>
            <Button size="sm" variant="outline">
              Investigate →
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
