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
    <aside className="flex flex-col gap-4 rounded-plump border-4 border-ink bg-blush p-4 shadow-plush-lg lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
          {BRAND.kicker}
        </p>
        <h1 className="font-display text-[2.35rem] leading-none">
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
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-60">
          This board
        </p>
        <p className="font-mono text-sm">{liveBoard}</p>
        <p className="mt-1 font-sans text-[11px] leading-4 text-ink/65">
          Boards seen only ticks up for a brand-new layout. Playing now also
          writes Q-updates into the same table.
        </p>
      </div>

      <div className="rounded-clay border-4 border-ink bg-white p-3 shadow-plush-sm">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          Hyperparams
        </p>
        <p className="mt-1 font-mono text-xs">
          α {snap.alpha.toFixed(2)} · γ {snap.gamma.toFixed(2)} · ε → 0.04
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {snap.isTraining ? (
            <ClayButton tone="pink" size="sm" onClick={onPause}>
              <Pause className="h-3.5 w-3.5" />
              Pause
            </ClayButton>
          ) : (
            <ClayButton tone="lime" size="sm" onClick={onStart}>
              <Play className="h-3.5 w-3.5" />
              Train live
            </ClayButton>
          )}
          <ClayButton tone="cyan" size="sm" onClick={onBurst}>
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
