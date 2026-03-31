"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { AlertCard } from "@/components/alerts/AlertCard";
import type { FraudAlert } from "@/types";

interface AlertTimelineProps {
  alerts: FraudAlert[];
  selected: Set<string>;
  onSelect: (id: string, sel: boolean) => void;
  onAcknowledge: (id: string) => void;
  onBlockUser: (userId: string) => void;
}

export function AlertTimeline({
  alerts,
  selected,
  onSelect,
  onAcknowledge,
  onBlockUser,
}: AlertTimelineProps) {
  return (
    <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[var(--border)]">
      {alerts.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="relative"
        >
          <span
            className="absolute -left-[22px] top-3 h-3 w-3 rounded-full border-2 border-[var(--background)]"
            style={{
              background:
                a.severity === "CRITICAL"
                  ? "#ef4444"
                  : a.severity === "HIGH"
                    ? "#f97316"
                    : "#f59e0b",
            }}
          />
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
            {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
          </p>
          <AlertCard
            alert={a}
            selected={selected.has(a.id)}
            onSelect={onSelect}
            onAcknowledge={onAcknowledge}
            onBlockUser={onBlockUser}
          />
        </motion.div>
      ))}
    </div>
  );
}
