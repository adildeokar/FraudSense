import { Suspense } from "react";
import { InvestigateClient } from "./investigate-client";

export default function InvestigatePage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 animate-pulse rounded-xl bg-[var(--surface)] border border-[var(--border)]" />
      }
    >
      <InvestigateClient />
    </Suspense>
  );
}
