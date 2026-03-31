"use client";

import { motion } from "framer-motion";
import { ShieldOff, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(true);
      return;
    }
    const cb = search.get("callbackUrl") ?? "/";
    router.push(cb);
    router.refresh();
  };

  const fill = (em: string) => {
    setEmail(em);
    setPassword("demo2024");
    setError(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080C14]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,212,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          animation: "grid-pan 20s linear infinite",
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border border-[var(--accent-cyan)]/20"
            style={{
              width: 200 + i * 180,
              height: 200 + i * 180,
              animation: `radar-ring ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          ...(error ? { x: [0, -6, 6, -6, 6, 0] } : {}),
        }}
        transition={{ duration: 0.45, ...(error ? { x: { duration: 0.4 } } : {}) }}
        className="relative z-10 w-full max-w-md mx-4 rounded-2xl p-12 glass-panel border border-[rgba(0,212,255,0.15)]"
        style={{
          background: "rgba(13, 20, 33, 0.8)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-3 mb-2 justify-center">
          <div className="relative">
            <ShieldOff className="h-10 w-10 text-[var(--accent-cyan)]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">
              FraudSense{" "}
              <span className="text-[var(--accent-cyan)]">AI</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Real-Time Fraud Intelligence Platform
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
              required
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
          {error && (
            <p className="text-sm text-[var(--accent-red)]" role="alert">
              Invalid credentials. Use demo accounts below.
            </p>
          )}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#00b8d9] to-[var(--accent-cyan)] text-[#080c14] font-semibold shadow-glow-cyan hover:brightness-110"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs border-[var(--border)]"
            onClick={() => fill("admin@fraudsense.ai")}
          >
            Quick: Admin
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs border-[var(--border)]"
            onClick={() => fill("analyst@fraudsense.ai")}
          >
            Quick: Analyst
          </Button>
        </div>
      </motion.div>

      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <p className="font-display text-[var(--accent-cyan)]">Entering mission control…</p>
        </div>
      )}
    </div>
  );
}
