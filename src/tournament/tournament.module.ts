import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import { FoodItem, TournamentVote } from './tournament.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FoodItem, TournamentVote])],
  controllers: [TournamentController],
  providers: [TournamentService],
})
export class TournamentModule {}