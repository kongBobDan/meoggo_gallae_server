import { IsNumber, IsPositive, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ 
    description: '학년', 
    minimum: 1, 
    maximum: 3, 
    example: 2 
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(3)
  grade: number;

  @ApiProperty({ 
    description: '반', 
    minimum: 1, 
    maximum: 20, 
    example: 5 
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(20)
  classNumber: number;

  @ApiProperty({ 
    description: '번호', 
    minimum: 1, 
    maximum: 40, 
    example: 15 
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(40)
  studentNumber: number;
}