import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateFoodItemDto {
  @IsString()
  name: string;
}

export class VoteDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  winnerId: number;

  @IsNumber()
  loserId: number;

  @IsNumber()
  round: number;
}

export class GetTournamentRoundDto {
  @IsNumber()
  @IsOptional()
  round?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}