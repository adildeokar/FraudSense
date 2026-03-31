"use client";

import {
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const defaultFormat = (n: number) => n.toLocaleString();

interface MetricCounterProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
}

export function MetricCounter({
  value,
  format,
  className,
}: MetricCounterProps) {
  const formatRef = useRef(format ?? defaultFormat);
  formatRef.current = format ?? defaultFormat;

  const [text, setText] = useState(() => formatRef.current(0));
  const mv = useMotionValue(0);
  const springOpts = useMemo(
    () => ({ stiffness: 120, damping: 22 }),
    []
  );
  const spring = useSpring(mv, springOpts);
  const toText = useCallback(
    (v: number) => formatRef.current(Math.round(v)),
    []
  );
  const rounded = useTransform(spring, toText);

  useMotionValueEvent(rounded, "change", (v) => {
    setText((prev) => (prev === v ? prev : v));
  });

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  return <span className={className}>{text}</span>;
}
