import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { MakeMoveDto } from './dto';
import { WebSocketValidationPipe } from './pipes/websocket-validation.pipe';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Relaciona cada socket conectado con el jugador creado en el servicio del juego.
  private clientIdToPlayerId: Map<string, string> = new Map();

  constructor(private readonly gameService: GameService) {}

  // Se ejecuta automaticamente cuando un cliente abre una conexion WebSocket.
  handleConnection(client: Socket): void {
    const result = this.gameService.addPlayer(client.id);

    // Si la sala esta llena o no se pudo crear el jugador, se informa al cliente y se cierra la conexion.
    if (!result.success || !result.player) {
      client.emit('errorOccurred', {
        message: result.error || 'Error desconocido',
      });
      client.disconnect();
      return;
    }

    // Guarda el jugador asociado al socket y le devuelve al cliente su identificador de jugador.
    this.clientIdToPlayerId.set(client.id, result.player.id);
    client.emit('playerIdAssigned', { id: result.player.id });

    // Cuando ya hay dos jugadores, todos reciben el estado inicial de la partida.
    if (this.gameService.getGameState().players.length === 2) {
      this.broadcastGameState();
    }
  }

  // Limpia el jugador asociado cuando un cliente se desconecta del WebSocket.
  handleDisconnect(client: Socket): void {
    const playerId = this.clientIdToPlayerId.get(client.id);
    if (playerId) {
      this.gameService.removePlayer(playerId);
      this.clientIdToPlayerId.delete(client.id);
      this.broadcastGameState();
    }
  }

  @SubscribeMessage('joinRoom')
  // Envia el estado actual al cliente que entra si la partida ya tiene dos jugadores.
  handleJoinRoom(@ConnectedSocket() client: Socket): void {
    const gameState = this.gameService.getGameState();
    if (gameState.players.length === 2) {
      client.emit('gameStateChanged', gameState);
    }
  }

  @SubscribeMessage('makeMove')
  // Procesa una jugada enviada por el cliente y notifica el nuevo estado si fue valida.
  handleMakeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WebSocketValidationPipe()) dto: MakeMoveDto,
  ): void {
    const playerId = this.clientIdToPlayerId.get(client.id);

    // Ignora eventos de sockets que no tienen un jugador registrado.
    if (!playerId) {
      return;
    }

    const gameState = this.gameService.getGameState();

    // Solo el jugador con el turno activo puede colocar una ficha.
    if (playerId !== gameState.currentPlayerId) {
      return;
    }

    const success = this.gameService.makeMove(playerId, dto.col);

    if (success) {
      this.broadcastGameState();
    }
  }

  // Publica el estado actualizado de la partida a todos los clientes conectados.
  private broadcastGameState(): void {
    const gameState = this.gameService.getGameState();
    this.server.emit('gameStateChanged', gameState);
  }
}
