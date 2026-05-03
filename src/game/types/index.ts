export interface Player {
  id: string;
  color: string;
  name: string;
}

export type Board = (string | null)[][];

export interface GameState {
  players: Player[];
  currentPlayerId: string;
  board: Board;
  scores: Record<string, number>;
}

export const PLAYER_COLORS = ['#D54117', '#F7B538'];
export const PLAYER_NAMES = ['Player 1', 'Player 2'];
export const BOARD_ROWS = 6;
export const BOARD_COLS = 7;
export const WIN_LENGTH = 4;

export function createEmptyBoard(): Board {
  return Array(BOARD_ROWS)
    .fill(null)
    .map(() => Array(BOARD_COLS).fill(null));
}
