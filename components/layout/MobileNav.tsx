"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/transactions", icon: Activity, label: "Feed" },
  { href: "/analytics", icon: BarChart3, label: "Stats" },
  { href: "/alerts", icon: Bell, label: "Alerts" },
  { href: "/investigate", icon: Bot, label: "AI" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md safe-area-pb"
      aria-label="Mobile"
    >
      {items.map(({ href, icon: Icon, label }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
              active
                ? "text-[var(--accent-cyan)]"
                : "text-[var(--text-tertiary)]"
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
