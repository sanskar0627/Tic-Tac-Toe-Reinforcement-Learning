"use client";

import { ArenaPanel } from "@/components/arena/ArenaPanel";
import { EpsilonChart } from "@/components/charts/EpsilonChart";
import { OutcomeChart } from "@/components/charts/OutcomeChart";
import { TrainPoster } from "@/components/TrainPoster";
import { StateLog } from "@/components/explorer/StateLog";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreatorBadges } from "@/components/ui/CreatorBadges";
import { useArena } from "@/hooks/useArena";
import { useSharedAgent } from "@/hooks/useSharedAgent";
import { useTrainingLoop } from "@/hooks/useTrainingLoop";
import { BRAND } from "@/lib/brand";
import { encodeState, prettyState } from "@/lib/game";
import { useCallback } from "react";
import type { TdLogEntry } from "@/lib/types";

export function Dashboard() {
  const { agentRef, metrics, setMetrics, logs, setLogs } = useSharedAgent();
  const training = useTrainingLoop(agentRef, setMetrics, setLogs);
  const onLearn = useCallback(
    (fresh: TdLogEntry[]) => {
      if (!fresh.length) return;
      setLogs((prev) => [...prev, ...fresh].slice(-120));
    },
    [setLogs],
  );
  const arena = useArena(agentRef, training.tick, onLearn);
  const snap = training.snapshot();
  const liveBoard = prettyState(encodeState(arena.board, arena.turn));

  const sidebar = (
    <Sidebar
      snap={snap}
      liveBoard={liveBoard}
      onStart={training.start}
      onPause={training.pause}
      onBurst={training.burst}
    />
  );

  return (
    <div className="mx-auto grid max-w-[1440px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="hidden lg:contents">{sidebar}</div>

      <div className="order-1 grid min-w-0 gap-4 lg:order-2">
        <header className="flex flex-col gap-3 rounded-plump border-4 border-ink bg-hotpink px-3 py-3 text-white shadow-plush sm:px-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/70 lg:tracking-[0.22em]">
              Shipping label · {BRAND.hash}
            </p>
            <p className="font-display text-[1.35rem] leading-[1.05] sm:text-3xl sm:leading-none">
              {BRAND.header}{" "}
              <span className="block lg:inline">{BRAND.hash}</span>
            </p>
          </div>
          <p className="max-w-sm font-sans text-[13px] font-medium leading-relaxed text-white/90">
            Green clay is a tap-in. Red clay is a lemon. If a win exists,
            TOEPUNK takes it. No excuses.
          </p>
        </header>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <ArenaPanel
            board={arena.board}
            human={arena.human}
            turn={arena.turn}
            winner={arena.winner}
            thinking={arena.thinking}
            heatmap={arena.heatmap}
            lastMove={arena.lastMove}
            line={arena.line}
            status={arena.status}
            rebootIn={arena.rebootIn}
            onPlay={arena.play}
            onReset={() => arena.reset()}
            onSwap={arena.swapSides}
          />
          <div className="contents xl:grid xl:gap-4">
            <div className="lg:hidden">{sidebar}</div>
            <OutcomeChart data={metrics} />
            <TrainPoster games={snap.epoch} />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <EpsilonChart data={metrics} />
          <StateLog logs={logs} />
        </div>

        <footer className="lg:hidden">
          <CreatorBadges />
        </footer>
      </div>
    </div>
  );
}
