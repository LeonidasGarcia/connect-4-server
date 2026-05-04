import { IsString, IsOptional } from 'class-validator';

// Payload opcional para futuras salas; actualmente permite entrar sin enviar roomId.
export class JoinRoomDto {
  @IsString()
  @IsOptional()
  roomId?: string;
}
