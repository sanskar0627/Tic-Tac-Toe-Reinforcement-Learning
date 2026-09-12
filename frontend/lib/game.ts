import type { BoardState, CellValue, Player, Winner } from "./types";

export const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function emptyBoard(): BoardState {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

export function cloneBoard(board: BoardState): BoardState {
  return board.slice() as BoardState;
}

export function legalMoves(board: BoardState): number[] {
  const moves: number[] = [];
  for (let i = 0; i < 9; i += 1) {
    if (board[i] === 0) moves.push(i);
  }
  return moves;
}

export function applyMove(board: BoardState, action: number, player: Player): BoardState {
  const next = cloneBoard(board);
  next[action] = player;
  return next;
}

export function checkWinner(board: BoardState): Winner {
  for (const [a, b, c] of WIN_LINES) {
    const total = (board[a] as number) + (board[b] as number) + (board[c] as number);
    if (total === 3) return 1;
    if (total === -3) return -1;
  }
  if (legalMoves(board).length === 0) return 0;
  return null;
}

export function winningLine(board: BoardState): number[] | null {
  for (const line of WIN_LINES) {
    const total = line.reduce((sum, i) => sum + (board[i] as number), 0);
    if (total === 3 || total === -3) return line;
  }
  return null;
}

/**
 * Same perspective trick as game.py: the current player always
 * sees their own marks as +1. Lets one Q-table serve both sides.
 */
export function encodeState(board: BoardState, player: Player): string {
  return board
    .map((cell) => {
      const viewed = (cell * player) as CellValue;
      if (viewed === 1) return "+";
      if (viewed === -1) return "-";
      return ".";
    })
    .join("");
}

export function symbolFor(cell: CellValue): "X" | "O" | "" {
  if (cell === 1) return "X";
  if (cell === -1) return "O";
  return "";
}

export function playerLabel(player: Player): "X" | "O" {
  return player === 1 ? "X" : "O";
}

export function prettyState(state: string): string {
  return `${state.slice(0, 3)}│${state.slice(3, 6)}│${state.slice(6, 9)}`;
}

export function isWinningMove(board: BoardState, player: Player, action: number): boolean {
  return checkWinner(applyMove(board, action, player)) === player;
}

export function winningMoves(board: BoardState, player: Player): number[] {
  return legalMoves(board).filter((action) => isWinningMove(board, player, action));
}

export function createsFork(board: BoardState, player: Player, action: number): boolean {
  const next = applyMove(board, action, player);
  return winningMoves(next, player).length >= 2;
}
