"use client";

import { useRef, useState } from "react";
import { QAgent } from "@/lib/qAgent";
import type { EpochMetric, TdLogEntry } from "@/lib/types";

export function useSharedAgent() {
  const agentRef = useRef(new QAgent());
  const [metrics, setMetrics] = useState<EpochMetric[]>([]);
  const [logs, setLogs] = useState<TdLogEntry[]>([]);

  return { agentRef, metrics, setMetrics, logs, setLogs };
}
