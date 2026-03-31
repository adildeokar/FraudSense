"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  defaultFilterState,
  FilterBar,
  type FilterState,
} from "@/components/transactions/FilterBar";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTransactionStore } from "@/store/useTransactionStore";
import type { Transaction } from "@/types";

type SortKey =
  | "timestamp"
  | "amount"
  | "riskScore"
  | "merchantName"
  | "status";

export default function TransactionsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const clearTransaction = useTransactionStore((s) => s.clearTransaction);
  const blockTransaction = useTransactionStore((s) => s.blockTransaction);
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [modal, setModal] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    let list = [...transactions];
    const q = debouncedSearch.toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.merchantName.toLowerCase().includes(q) ||
          t.userName.toLowerCase().includes(q)
      );
    }
    if (filters.status !== "ALL") {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters.category !== "ALL") {
      list = list.filter((t) => t.merchantCategory === filters.category);
    }
    list = list.filter(
      (t) =>
        t.riskScore >= filters.riskRange[0] &&
        t.riskScore <= filters.riskRange[1]
    );
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      list = list.filter((t) => new Date(t.timestamp).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime() + 86400000;
      list = list.filter((t) => new Date(t.timestamp).getTime() <= to);
    }
    if (filters.amountMin) {
      const m = parseFloat(filters.amountMin);
      if (!Number.isNaN(m)) list = list.filter((t) => t.amount >= m);
    }
    if (filters.amountMax) {
      const m = parseFloat(filters.amountMax);
      if (!Number.isNaN(m)) list = list.filter((t) => t.amount <= m);
    }
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "timestamp") {
        return (
          (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) *
          dir
        );
      }
      if (sortKey === "amount") return (a.amount - b.amount) * dir;
      if (sortKey === "riskScore") return (a.riskScore - b.riskScore) * dir;
      if (sortKey === "merchantName")
        return a.merchantName.localeCompare(b.merchantName) * dir;
      return a.status.localeCompare(b.status) * dir;
    });
    return list;
  }, [transactions, debouncedSearch, filters, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <FilterBar
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        value={filters}
        onChange={setFilters}
        filtered={filtered}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[var(--text-secondary)]">
          <Search className="h-16 w-16 mb-4 opacity-30" />
          <p className="font-display text-lg">No transactions found</p>
          <p className="text-sm">Adjust filters or wait for live feed.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("status")}
                >
                  Status
                </TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("timestamp")}
                >
                  Time
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("merchantName")}
                >
                  Merchant
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("amount")}
                >
                  Amount
                </TableHead>
                <TableHead>Country</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("riskScore")}
                >
                  Risk
                </TableHead>
                <TableHead>AI Conf.</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t, i) => (
                <TransactionRow
                  key={t.id}
                  txn={t}
                  index={i}
                  onView={setModal}
                  onClear={clearTransaction}
                  onBlock={blockTransaction}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TransactionModal
        transaction={modal}
        open={!!modal}
        onOpenChange={(o) => !o && setModal(null)}
      />
    </motion.div>
  );
}
