import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#080C14] text-[var(--accent-cyan)] font-display">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
