"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import type { QAgent } from "@/lib/qAgent";
import type { EpochMetric, TdLogEntry, TrainingSnapshot } from "@/lib/types";

const BATCH = 12;
const SAMPLE_EVERY = 36;

export function useTrainingLoop(
  agentRef: MutableRefObject<QAgent>,
  setMetrics: Dispatch<SetStateAction<EpochMetric[]>>,
  setLogs: Dispatch<SetStateAction<TdLogEntry[]>>,
) {
  const [isTraining, setIsTraining] = useState(false);
  const [tick, setTick] = useState(0);
  const running = useRef(false);
  const tdAcc = useRef<number[]>([]);
  const sinceSample = useRef(0);
  const lastTd = useRef(0);

  const snapshot = useCallback((): TrainingSnapshot => {
    const agent = agentRef.current;
    const liveTd = tdAcc.current.length
      ? tdAcc.current.reduce((s, n) => s + n, 0) / tdAcc.current.length
      : lastTd.current;
    return {
      epoch: agent.episodes,
      epsilon: agent.epsilon,
      alpha: agent.alpha,
      gamma: agent.gamma,
      qStates: agent.table.size,
      lastAvgTd: liveTd,
      isTraining,
    };
  }, [agentRef, isTraining]);

  const flushSample = useCallback(() => {
    const agent = agentRef.current;
    const avgTd = tdAcc.current.length
      ? tdAcc.current.reduce((s, n) => s + n, 0) / tdAcc.current.length
      : 0;
    const evals = agent.evaluateVsRandom(24);
    setMetrics((prev) => {
      const next: EpochMetric = {
        epoch: agent.episodes,
        ...evals,
        epsilon: agent.epsilon,
        avgTd,
        qStates: agent.table.size,
      };
      return [...prev, next].slice(-48);
    });
    lastTd.current = avgTd;
    tdAcc.current = [];
    sinceSample.current = 0;
  }, [agentRef, setMetrics]);

  const stepBatch = useCallback(() => {
    const agent = agentRef.current;
    const freshLogs: TdLogEntry[] = [];

    for (let i = 0; i < BATCH; i += 1) {
      const episodeLogs = agent.trainEpisode();
      const absTd =
        episodeLogs.reduce((s, e) => s + Math.abs(e.tdError), 0) /
        Math.max(episodeLogs.length, 1);
      tdAcc.current.push(absTd);
      sinceSample.current += 1;
      const punchy = episodeLogs.filter((e) => Math.abs(e.tdError) > 0.18);
      freshLogs.push(...(punchy.length ? punchy.slice(-1) : episodeLogs.slice(-1)));
    }

    setLogs((prev) => [...prev, ...freshLogs].slice(-120));
    if (sinceSample.current >= SAMPLE_EVERY) flushSample();
    setTick((n) => n + 1);
  }, [agentRef, flushSample, setLogs]);

  useEffect(() => {
    if (!isTraining) {
      running.current = false;
      return;
    }
    running.current = true;
    let frame = 0;
    const loop = () => {
      if (!running.current) return;
      stepBatch();
      frame = window.setTimeout(loop, 90);
    };
    frame = window.setTimeout(loop, 40);
    return () => {
      running.current = false;
      window.clearTimeout(frame);
    };
  }, [isTraining, stepBatch]);

  const start = useCallback(() => setIsTraining(true), []);
  const pause = useCallback(() => {
    setIsTraining(false);
    if (sinceSample.current > 0) flushSample();
  }, [flushSample]);

  const burst = useCallback(() => {
    for (let i = 0; i < 8; i += 1) stepBatch();
    flushSample();
  }, [flushSample, stepBatch]);

  return { isTraining, start, pause, burst, snapshot, tick };
}
