export interface Player {
  id: string;
  color: string;
  name: string;
}

export interface GameState {
  players: Player[];
  currentPlayerId: string;
  scores: Record<string, number>;
}

export const PLAYER_COLORS = ['#D54117', '#F7B538'];
export const PLAYER_NAMES = ['Player 1', 'Player 2'];
export const BOARD_ROWS = 6;
export const BOARD_COLS = 7;
export const WIN_LENGTH = 4;
