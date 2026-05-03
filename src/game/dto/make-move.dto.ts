import { IsInt, Min, Max } from 'class-validator';

export class MakeMoveDto {
  @IsInt()
  @Min(0)
  @Max(6)
  col: number;

  @IsInt()
  @Min(0)
  @Max(5)
  row: number;
}