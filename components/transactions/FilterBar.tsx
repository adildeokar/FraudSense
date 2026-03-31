"use client";

import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Transaction, TransactionCategory, TransactionStatus } from "@/types";

const STATUSES: (TransactionStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "FLAGGED",
  "CLEARED",
  "BLOCKED",
  "REVIEWING",
];

const CATEGORIES: TransactionCategory[] = [
  "ONLINE_PURCHASE",
  "ATM_WITHDRAWAL",
  "WIRE_TRANSFER",
  "POINT_OF_SALE",
  "CRYPTO_EXCHANGE",
  "INTERNATIONAL",
  "BILL_PAYMENT",
  "PEER_TO_PEER",
];

export interface FilterState {
  search: string;
  status: TransactionStatus | "ALL";
  riskRange: [number, number];
  category: TransactionCategory | "ALL";
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

export const defaultFilterState: FilterState = {
  search: "",
  status: "ALL",
  riskRange: [0, 100],
  category: "ALL",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
};

interface FilterBarProps {
  searchInput: string;
  onSearchInputChange: (s: string) => void;
  value: FilterState;
  onChange: (f: FilterState) => void;
  filtered: Transaction[];
}

export function FilterBar({
  searchInput,
  onSearchInputChange,
  value,
  onChange,
  filtered,
}: FilterBarProps) {
  const exportCsv = () => {
    const headers = [
      "id",
      "timestamp",
      "amount",
      "merchant",
      "user",
      "status",
      "riskScore",
    ];
    const rows = filtered.map((t) =>
      [
        t.id,
        new Date(t.timestamp).toISOString(),
        t.amount,
        t.merchantName,
        t.userName,
        t.status,
        t.riskScore,
      ].join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fraudsense-export.csv";
    a.click();
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label>Search</Label>
          <Input
            className="mt-1"
            placeholder="ID, merchant, user…"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            aria-label="Search transactions"
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={value.status}
            onValueChange={(v) =>
              onChange({ ...value, status: v as FilterState["status"] })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Category</Label>
          <Select
            value={value.category}
            onValueChange={(v) =>
              onChange({ ...value, category: v as FilterState["category"] })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onSearchInputChange("");
              onChange({ ...defaultFilterState });
            }}
          >
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
          <Button onClick={exportCsv} className="flex-1">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>
      <div>
        <Label>
          Risk score {value.riskRange[0]} – {value.riskRange[1]}
        </Label>
        <Slider
          className="mt-3"
          min={0}
          max={100}
          step={1}
          value={value.riskRange}
          onValueChange={(v) =>
            onChange({
              ...value,
              riskRange: [v[0] ?? 0, v[1] ?? 100],
            })
          }
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label>From date</Label>
          <Input
            type="date"
            className="mt-1"
            value={value.dateFrom}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
          />
        </div>
        <div>
          <Label>To date</Label>
          <Input
            type="date"
            className="mt-1"
            value={value.dateTo}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
          />
        </div>
        <div>
          <Label>Min amount</Label>
          <Input
            type="number"
            className="mt-1"
            value={value.amountMin}
            onChange={(e) => onChange({ ...value, amountMin: e.target.value })}
          />
        </div>
        <div>
          <Label>Max amount</Label>
          <Input
            type="number"
            className="mt-1"
            value={value.amountMax}
            onChange={(e) => onChange({ ...value, amountMax: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
