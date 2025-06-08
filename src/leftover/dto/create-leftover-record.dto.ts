import { IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeftoverRecordDto {
  @ApiProperty({ 
    description: '사용자 ID', 
    example: 1 
  })
  @IsNumber()
  userId: number;

  @ApiProperty({ 
    description: '기록 날짜 (YYYY-MM-DD)', 
    example: '2024-03-15' 
  })
  @IsDateString()
  recordDate: string;
}