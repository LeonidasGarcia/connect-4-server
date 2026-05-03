import { IsString, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PlayerResponseDto {
  @IsString()
  id: string;

  @IsString()
  color: string;

  @IsString()
  name: string;
}

export class TokensResponseDto {
  @IsArray()
  @IsString({ each: true })
  player1: string[];

  @IsArray()
  @IsString({ each: true })
  player2: string[];
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

  @ValidateNested()
  @Type(() => TokensResponseDto)
  tokens: TokensResponseDto;
}

export class PlayerIdAssignedResponseDto {
  @IsString()
  id: string;
}

export class ErrorResponseDto {
  @IsString()
  message: string;
}
