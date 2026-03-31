"use client";

import {
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useAnimatedCounter(
  value: number,
  options?: { stiffness?: number; damping?: number }
) {
  const [display, setDisplay] = useState(0);
  const mv = useMotionValue(0);
  const springOpts = useMemo(
    () => ({
      stiffness: options?.stiffness ?? 120,
      damping: options?.damping ?? 20,
    }),
    [options?.stiffness, options?.damping]
  );
  const spring = useSpring(mv, springOpts);
  const round = useCallback((v: number) => Math.round(v), []);
  const rounded = useTransform(spring, round);

  useMotionValueEvent(rounded, "change", (v) => {
    setDisplay((prev) => (prev === v ? prev : v));
  });

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  return display;
}
