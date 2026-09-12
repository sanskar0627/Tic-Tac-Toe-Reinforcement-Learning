"use client";

import { RefreshCw, Shuffle } from "lucide-react";
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
  rebootIn,
  onPlay,
  onReset,
  onSwap,
}: ArenaPanelProps) {
  return (
    <ClayCard tone="white" className="relative">
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rotate-12 rounded-full bg-hotpink/20 max-lg:-right-4 max-lg:-top-8 max-lg:h-24 max-lg:w-24" />
      <PanelLabel
        kicker="The Pit"
        title="ARENA"
        extra={
          <div className="flex items-center gap-2">
            <span className="rounded-pill border-3 border-ink bg-lime px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider shadow-stamp-sm">
              You {playerLabel(human)}
            </span>
            <span className="rounded-pill border-3 border-ink bg-cyan px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider shadow-stamp-sm">
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
              <p className="font-display text-2xl leading-none">
                NEXT PIT IN {rebootIn ?? 0}s
              </p>
            </div>
          </div>
        )}
      </div>

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
