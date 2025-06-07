import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

export enum LeftoverLevel {
  LOW = 'LOW',       // 적게 남김
  MEDIUM = 'MEDIUM', // 적당히 먹음
  HIGH = 'HIGH'      // 많이 남김
}

@Entity('leftover_records')
export class LeftoverRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.leftoverRecords)
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'date' })
  recordDate: Date;

  @Column()
  imagePath: string; // 업로드된 이미지 경로

  @Column({
    type: 'enum',
    enum: LeftoverLevel,
  })
  leftoverLevel: LeftoverLevel;

  @Column({ type: 'float', nullable: true })
  aiConfidence: number; // AI 분석 신뢰도

  @CreateDateColumn()
  createdAt: Date;
}