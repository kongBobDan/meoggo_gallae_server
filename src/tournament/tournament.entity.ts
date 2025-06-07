import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('food_items')
export class FoodItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  imagePath: string;

  @Column({ default: 0 })
  totalVotes: number; // 총 투표 수

  @Column({ default: 0 })
  wins: number; // 승리 횟수

  @Column({ default: 0 })
  matches: number; // 총 경기 수

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => TournamentVote, vote => vote.winner)
  winnerVotes: TournamentVote[];

  @OneToMany(() => TournamentVote, vote => vote.loser)
  loserVotes: TournamentVote[];
}

@Entity('tournament_votes')
export class TournamentVote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.votes)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => FoodItem, food => food.winnerVotes)
  winner: FoodItem;

  @Column()
  winnerId: number;

  @ManyToOne(() => FoodItem, food => food.loserVotes)
  loser: FoodItem;

  @Column()
  loserId: number;

  @Column()
  round: number; // 몇강인지 (16강, 8강, 4강, 결승 등)

  @CreateDateColumn()
  createdAt: Date;
}