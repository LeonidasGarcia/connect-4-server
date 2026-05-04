import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  // GameGateway escucha eventos WebSocket y GameService mantiene el estado del juego.
  providers: [GameGateway, GameService],
  // Exporta GameService por si otro modulo necesita consultar o modificar el estado del juego.
  exports: [GameService],
})
export class GameModule {}
