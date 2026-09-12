"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import {
  applyMove,
  checkWinner,
  emptyBoard,
  legalMoves,
  winningLine,
} from "@/lib/game";
import type { QAgent } from "@/lib/qAgent";
import type { BoardState, Player, QSnapshot, TdLogEntry, Winner } from "@/lib/types";

const THINK_MS = 900;
const REBOOT_MS = 2000;

export function useArena(
  agentRef: MutableRefObject<QAgent>,
  agentVersion: number,
  onLearn?: (logs: TdLogEntry[]) => void,
) {
  const [board, setBoard] = useState<BoardState>(emptyBoard);
  const [human, setHuman] = useState<Player>(1);
  const [turn, setTurn] = useState<Player>(1);
  const [winner, setWinner] = useState<Winner>(null);
  const [thinking, setThinking] = useState(false);
  const [heatmap, setHeatmap] = useState<QSnapshot | null>(null);
  const [lastMove, setLastMove] = useState<number | null>(null);
  const [status, setStatus] = useState("Your move. Stamp a clay tile.");
  const [rebootIn, setRebootIn] = useState<number | null>(null);
  const lock = useRef(false);
  const humanRef = useRef(human);
  humanRef.current = human;

  const ai = (-human) as Player;
  const line = winner === 1 || winner === -1 ? winningLine(board) : null;

  const reset = useCallback((nextHuman?: Player) => {
    const side = nextHuman ?? humanRef.current;
    agentRef.current.abandonLiveGame();
    lock.current = false;
    setHuman(side);
    setBoard(emptyBoard());
    setTurn(1);
    setWinner(null);
    setThinking(false);
    setHeatmap(null);
    setLastMove(null);
    setRebootIn(null);
    setStatus(side === 1 ? "You open as X. Claim a cell." : "TOEPUNK opens as X. Watch the Q-field.");
  }, [agentRef]);

  const commit = useCallback(
    (current: BoardState, who: Player, action: number) => {
      const learned = agentRef.current.rememberLiveMove(current, who, action);
      const next = applyMove(current, action, who);
      const result = checkWinner(next);
      if (result !== null) {
        learned.push(...agentRef.current.settleLiveGame(result));
      }
      if (learned.length) onLearn?.(learned);
      setBoard(next);
      setLastMove(action);
      if (result !== null) {
        setWinner(result);
        setThinking(false);
        setHeatmap(null);
        lock.current = false;
        if (result === 0) setStatus("Draw. Clay dust everywhere.");
        else if (result === humanRef.current) setStatus("You cracked TOEPUNK. Reloading the pit…");
        else setStatus("TOEPUNK converted the tap-in. Reloading the pit…");
        return true;
      }
      setTurn((-who) as Player);
      return false;
    },
    [agentRef, onLearn],
  );

  const agentTurn = useCallback(
    (current: BoardState) => {
      lock.current = true;
      setThinking(true);
      setStatus("TOEPUNK scanning Q(s, a)…");
      const snap = agentRef.current.snapshot(current, ai);
      setHeatmap(snap);

      window.setTimeout(() => {
        const action = agentRef.current.choose(current, ai, true);
        const ended = commit(current, ai, action);
        if (!ended) {
          setThinking(false);
          setStatus("Your turn. Last Q-field stays painted.");
          lock.current = false;
        }
      }, THINK_MS);
    },
    [agentRef, ai, commit],
  );

  useEffect(() => {
    if (winner !== null || thinking) return;
    if (turn === ai && !lock.current) {
      agentTurn(board);
    }
  }, [ai, agentTurn, board, thinking, turn, winner, agentVersion]);

  useEffect(() => {
    if (winner === null) return;
    setRebootIn(2);
    const tick = window.setInterval(() => {
      setRebootIn((n) => (n === null ? null : Math.max(0, n - 1)));
    }, 1000);
    const reboot = window.setTimeout(() => reset(), REBOOT_MS);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(reboot);
    };
  }, [winner, reset]);

  const play = useCallback(
    (action: number) => {
      if (winner !== null || thinking || turn !== human || lock.current) return;
      if (!legalMoves(board).includes(action)) return;
      setHeatmap(null);
      const ended = commit(board, human, action);
      if (!ended) {
        setStatus("Tile locked. Passing the state.");
      }
    },
    [board, commit, human, thinking, turn, winner],
  );

  const swapSides = useCallback(() => {
    reset((-human) as Player);
  }, [human, reset]);

  return {
    board,
    human,
    ai,
    turn,
    winner,
    thinking,
    heatmap,
    lastMove,
    line,
    status,
    rebootIn,
    play,
    reset,
    swapSides,
  };
}
