import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeftoverController } from './leftover.controller';
import { LeftoverService } from './leftover.service';
import { LeftoverRecord } from './leftover-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeftoverRecord])],
  controllers: [LeftoverController],
  providers: [LeftoverService],
})
export class LeftoverModule {}