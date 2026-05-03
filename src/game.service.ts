import { Injectable } from '@nestjs/common';
import {
  GameState,
  Player,
  Board,
  PLAYER_COLORS,
  PLAYER_NAMES,
  createEmptyBoard,
  WIN_LENGTH,
} from './types';

@Injectable()
export class GameService {
  private gameState: GameState = this.createInitialState();
  private connectedClients: Map<string, string> = new Map();

  private createInitialState(): GameState {
    return {
      players: [],
      currentPlayerId: '',
      board: createEmptyBoard(),
      scores: { 'player-1': 0, 'player-2': 0 },
    };
  }

  getGameState(): GameState {
    return this.gameState;
  }

  addPlayer(clientId: string): { success: boolean; player?: Player; error?: string } {
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
    this.connectedClients.set(clientId, player.id);

    if (this.gameState.players.length === 1) {
      this.gameState.currentPlayerId = player.id;
    }

    return { success: true, player };
  }

  removePlayer(clientId: string): void {
    const playerIndex = this.gameState.players.findIndex((p) => p.id === clientId);
    if (playerIndex !== -1) {
      this.gameState.players.splice(playerIndex, 1);
      this.connectedClients.delete(clientId);
      this.resetGame();
    }
  }

  makeMove(playerId: string, col: number): { success: boolean; error?: string } {
    if (this.gameState.players.length < 2) {
      return { success: false, error: 'Esperando segundo jugador' };
    }

    if (playerId !== this.gameState.currentPlayerId) {
      return { success: false, error: 'No es tu turno' };
    }

    if (col < 0 || col >= 7) {
      return { success: false, error: 'Columna inválida' };
    }

    const row = this.getLowestEmptyRow(col);
    if (row === -1) {
      return { success: false, error: 'Columna llena' };
    }

    this.gameState.board[row][col] = playerId;

    if (this.checkWin(playerId)) {
      const playerIndex = this.gameState.players.findIndex((p) => p.id === playerId);
      const scoreKey = `player-${playerIndex + 1}`;
      this.gameState.scores[scoreKey]++;
      this.gameState.board = createEmptyBoard();
      if (this.gameState.players.length > 0) {
        this.gameState.currentPlayerId = this.gameState.players[0].id;
      }
    } else {
      this.switchTurn();
    }

    return { success: true };
  }

  private getLowestEmptyRow(col: number): number {
    for (let row = 5; row >= 0; row--) {
      if (this.gameState.board[row][col] === null) {
        return row;
      }
    }
    return -1;
  }

  private switchTurn(): void {
    const currentIndex = this.gameState.players.findIndex(
      (p) => p.id === this.gameState.currentPlayerId,
    );
    const nextIndex = (currentIndex + 1) % this.gameState.players.length;
    this.gameState.currentPlayerId = this.gameState.players[nextIndex].id;
  }

  private checkWin(playerId: string): boolean {
    const board = this.gameState.board;

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        if (
          this.checkDirection(board, row, col, 0, 1, playerId) ||
          this.checkDirection(board, row, col, 1, 0, playerId) ||
          this.checkDirection(board, row, col, 1, 1, playerId) ||
          this.checkDirection(board, row, col, 1, -1, playerId)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private checkDirection(
    board: Board,
    row: number,
    col: number,
    dRow: number,
    dCol: number,
    playerId: string,
  ): boolean {
    let count = 0;
    for (let i = 0; i < WIN_LENGTH; i++) {
      const r = row + i * dRow;
      const c = col + i * dCol;
      if (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === playerId) {
        count++;
      } else {
        break;
      }
    }
    return count >= WIN_LENGTH;
  }

  private resetGame(): void {
    this.gameState = this.createInitialState();
  }

  getPlayerIndex(playerId: string): number {
    return this.gameState.players.findIndex((p) => p.id === playerId);
  }
}