import { IsNumber, IsDateString } from 'class-validator';

export class CreateLeftoverRecordDto {
  @IsNumber()
  userId: number;

  @IsDateString()
  recordDate: string;
}