export type CellValue = 1 | -1 | 0;
export type Player = 1 | -1;
export type Winner = 1 | -1 | 0 | null;

export type BoardState = CellValue[];

export type Outcome = "win" | "loss" | "draw";

export interface TdLogEntry {
  id: string;
  epoch: number;
  state: string;
  action: number;
  reward: number;
  qOld: number;
  qNew: number;
  tdError: number;
  epsilon: number;
  note: string;
}

export interface EpochMetric {
  epoch: number;
  winRate: number;
  lossRate: number;
  drawRate: number;
  epsilon: number;
  avgTd: number;
  qStates: number;
}

export interface QSnapshot {
  values: number[];
  legal: number[];
}

export interface TrainingSnapshot {
  epoch: number;
  epsilon: number;
  alpha: number;
  gamma: number;
  qStates: number;
  lastAvgTd: number;
  isTraining: boolean;
}
