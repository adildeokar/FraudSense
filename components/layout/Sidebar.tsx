"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Live Feed", icon: Activity },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/alerts", label: "Alerts", icon: Bell, badge: true },
  { href: "/investigate", label: "AI Investigator", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

const STORAGE_KEY = "fraudsense-sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const alertCount = useTransactionStore((s) =>
    s.alerts.filter((a) => !a.isAcknowledged).length
  );
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "1") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem(STORAGE_KEY, !c ? "1" : "0");
      return !c;
    });
  };

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        layout
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-[var(--border)] bg-[var(--surface)] shrink-0"
        )}
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <div className="flex h-16 items-center justify-between px-3 border-b border-[var(--border)]">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 px-1">
              <Shield className="h-7 w-7 text-[var(--accent-cyan)]" />
              <span className="font-display text-lg font-bold tracking-tight">
                FraudSense <span className="text-[var(--accent-cyan)]">AI</span>
              </span>
            </Link>
          )}
          {collapsed && (
            <Shield className="h-7 w-7 text-[var(--accent-cyan)] mx-auto" />
          )}
        </div>

        <div className="px-3 py-3">
          {!collapsed ? (
            <div className="flex items-center gap-2 rounded-md bg-[var(--surface-2)] px-2 py-1.5">
              <span
                className="relative flex h-2 w-2"
                aria-hidden
              >
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-[var(--accent-green)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-green)]" />
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-[var(--accent-green)]">
                SYSTEM ACTIVE
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-green)] animate-pulse-dot" />
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-2 py-2">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            const count = item.badge ? alertCount : 0;
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-150 ease-out",
                  active
                    ? "bg-[rgba(0,212,255,0.08)] text-[var(--accent-cyan)] shadow-[inset_3px_0_0_#00D4FF,var(--glow-cyan)]"
                    : "text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)]"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-[var(--accent-cyan)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && count > 0 && (
                      <span className="rounded-full bg-[var(--accent-red)] px-2 py-0.5 text-[10px] font-bold text-white">
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return link;
          })}
        </nav>

        <div className="mt-auto border-t border-[var(--border)] p-3 space-y-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-full"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
          {!collapsed ? (
            <div className="flex items-center gap-2 rounded-md px-2 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-cyan)]/20 text-xs font-bold text-[var(--accent-cyan)]">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {session?.user?.name}
                </p>
                <p className="truncate text-xs text-[var(--text-tertiary)]">
                  {(session?.user as { role?: string })?.role ?? "analyst"}
                </p>
              </div>
            </div>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[var(--text-secondary)]"
            onClick={() => void signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!collapsed && "Log out"}
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
