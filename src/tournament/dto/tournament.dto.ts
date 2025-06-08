import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFoodItemDto {
  @ApiProperty({ 
    description: '음식 이름', 
    example: '김치찌개' 
  })
  @IsString()
  name: string;
}

export class VoteDto {
  @ApiProperty({ 
    description: '투표한 사용자 ID', 
    example: 1 
  })
  @IsNumber()
  userId: number;

  @ApiProperty({ 
    description: '승리한 음식 ID', 
    example: 3 
  })
  @IsNumber()
  winnerId: number;

  @ApiProperty({ 
    description: '패배한 음식 ID', 
    example: 7 
  })
  @IsNumber()
  loserId: number;

  @ApiProperty({ 
    description: '토너먼트 라운드 (16강=16, 8강=8, 4강=4, 결승=2)', 
    example: 16 
  })
  @IsNumber()
  round: number;
}

export class GetTournamentRoundDto {
  @ApiPropertyOptional({ 
    description: '토너먼트 라운드', 
    example: 16 
  })
  @IsNumber()
  @IsOptional()
  round?: number;

  @ApiPropertyOptional({ 
    description: '가져올 음식 개수', 
    example: 2 
  })
  @IsNumber()
  @IsOptional()
  limit?: number;
}