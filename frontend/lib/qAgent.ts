import {
  applyMove,
  checkWinner,
  createsFork,
  emptyBoard,
  encodeState,
  isWinningMove,
  legalMoves,
  winningMoves,
} from "./game";
import type {
  BoardState,
  EpochMetric,
  Player,
  QSnapshot,
  TdLogEntry,
} from "./types";

const CORNERS = [0, 2, 6, 8];

function uid(): string {
  return Math.random().toString(36).slice(2, 8);
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function argMax(values: number[], legal: number[]): number {
  let best = legal[0]!;
  let score = -Infinity;
  const ties: number[] = [];
  for (const action of legal) {
    const q = values[action] ?? 0;
    if (q > score + 1e-9) {
      score = q;
      ties.length = 0;
      ties.push(action);
      best = action;
    } else if (Math.abs(q - score) <= 1e-9) {
      ties.push(action);
    }
  }
  return ties.length > 1 ? pickRandom(ties) : best;
}

/**
 * Seed unseen states with tactical priors so the heatmap is
 * readable before the table has been visited often.
 */
function heuristicQ(board: BoardState, player: Player): number[] {
  const q = new Array(9).fill(0);
  const legal = legalMoves(board);
  const opponent = (-player) as Player;
  for (const action of legal) {
    if (isWinningMove(board, player, action)) {
      q[action] = 0.96;
      continue;
    }
    if (isWinningMove(board, opponent, action)) {
      q[action] = 0.72;
      continue;
    }
    if (action === 4) q[action] = 0.38;
    else if (CORNERS.includes(action)) q[action] = 0.24;
    else q[action] = 0.1;
  }
  return q;
}

export class QAgent {
  readonly alpha: number;
  readonly gamma: number;
  epsilon: number;
  readonly epsilonMin: number;
  readonly epsilonDecay: number;
  table = new Map<string, number[]>();
  episodes = 0;
  private liveMemory = new Map<Player, { board: BoardState; action: number }>();

  constructor(opts?: {
    alpha?: number;
    gamma?: number;
    epsilon?: number;
    epsilonMin?: number;
    epsilonDecay?: number;
  }) {
    this.alpha = opts?.alpha ?? 0.35;
    this.gamma = opts?.gamma ?? 0.95;
    this.epsilon = opts?.epsilon ?? 0.85;
    this.epsilonMin = opts?.epsilonMin ?? 0.04;
    this.epsilonDecay = opts?.epsilonDecay ?? 0.9972;
  }

  getQ(board: BoardState, player: Player): number[] {
    const key = encodeState(board, player);
    let q = this.table.get(key);
    if (!q) {
      q = heuristicQ(board, player);
      this.table.set(key, q);
    }
    return q;
  }

  /**
   * Learned Q plus hard tactics. A terminal win always beats
   * every other score so noisy TD updates cannot skip a tap-in.
   */
  policyValues(board: BoardState, player: Player): number[] {
    const values = this.getQ(board, player).slice();
    const opponent = (-player) as Player;
    for (const action of legalMoves(board)) {
      if (isWinningMove(board, player, action)) values[action] = 10;
      else if (isWinningMove(board, opponent, action)) values[action] = 8;
      else if (createsFork(board, player, action)) {
        values[action] = Math.max(values[action] ?? 0, 0.92);
      }
    }
    return values;
  }

  snapshot(board: BoardState, player: Player): QSnapshot {
    return {
      values: this.policyValues(board, player),
      legal: legalMoves(board),
    };
  }

  choose(board: BoardState, player: Player, greedy = false): number {
    const legal = legalMoves(board);
    if (legal.length === 0) return 0;

    if (greedy) {
      const wins = winningMoves(board, player);
      if (wins.length) return wins[0]!;
      const blocks = winningMoves(board, (-player) as Player);
      if (blocks.length) return blocks[0]!;
      return argMax(this.policyValues(board, player), legal);
    }

    if (Math.random() < this.epsilon) return pickRandom(legal);
    return argMax(this.getQ(board, player), legal);
  }

  private update(
    board: BoardState,
    player: Player,
    action: number,
    reward: number,
    nextBoard: BoardState | null,
    nextPlayer: Player,
    done: boolean,
    note: string,
  ): TdLogEntry {
    const key = encodeState(board, player);
    const q = this.getQ(board, player);
    const qOld = q[action] ?? 0;
    let bootstrap = 0;
    if (!done && nextBoard) {
      const nextQ = this.getQ(nextBoard, nextPlayer);
      const nextLegal = legalMoves(nextBoard);
      bootstrap = nextLegal.length
        ? Math.max(...nextLegal.map((a) => nextQ[a] ?? 0))
        : 0;
    }
    const target = reward + this.gamma * bootstrap;
    const tdError = target - qOld;
    const qNew = qOld + this.alpha * tdError;
    q[action] = qNew;

    return {
      id: uid(),
      epoch: this.episodes,
      state: key,
      action,
      reward,
      qOld,
      qNew,
      tdError,
      epsilon: this.epsilon,
      note,
    };
  }

  trainEpisode(): TdLogEntry[] {
    let board = emptyBoard();
    let player: Player = 1;
    const memory = new Map<Player, { board: BoardState; action: number }>();
    const logs: TdLogEntry[] = [];

    while (true) {
      const prev = memory.get(player);
      if (prev) {
        logs.push(
          this.update(
            prev.board,
            player,
            prev.action,
            0,
            board,
            player,
            false,
            "mid-game bootstrap",
          ),
        );
      }

      const action = this.choose(board, player);
      const before = board;
      board = applyMove(board, action, player);
      memory.set(player, { board: before, action });

      const winner = checkWinner(board);
      if (winner !== null) {
        if (winner === 0) {
          for (const side of [1, -1] as Player[]) {
            const last = memory.get(side);
            if (!last) continue;
            logs.push(
              this.update(last.board, side, last.action, 0, null, side, true, "draw terminal"),
            );
          }
        } else {
          const loser = (-winner) as Player;
          const winLast = memory.get(winner);
          const loseLast = memory.get(loser);
          if (winLast) {
            logs.push(
              this.update(winLast.board, winner, winLast.action, 1, null, winner, true, "win terminal"),
            );
          }
          if (loseLast) {
            logs.push(
              this.update(loseLast.board, loser, loseLast.action, -1, null, loser, true, "loss terminal"),
            );
          }
        }
        break;
      }

      player = (-player) as Player;
    }

    this.episodes += 1;
    this.epsilon = Math.max(this.epsilonMin, this.epsilon * this.epsilonDecay);
    return logs;
  }

  rememberLiveMove(boardBefore: BoardState, player: Player, action: number): TdLogEntry[] {
    this.getQ(boardBefore, player);
    const logs: TdLogEntry[] = [];
    const prev = this.liveMemory.get(player);
    if (prev) {
      logs.push(
        this.update(
          prev.board,
          player,
          prev.action,
          0,
          boardBefore,
          player,
          false,
          "live bootstrap",
        ),
      );
    }
    this.liveMemory.set(player, { board: boardBefore, action });
    return logs;
  }

  settleLiveGame(winner: 1 | -1 | 0): TdLogEntry[] {
    const logs: TdLogEntry[] = [];
    if (winner === 0) {
      for (const side of [1, -1] as Player[]) {
        const last = this.liveMemory.get(side);
        if (!last) continue;
        logs.push(this.update(last.board, side, last.action, 0, null, side, true, "live draw"));
      }
    } else {
      const loser = (-winner) as Player;
      const winLast = this.liveMemory.get(winner);
      const loseLast = this.liveMemory.get(loser);
      if (winLast) {
        logs.push(this.update(winLast.board, winner, winLast.action, 1, null, winner, true, "live win"));
      }
      if (loseLast) {
        logs.push(this.update(loseLast.board, loser, loseLast.action, -1, null, loser, true, "live loss"));
      }
    }
    this.episodes += 1;
    this.liveMemory.clear();
    return logs;
  }

  abandonLiveGame() {
    this.liveMemory.clear();
  }

  evaluateVsRandom(games = 40): { winRate: number; lossRate: number; drawRate: number } {
    let wins = 0;
    let losses = 0;
    let draws = 0;

    for (let i = 0; i < games; i += 1) {
      const ai: Player = i < games / 2 ? 1 : -1;
      let board = emptyBoard();
      let player: Player = 1;

      while (true) {
        const action =
          player === ai
            ? this.choose(board, player, true)
            : pickRandom(legalMoves(board));
        board = applyMove(board, action, player);
        const winner = checkWinner(board);
        if (winner !== null) {
          if (winner === 0) draws += 1;
          else if (winner === ai) wins += 1;
          else losses += 1;
          break;
        }
        player = (-player) as Player;
      }
    }

    return {
      winRate: wins / games,
      lossRate: losses / games,
      drawRate: draws / games,
    };
  }

  warmStart(episodes = 900): { metrics: EpochMetric[]; logs: TdLogEntry[] } {
    const metrics: EpochMetric[] = [];
    const logs: TdLogEntry[] = [];
    let tdWindow: number[] = [];

    for (let i = 0; i < episodes; i += 1) {
      const episodeLogs = this.trainEpisode();
      const absTd = episodeLogs.reduce((s, e) => s + Math.abs(e.tdError), 0) / Math.max(episodeLogs.length, 1);
      tdWindow.push(absTd);

      if ((i + 1) % 75 === 0 || i === episodes - 1) {
        const evals = this.evaluateVsRandom(16);
        const avgTd = tdWindow.reduce((s, n) => s + n, 0) / tdWindow.length;
        metrics.push({
          epoch: this.episodes,
          ...evals,
          epsilon: this.epsilon,
          avgTd,
          qStates: this.table.size,
        });
        tdWindow = [];
        logs.push(...episodeLogs.slice(-2));
      }
    }

    return { metrics, logs: logs.slice(-80) };
  }
}
