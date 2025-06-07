import { IsNumber, IsPositive, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(3)
  grade: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(20)
  classNumber: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(40)
  studentNumber: number;
}