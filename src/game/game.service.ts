import { Injectable } from '@nestjs/common';
import {
  GameState,
  Player,
  PLAYER_COLORS,
  PLAYER_NAMES,
  WIN_LENGTH,
  BOARD_ROWS,
  BOARD_COLS,
} from './types/index';
import { coordToString, stringToCoord } from './utils/coordinates';

@Injectable()
export class GameService {
  private gameState: GameState = this.createInitialState();
  private player1Tokens: Set<string> = new Set();
  private player2Tokens: Set<string> = new Set();
  private clientIdToPlayerIndex: Map<string, number> = new Map();

  private createInitialState(): GameState {
    return {
      players: [],
      currentPlayerId: '',
      scores: {},
    };
  }

  getGameState(): GameState & { tokens: { player1: string[]; player2: string[] } } {
    return {
      ...this.gameState,
      tokens: {
        player1: Array.from(this.player1Tokens),
        player2: Array.from(this.player2Tokens),
      },
    };
  }

  addPlayer(clientId: string): {
    success: boolean;
    player?: Player;
    error?: string;
  } {
    if (this.gameState.players.length >= 2) {
      return { success: false, error: 'Sala llena' };
    }

    const playerIndex = this.gameState.players.length;
    const player: Player = {
      id: clientId,
      color: PLAYER_COLORS[playerIndex],
      name: PLAYER_NAMES[playerIndex],
    };

    this.gameState.players.push(player);
    this.gameState.scores[player.id] = 0;
    this.clientIdToPlayerIndex.set(clientId, playerIndex);

    if (this.gameState.players.length === 1) {
      this.gameState.currentPlayerId = player.id;
    }

    return { success: true, player };
  }

  removePlayer(clientId: string): void {
    const playerIndex = this.clientIdToPlayerIndex.get(clientId);
    if (playerIndex !== undefined) {
      this.gameState.players.splice(playerIndex, 1);
      this.clientIdToPlayerIndex.delete(clientId);
      this.clearTokens();
      this.resetGame();
    }
  }

  makeMove(playerId: string, col: number): boolean {
    if (col < 0 || col >= BOARD_COLS) {
      return false;
    }

    if (this.gameState.players.length < 2) {
      return false;
    }

    const playerIndex = this.gameState.players.findIndex(
      (p) => p.id === playerId,
    );
    if (playerIndex === -1) {
      return false;
    }

    const row = this.findLowestEmptyRow(col);
    if (row === -1) {
      return false;
    }

    const tokenSet =
      playerIndex === 0 ? this.player1Tokens : this.player2Tokens;
    const coord = coordToString(col, row);

    tokenSet.add(coord);

    if (this.checkWin(coord, tokenSet)) {
      this.gameState.scores[playerId] =
        (this.gameState.scores[playerId] ?? 0) + 1;
      this.clearTokens();
      if (this.gameState.players.length > 0) {
        const nextPlayerIndex = (playerIndex + 1) % this.gameState.players.length;
        this.gameState.currentPlayerId = this.gameState.players[nextPlayerIndex].id;
      }
    } else {
      this.switchTurn();
    }

    return true;
  }

  private findLowestEmptyRow(col: number): number {
    for (let row = BOARD_ROWS - 1; row >= 0; row--) {
      const coord = coordToString(col, row);
      if (!this.player1Tokens.has(coord) && !this.player2Tokens.has(coord)) {
        return row;
      }
    }
    return -1;
  }

  private checkWin(coord: string, tokens: Set<string>): boolean {
    const { col, row } = stringToCoord(coord);

    const directions = [
      { dCol: 1, dRow: 0 },
      { dCol: 0, dRow: 1 },
      { dCol: 1, dRow: 1 },
      { dCol: 1, dRow: -1 },
    ];

    for (const { dCol, dRow } of directions) {
      if (this.countConsecutive(col, row, dCol, dRow, tokens) >= WIN_LENGTH) {
        return true;
      }
    }

    return false;
  }

  private countConsecutive(
    startCol: number,
    startRow: number,
    dCol: number,
    dRow: number,
    tokens: Set<string>,
  ): number {
    let count = 1;

    let col = startCol + dCol;
    let row = startRow + dRow;
    while (
      col >= 0 &&
      col < BOARD_COLS &&
      row >= 0 &&
      row < BOARD_ROWS &&
      tokens.has(coordToString(col, row))
    ) {
      count++;
      col += dCol;
      row += dRow;
    }

    col = startCol - dCol;
    row = startRow - dRow;
    while (
      col >= 0 &&
      col < BOARD_COLS &&
      row >= 0 &&
      row < BOARD_ROWS &&
      tokens.has(coordToString(col, row))
    ) {
      count++;
      col -= dCol;
      row -= dRow;
    }

    return count;
  }

  private switchTurn(): void {
    const currentIndex = this.gameState.players.findIndex(
      (p) => p.id === this.gameState.currentPlayerId,
    );
    const nextIndex = (currentIndex + 1) % this.gameState.players.length;
    this.gameState.currentPlayerId = this.gameState.players[nextIndex].id;
  }

  private clearTokens(): void {
    this.player1Tokens.clear();
    this.player2Tokens.clear();
  }

  private resetGame(): void {
    this.gameState = this.createInitialState();
  }

  getPlayerIndex(playerId: string): number {
    return this.gameState.players.findIndex((p) => p.id === playerId);
  }
}
