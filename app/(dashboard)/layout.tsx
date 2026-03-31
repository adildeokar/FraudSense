import { DashboardEffects } from "@/components/layout/DashboardEffects";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <DashboardEffects />
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 pb-16 md:pb-0">
        <TopBar />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
