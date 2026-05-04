import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';

@Module({
  // Importa el modulo que contiene toda la logica del juego y sus WebSockets.
  imports: [GameModule],
  // Registra el controlador HTTP basico de la aplicacion.
  controllers: [AppController],
  // Registra servicios disponibles por inyeccion de dependencias.
  providers: [AppService],
})
export class AppModule {}
