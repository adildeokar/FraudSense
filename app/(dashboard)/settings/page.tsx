"use client";

import { motion } from "framer-motion";
import {
  generateAccountTakeoverSequence,
  generateCardSkimmingBurst,
  generateFalsePositiveTravelScenario,
  generateFraudRingScenario,
  generateTransaction,
} from "@/lib/transaction-generator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactionStore } from "@/store/useTransactionStore";

export default function SettingsPage() {
  const speed = useTransactionStore((s) => s.simulatorSpeed);
  const setSpeed = useTransactionStore((s) => s.setSimulatorSpeed);
  const bias = useTransactionStore((s) => s.fraudRateBias);
  const setBias = useTransactionStore((s) => s.setFraudRateBias);
  const settings = useTransactionStore((s) => s.simulatorSettings);
  const setSettings = useTransactionStore((s) => s.setSimulatorSettings);
  const isRunning = useTransactionStore((s) => s.isSimulatorRunning);
  const setRunning = useTransactionStore((s) => s.setSimulatorRunning);
  const addTransaction = useTransactionStore((s) => s.addTransaction);

  const burst = () => {
    for (let i = 0; i < 10; i++) {
      const txs = useTransactionStore.getState().transactions;
      addTransaction(
        generateTransaction({
          fraudRateBias: bias,
          transactions: txs,
          patternVelocity: settings.patternVelocity,
          patternGeo: settings.patternGeo,
          patternAmount: settings.patternAmount,
          patternVpn: settings.patternVpn,
          patternNewDevice: settings.patternNewDevice,
          patternCardTesting: settings.patternCardTesting,
          amountMin: settings.amountMin,
          amountMax: settings.amountMax,
        })
      );
    }
  };

  const runScenario = (key: string) => {
    if (key === "skim") {
      generateCardSkimmingBurst({}).forEach((t) => addTransaction(t));
      return;
    }
    if (key === "ato") {
      const seq = generateAccountTakeoverSequence({});
      seq.forEach((t, i) => {
        setTimeout(() => addTransaction(t), i * 2000);
      });
      return;
    }
    if (key === "ring") {
      generateFraudRingScenario({}).forEach((t) => addTransaction(t));
      return;
    }
    if (key === "fp") {
      generateFalsePositiveTravelScenario().forEach((t, i) => {
        setTimeout(() => addTransaction(t), i * 400);
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl space-y-10"
    >
      <section className="space-y-6">
        <h2 className="font-display text-xl font-bold">Simulation controls</h2>
        <div>
          <Label>Transaction speed ({(speed / 1000).toFixed(1)}s between txns)</Label>
          <Slider
            className="mt-3"
            min={500}
            max={10000}
            step={100}
            value={[speed]}
            onValueChange={(v) => setSpeed(v[0] ?? 2500)}
          />
        </div>
        <div>
          <Label>Fraud rate bias ({bias}%)</Label>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            Higher = more fraud detected (dramatic demos).
          </p>
          <Slider
            min={0}
            max={80}
            step={1}
            value={[bias]}
            onValueChange={(v) => setBias(v[0] ?? 30)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Amount min ($)</Label>
            <Slider
              className="mt-3"
              min={1}
              max={500}
              step={1}
              value={[settings.amountMin]}
              onValueChange={(v) =>
                setSettings({ amountMin: v[0] ?? 5 })
              }
            />
          </div>
          <div>
            <Label>Amount max ($)</Label>
            <Slider
              className="mt-3"
              min={1000}
              max={25000}
              step={500}
              value={[settings.amountMax]}
              onValueChange={(v) =>
                setSettings({ amountMax: v[0] ?? 15000 })
              }
            />
          </div>
        </div>
        <div className="space-y-3">
          {(
            [
              ["patternVelocity", "Velocity attacks"],
              ["patternGeo", "Geographic anomalies"],
              ["patternAmount", "Amount spikes"],
              ["patternVpn", "VPN / proxy detection"],
              ["patternNewDevice", "New device detection"],
              ["patternCardTesting", "Card testing patterns"],
            ] as const
          ).map(([k, label]) => (
            <div key={k} className="flex items-center justify-between">
              <Label htmlFor={k}>{label}</Label>
              <Switch
                id={k}
                checked={settings[k]}
                onCheckedChange={(c) =>
                setSettings({
                  [k]: c,
                } as Parameters<typeof setSettings>[0])
              }
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            variant={isRunning ? "destructive" : "default"}
            onClick={() => setRunning(!isRunning)}
          >
            {isRunning ? "Pause simulator" : "Resume simulator"}
          </Button>
          <Button size="lg" variant="secondary" onClick={burst}>
            Generate burst (10)
          </Button>
        </div>
        <div>
          <Label>Trigger fraud scenario</Label>
          <Select onValueChange={runScenario}>
            <SelectTrigger className="mt-2 w-full max-w-md">
              <SelectValue placeholder="Choose scenario…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skim">Card skimming attack</SelectItem>
              <SelectItem value="ato">International account takeover</SelectItem>
              <SelectItem value="ring">Velocity fraud ring</SelectItem>
              <SelectItem value="fp">False positive calibration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <h2 className="font-display text-xl font-bold">Alert thresholds</h2>
        <div>
          <Label>Velocity alert (txns / hr): {settings.velocityThreshold}</Label>
          <Slider
            className="mt-3"
            min={2}
            max={20}
            step={1}
            value={[settings.velocityThreshold]}
            onValueChange={(v) =>
              setSettings({ velocityThreshold: v[0] ?? 5 })
            }
          />
        </div>
        <div>
          <Label>High amount alert: ${settings.highAmountThreshold}</Label>
          <Slider
            className="mt-3"
            min={1000}
            max={20000}
            step={500}
            value={[settings.highAmountThreshold]}
            onValueChange={(v) =>
              setSettings({ highAmountThreshold: v[0] ?? 5000 })
            }
          />
        </div>
        <div>
          <Label>Geo anomaly distance (km): {settings.geoAnomalyKm}</Label>
          <Slider
            className="mt-3"
            min={100}
            max={5000}
            step={100}
            value={[settings.geoAnomalyKm]}
            onValueChange={(v) =>
              setSettings({ geoAnomalyKm: v[0] ?? 500 })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="autoblock">Auto-block on CRITICAL</Label>
          <Switch
            id="autoblock"
            checked={settings.autoBlockCritical}
            onCheckedChange={(c) => setSettings({ autoBlockCritical: c })}
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">Display</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Dark mode is default for mission control. Animation:{" "}
          <span className="text-[var(--accent-cyan)]">{settings.animationSpeed}</span>
        </p>
        <div className="flex gap-2">
          {(["normal", "reduced", "none"] as const).map((sp) => (
            <Button
              key={sp}
              size="sm"
              variant={settings.animationSpeed === sp ? "default" : "outline"}
              onClick={() => setSettings({ animationSpeed: sp })}
            >
              {sp}
            </Button>
          ))}
        </div>
        <div className="flex items-center justify-between max-w-md">
          <Label htmlFor="sound">Notification sounds</Label>
          <Switch
            id="sound"
            checked={settings.soundEnabled}
            onCheckedChange={(c) => setSettings({ soundEnabled: c })}
          />
        </div>
      </section>
    </motion.div>
  );
}
