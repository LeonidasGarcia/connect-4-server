import { IsString, IsArray, IsObject, ValidateNested, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PlayerResponseDto {
  @IsString()
  id: string;

  @IsString()
  color: string;

  @IsString()
  name: string;
}

export class GameStateResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlayerResponseDto)
  players: PlayerResponseDto[];

  @IsString()
  currentPlayerId: string;

  @IsObject()
  scores: Record<string, number>;
}

export class PlayerIdAssignedResponseDto {
  @IsString()
  id: string;
}

export class ErrorResponseDto {
  @IsString()
  message: string;
}