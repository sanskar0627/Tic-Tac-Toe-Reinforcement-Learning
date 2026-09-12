"use client";

import { Brain, RefreshCw, Shuffle } from "lucide-react";
import { ClayButton } from "@/components/ui/ClayButton";
import { ClayCard, PanelLabel } from "@/components/ui/ClayCard";
import { Board } from "@/components/arena/Board";
import { playerLabel } from "@/lib/game";
import type { BoardState, Player, QSnapshot, Winner } from "@/lib/types";

interface ArenaPanelProps {
  board: BoardState;
  human: Player;
  turn: Player;
  winner: Winner;
  thinking: boolean;
  heatmap: QSnapshot | null;
  lastMove: number | null;
  line: number[] | null;
  status: string;
  rebootIn: number | null;
  onPlay: (index: number) => void;
  onReset: () => void;
  onSwap: () => void;
}

export function ArenaPanel({
  board,
  human,
  turn,
  winner,
  thinking,
  heatmap,
  lastMove,
  line,
  status,
  rebootIn,
  onPlay,
  onReset,
  onSwap,
}: ArenaPanelProps) {
  return (
    <ClayCard tone="white" className="relative">
      <div className="pointer-events-none absolute -right-4 -top-8 h-24 w-24 rotate-12 rounded-full bg-hotpink/20 lg:-right-8 lg:-top-10 lg:h-32 lg:w-32" />
      <PanelLabel
        kicker="The Pit"
        title="ARENA"
        extra={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="rounded-pill border-3 border-ink bg-lime px-2 py-1 font-mono text-[10px] uppercase tracking-wide shadow-stamp-sm sm:px-2.5 sm:tracking-wider">
              You {playerLabel(human)}
            </span>
            <span className="rounded-pill border-3 border-ink bg-cyan px-2 py-1 font-mono text-[10px] uppercase tracking-wide shadow-stamp-sm sm:px-2.5 sm:tracking-wider">
              {thinking ? "Q-scan" : `Turn ${playerLabel(turn)}`}
            </span>
          </div>
        }
      />

      <div className="relative">
        <Board
          board={board}
          heatmap={heatmap}
          thinking={thinking}
          lastMove={lastMove}
          line={line}
          winner={winner}
          disabled={thinking || turn !== human || winner !== null}
          onPlay={onPlay}
        />
        {winner !== null && (
          <div className="absolute inset-3 grid place-items-center rounded-clay bg-ink/55">
            <div className="rounded-clay border-4 border-ink bg-sun px-5 py-3 text-center shadow-plush">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
                {winner === 0 ? "Draw" : winner === human ? "You smash" : "TOEPUNK smash"}
              </p>
              <p className="font-display text-lg leading-none sm:text-2xl">
                NEXT PIT IN {rebootIn ?? 0}s
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 flex items-start gap-2 font-sans text-sm font-medium leading-6">
        <Brain className="mt-0.5 h-4 w-4 shrink-0" />
        {status}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <ClayButton tone="pink" size="sm" onClick={() => onReset()}>
          <RefreshCw className="h-3.5 w-3.5" />
          New match
        </ClayButton>
        <ClayButton tone="sun" size="sm" onClick={onSwap}>
          <Shuffle className="h-3.5 w-3.5" />
          Swap sides
        </ClayButton>
      </div>
    </ClayCard>
  );
}
