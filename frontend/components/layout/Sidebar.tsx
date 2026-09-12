"use client";

import { Pause, Play, Zap } from "lucide-react";
import { ClayButton } from "@/components/ui/ClayButton";
import { CreatorBadges } from "@/components/ui/CreatorBadges";
import { StatPill } from "@/components/ui/StatPill";
import { BRAND } from "@/lib/brand";
import type { TrainingSnapshot } from "@/lib/types";

export function Sidebar({
  snap,
  liveBoard,
  onStart,
  onPause,
  onBurst,
}: {
  snap: TrainingSnapshot;
  liveBoard: string;
  onStart: () => void;
  onPause: () => void;
  onBurst: () => void;
}) {
  return (
    <aside className="order-2 flex flex-col gap-3 rounded-plump border-4 border-ink bg-blush p-3 shadow-plush-lg sm:gap-4 sm:p-4 lg:order-1 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/60 lg:tracking-[0.22em]">
          {BRAND.kicker}
        </p>
        <h1 className="font-display text-[1.85rem] leading-none sm:text-[2.35rem]">
          {BRAND.name}
        </h1>
        <p className="mt-2 max-w-[18rem] font-sans text-sm font-medium leading-6 text-ink/80">
          {BRAND.blurb}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatPill label="Total games" value={snap.epoch.toLocaleString()} tone="sun" />
        <StatPill label="Epsilon" value={snap.epsilon.toFixed(3)} tone="cyan" />
        <StatPill label="Boards seen" value={String(snap.qStates)} tone="lime" />
        <StatPill label="|TD|" value={snap.lastAvgTd.toFixed(3)} tone="pink" />
      </div>
      <div className="rounded-clay border-4 border-ink bg-white px-3 py-2 shadow-plush-sm">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] opacity-60 lg:tracking-[0.18em]">
          This board
        </p>
        <p className="font-mono text-sm">{liveBoard}</p>
        <p className="mt-1 hidden font-sans text-[11px] leading-4 text-ink/65 sm:block">
          Boards seen only ticks up for a brand-new layout. Playing now also
          writes Q-updates into the same table.
        </p>
      </div>

      <div className="rounded-clay border-4 border-ink bg-white p-3 shadow-plush-sm">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-60 lg:tracking-[0.2em]">
          Hyperparams
        </p>
        <p className="mt-1 font-mono text-xs">
          α {snap.alpha.toFixed(2)} · γ {snap.gamma.toFixed(2)} · ε → 0.04
        </p>
        <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:flex-wrap">
          {snap.isTraining ? (
            <ClayButton tone="pink" size="sm" className="w-full lg:w-auto" onClick={onPause}>
              <Pause className="h-3.5 w-3.5" />
              Pause
            </ClayButton>
          ) : (
            <ClayButton tone="lime" size="sm" className="w-full lg:w-auto" onClick={onStart}>
              <Play className="h-3.5 w-3.5" />
              Train live
            </ClayButton>
          )}
          <ClayButton tone="cyan" size="sm" className="w-full lg:w-auto" onClick={onBurst}>
            <Zap className="h-3.5 w-3.5" />
            Burst
          </ClayButton>
        </div>
      </div>

      <div className="mt-auto hidden lg:block">
        <CreatorBadges />
      </div>
    </aside>
  );
}
