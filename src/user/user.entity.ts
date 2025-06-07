import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LeftoverRecord } from '../leftover/leftover-record.entity';
import { TournamentVote } from '../tournament/tournament-vote.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grade: number; // 학년

  @Column()
  classNumber: number; // 반

  @Column()
  studentNumber: number; // 번호

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LeftoverRecord, leftoverRecord => leftoverRecord.user)
  leftoverRecords: LeftoverRecord[];

  @OneToMany(() => TournamentVote, vote => vote.user)
  votes: TournamentVote[];
}