import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clientIdToPlayerId: Map<string, string> = new Map();

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket): void {
    const result = this.gameService.addPlayer(client.id);

    if (!result.success || !result.player) {
      client.emit('errorOccurred', { message: result.error || 'Error desconocido' });
      client.disconnect();
      return;
    }

    this.clientIdToPlayerId.set(client.id, result.player.id);
    client.emit('playerIdAssigned', { id: result.player.id });

    if (this.gameService.getGameState().players.length === 2) {
      this.broadcastGameState();
    }
  }

  handleDisconnect(client: Socket): void {
    const playerId = this.clientIdToPlayerId.get(client.id);
    if (playerId) {
      this.gameService.removePlayer(playerId);
      this.clientIdToPlayerId.delete(client.id);
      this.broadcastGameState();
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket): void {
    const gameState = this.gameService.getGameState();
    if (gameState.players.length === 2) {
      client.emit('gameStateChanged', gameState);
    }
  }

  @SubscribeMessage('makeMove')
  handleMakeMove(client: Socket, payload: { col: number }): void {
    const playerId = this.clientIdToPlayerId.get(client.id);
    if (!playerId) {
      client.emit('errorOccurred', { message: 'No estás en la sala' });
      return;
    }

    const result = this.gameService.makeMove(playerId, payload.col);

    if (!result.success) {
      client.emit('errorOccurred', { message: result.error });
      return;
    }

    this.broadcastGameState();
  }

  private broadcastGameState(): void {
    const gameState = this.gameService.getGameState();
    this.server.emit('gameStateChanged', gameState);
  }
}