"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { useMemo } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import type { RiskLevel } from "@/types";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function dotColor(level: RiskLevel): string {
  if (level === "CRITICAL") return "#ef4444";
  if (level === "HIGH") return "#f97316";
  if (level === "MEDIUM") return "#f59e0b";
  return "#94a3b8";
}

export function FraudMap() {
  const transactions = useTransactionStore((s) => s.transactions);
  const points = useMemo(
    () =>
      transactions.filter(
        (t) => t.status === "FLAGGED" || t.status === "BLOCKED"
      ),
    [transactions]
  );

  const topCountries = useMemo(() => {
    const m = new Map<string, number>();
    points.forEach((t) => {
      m.set(t.merchantCountry, (m.get(t.merchantCountry) ?? 0) + 1);
    });
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [points]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="font-display text-lg font-bold mb-2">
        Global Fraud Incident Map — Real-Time
      </h2>
      <div className="flex flex-wrap gap-4 mb-2 text-xs text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">
          Fraud hotspots:
        </span>
        {topCountries.map(([c, n]) => (
          <span key={c}>
            {c}: <strong className="text-[var(--accent-cyan)]">{n}</strong>
          </span>
        ))}
      </div>
      <div className="w-full overflow-hidden rounded-lg bg-[var(--surface-2)]/30">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140, center: [0, 20] }}
          className="w-full h-auto max-h-[380px]"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1E2D45"
                  stroke="#0D1421"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#243552" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {points.map((t) => (
            <Marker key={t.id} coordinates={[t.lng, t.lat]}>
              <g>
                <circle
                  r={4}
                  fill={dotColor(t.riskLevel)}
                  className="drop-shadow-lg"
                />
                <circle
                  r={12}
                  fill="none"
                  stroke={dotColor(t.riskLevel)}
                  strokeWidth={1}
                  opacity={0.6}
                  className="animate-ping-fraud origin-center"
                  style={{ transformOrigin: "center" }}
                />
              </g>
            </Marker>
          ))}
        </ComposableMap>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[var(--accent-red)]" /> Critical
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-500" /> High
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[var(--accent-amber)]" /> Medium
        </span>
      </div>
    </div>
  );
}
