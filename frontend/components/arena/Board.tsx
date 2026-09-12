"use client";

import { motion } from "framer-motion";
import { qToHeat } from "@/lib/heatmap";
import { symbolFor } from "@/lib/game";
import { cn } from "@/lib/cn";
import type { BoardState, QSnapshot, Winner } from "@/lib/types";

interface BoardProps {
  board: BoardState;
  heatmap: QSnapshot | null;
  thinking: boolean;
  lastMove: number | null;
  line: number[] | null;
  winner: Winner;
  disabled: boolean;
  onPlay: (index: number) => void;
}

export function Board({
  board,
  heatmap,
  thinking,
  lastMove,
  line,
  winner,
  disabled,
  onPlay,
}: BoardProps) {
  const legalQs = heatmap
    ? heatmap.legal.map((i) => heatmap.values[i] ?? 0)
    : [];
  const min = legalQs.length ? Math.min(...legalQs) : 0;
  const max = legalQs.length ? Math.max(...legalQs) : 1;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.055 } },
      }}
      className="grid grid-cols-3 gap-3 rounded-plump border-4 border-ink bg-clay-ice p-3 shadow-clay-deep"
    >
      {board.map((cell, index) => {
        const mark = symbolFor(cell);
        const isLegal = cell === 0;
        const q = heatmap && isLegal ? heatmap.values[index] : null;
        const heat = q !== null ? qToHeat(q, min, max) : null;
        const isWin = line?.includes(index) ?? false;
        const isLast = lastMove === index;

        return (
          <motion.button
            key={index}
            variants={{
              hidden: { scale: 0.4, rotate: -10, opacity: 0 },
              show: { scale: 1, rotate: 0, opacity: 1 },
            }}
            whileHover={
              isLegal && !disabled
                ? { scale: 1.05, rotate: -1.5 }
                : undefined
            }
            whileTap={
              isLegal && !disabled ? { x: 5, y: 5, scale: 0.98 } : undefined
            }
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            onClick={() => onPlay(index)}
            disabled={!isLegal || disabled || winner !== null}
            className={cn(
              "relative aspect-square min-h-[72px] overflow-hidden rounded-plump border-4 border-ink shadow-plush",
              "disabled:cursor-default",
              !heat && (index % 2 === 0 ? "bg-white" : "bg-clay-sand"),
              thinking && isLegal && "animate-pulse-ring",
              isWin && "bg-lime",
            )}
            style={
              heat && !isWin
                ? { backgroundColor: heat.fill }
                : undefined
            }
          >
            <span className="absolute left-2 top-1 font-mono text-[10px] text-ink/40">
              {index}
            </span>
            {q !== null && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-2 left-0 right-0 text-center font-mono text-[10px] font-semibold text-ink/80"
              >
                Q {q.toFixed(2)}
              </motion.span>
            )}
            <span
              className={cn(
                "font-display text-5xl leading-none tracking-normal sm:text-6xl",
                mark === "X" && "text-hotpink",
                mark === "O" && "text-[#00A8C4]",
                isLast && "drop-shadow-ink",
              )}
            >
              {mark}
            </span>
            {isLegal && !heat && (
              <span className="pointer-events-none absolute inset-0 shadow-clay" />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
