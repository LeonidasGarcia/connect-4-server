import { IsInt, Min, Max } from 'class-validator';

// Payload esperado cuando un cliente intenta colocar una ficha.
export class MakeMoveDto {
  @IsInt()
  @Min(0)
  @Max(6)
  col: number;
}
