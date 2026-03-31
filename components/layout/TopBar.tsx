"use client";

import { motion } from "framer-motion";
import { Bell, Pause, Play } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const titles: Record<string, string> = {
  "/": "Mission Overview",
  "/transactions": "Live Transaction Feed",
  "/analytics": "Analytics",
  "/alerts": "Alerts",
  "/investigate": "AI Investigator",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const stats = useTransactionStore((s) => s.stats);
  const isRunning = useTransactionStore((s) => s.isSimulatorRunning);
  const setRunning = useTransactionStore((s) => s.setSimulatorRunning);
  const alertCount = useTransactionStore((s) =>
    s.alerts.filter((a) => !a.isAcknowledged).length
  );
  const analyzed = useAnimatedCounter(stats.totalTransactions);
  const title = titles[pathname] ?? "FraudSense AI";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-[var(--border)] bg-[rgba(8,12,20,0.8)] px-4 backdrop-blur-md">
      <div className="min-w-0">
        <h1 className="font-display text-lg font-bold truncate">{title}</h1>
        <p className="text-xs text-[var(--text-tertiary)] truncate">
          FraudSense / {pathname === "/" ? "overview" : pathname.slice(1)}
        </p>
      </div>

      <div className="hidden lg:flex items-center gap-4 flex-1 justify-center">
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            MONITORING ACTIVE
          </span>
        </div>
        <motion.p
          key={analyzed}
          initial={{ opacity: 0.5, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-[var(--text-secondary)]"
        >
          <span className="font-mono text-[var(--accent-cyan)] tabular-nums">
            {analyzed.toLocaleString()}
          </span>{" "}
          transactions analyzed
        </motion.p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link href="/alerts" aria-label="Alerts">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--accent-red)] px-1 text-[10px] font-bold text-white"
              >
                {alertCount > 99 ? "99+" : alertCount}
              </motion.span>
            )}
          </Button>
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-[var(--border)]"
          onClick={() => setRunning(!isRunning)}
          aria-pressed={!isRunning}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" /> PAUSE
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> RESUME
            </>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {session?.user?.name?.slice(0, 2).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{session?.user?.name}</span>
                <span className="text-xs font-normal text-[var(--text-tertiary)]">
                  {session?.user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
