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
  // Estado principal de la partida y estructuras auxiliares para consultar fichas rapidamente.
  private gameState: GameState = this.createInitialState();
  private player1Tokens: Set<string> = new Set();
  private player2Tokens: Set<string> = new Set();
  private clientIdToPlayerIndex: Map<string, number> = new Map();

  // Crea una partida vacia sin jugadores, sin turno y sin puntuaciones.
  private createInitialState(): GameState {
    return {
      players: [],
      currentPlayerId: '',
      scores: {},
    };
  }

  // Devuelve el estado visible para el cliente, incluyendo las fichas de ambos jugadores.
  getGameState(): GameState & { tokens: { player1: string[]; player2: string[] } } {
    return {
      ...this.gameState,
      tokens: {
        player1: Array.from(this.player1Tokens),
        player2: Array.from(this.player2Tokens),
      },
    };
  }

  // Registra un jugador nuevo si la sala todavia no tiene los dos jugadores permitidos.
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

    // El primer jugador que entra empieza la partida.
    if (this.gameState.players.length === 1) {
      this.gameState.currentPlayerId = player.id;
    }

    return { success: true, player };
  }

  // Elimina al jugador desconectado y reinicia el tablero para evitar partidas incompletas.
  removePlayer(clientId: string): void {
    const playerIndex = this.clientIdToPlayerIndex.get(clientId);
    if (playerIndex !== undefined) {
      this.gameState.players.splice(playerIndex, 1);
      this.clientIdToPlayerIndex.delete(clientId);
      this.clearTokens();
      this.resetGame();
    }
  }

  // Valida y ejecuta una jugada en una columna del tablero.
  makeMove(playerId: string, col: number): boolean {
    // Rechaza columnas fuera del tablero o jugadas antes de que haya dos jugadores.
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

    // La ficha cae hasta la fila libre mas baja de la columna seleccionada.
    const row = this.findLowestEmptyRow(col);
    if (row === -1) {
      return false;
    }

    const tokenSet =
      playerIndex === 0 ? this.player1Tokens : this.player2Tokens;
    const coord = coordToString(col, row);

    tokenSet.add(coord);

    // Si la jugada forma cuatro en linea, suma punto y limpia el tablero para la siguiente ronda.
    if (this.checkWin(coord, tokenSet)) {
      this.gameState.scores[playerId] =
        (this.gameState.scores[playerId] ?? 0) + 1;
      this.clearTokens();
      if (this.gameState.players.length > 0) {
        const nextPlayerIndex = (playerIndex + 1) % this.gameState.players.length;
        this.gameState.currentPlayerId = this.gameState.players[nextPlayerIndex].id;
      }
    } else {
      // Si no hay victoria, el turno pasa al otro jugador.
      this.switchTurn();
    }

    return true;
  }

  // Busca desde abajo hacia arriba la primera celda libre en una columna.
  private findLowestEmptyRow(col: number): number {
    for (let row = BOARD_ROWS - 1; row >= 0; row--) {
      const coord = coordToString(col, row);
      if (!this.player1Tokens.has(coord) && !this.player2Tokens.has(coord)) {
        return row;
      }
    }
    return -1;
  }

  // Comprueba si la ultima ficha conecta cuatro en horizontal, vertical o diagonal.
  private checkWin(coord: string, tokens: Set<string>): boolean {
    const { col, row } = stringToCoord(coord);

    const directions = [
      // Horizontal, vertical y las dos diagonales posibles.
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

  // Cuenta fichas consecutivas en ambos sentidos de una direccion a partir de la ultima ficha.
  private countConsecutive(
    startCol: number,
    startRow: number,
    dCol: number,
    dRow: number,
    tokens: Set<string>,
  ): number {
    let count = 1;

    // Avanza en el sentido positivo de la direccion.
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

    // Avanza en el sentido contrario para sumar la linea completa.
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

  // Cambia el turno al siguiente jugador registrado.
  private switchTurn(): void {
    const currentIndex = this.gameState.players.findIndex(
      (p) => p.id === this.gameState.currentPlayerId,
    );
    const nextIndex = (currentIndex + 1) % this.gameState.players.length;
    this.gameState.currentPlayerId = this.gameState.players[nextIndex].id;
  }

  // Borra todas las fichas del tablero sin modificar jugadores ni puntuaciones.
  private clearTokens(): void {
    this.player1Tokens.clear();
    this.player2Tokens.clear();
  }

  // Reinicia por completo la partida cuando ya no se puede continuar con los jugadores actuales.
  private resetGame(): void {
    this.gameState = this.createInitialState();
  }

  // Devuelve la posicion del jugador dentro del arreglo de jugadores activos.
  getPlayerIndex(playerId: string): number {
    return this.gameState.players.findIndex((p) => p.id === playerId);
  }
}
