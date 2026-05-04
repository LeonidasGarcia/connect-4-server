import { IsString, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Estructura publica de un jugador enviada al cliente.
export class PlayerResponseDto {
  @IsString()
  id: string;

  @IsString()
  color: string;

  @IsString()
  name: string;
}

// Fichas colocadas en el tablero, separadas por jugador.
export class TokensResponseDto {
  @IsArray()
  @IsString({ each: true })
  player1: string[];

  @IsArray()
  @IsString({ each: true })
  player2: string[];
}

// Estado completo de la partida que se emite por WebSocket.
export class GameStateResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlayerResponseDto)
  players: PlayerResponseDto[];

  @IsString()
  currentPlayerId: string;

  @IsObject()
  scores: Record<string, number>;

  @ValidateNested()
  @Type(() => TokensResponseDto)
  tokens: TokensResponseDto;
}

// Respuesta enviada al cliente cuando el servidor le asigna un jugador.
export class PlayerIdAssignedResponseDto {
  @IsString()
  id: string;
}

// Formato comun para errores enviados al cliente.
export class ErrorResponseDto {
  @IsString()
  message: string;
}
