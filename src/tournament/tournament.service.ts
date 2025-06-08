import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodItem, TournamentVote } from './tournament.entity';
import { CreateFoodItemDto, VoteDto } from './dto/tournament.dto';

@Injectable()
export class TournamentService {
  constructor(
    @InjectRepository(FoodItem)
    private foodItemRepository: Repository<FoodItem>,
    @InjectRepository(TournamentVote)
    private voteRepository: Repository<TournamentVote>,
  ) {}

  async createFoodItem(createDto: CreateFoodItemDto, imagePath: string): Promise<FoodItem> {
    const foodItem = this.foodItemRepository.create({
      name: createDto.name,
      imagePath,
    });

    return await this.foodItemRepository.save(foodItem);
  }

  async getAllFoodItems(): Promise<FoodItem[]> {
    return await this.foodItemRepository.find({
      order: { totalVotes: 'DESC' },
    });
  }

  async getTournamentRound(round: number, limit = 2): Promise<FoodItem[]> {
    // 라운드에 맞는 음식들을 랜덤하게 선택
    const allFoods = await this.foodItemRepository.find();
    
    if (allFoods.length < limit) {
      return allFoods;
    }

    // 랜덤하게 섞어서 선택
    const shuffled = allFoods.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  async vote(voteDto: VoteDto): Promise<TournamentVote> {
    const { userId, winnerId, loserId, round } = voteDto;

    // 투표 기록 생성
    const vote = this.voteRepository.create({
      userId,
      winnerId,
      loserId,
      round,
    });

    const savedVote = await this.voteRepository.save(vote);

    // 음식 아이템 통계 업데이트
    await this.updateFoodItemStats(winnerId, loserId);

    return savedVote;
  }

  private async updateFoodItemStats(winnerId: number, loserId: number): Promise<void> {
    // 승자 업데이트
    await this.foodItemRepository.increment(
      { id: winnerId },
      'totalVotes',
      1
    );
    await this.foodItemRepository.increment(
      { id: winnerId },
      'wins',
      1
    );
    await this.foodItemRepository.increment(
      { id: winnerId },
      'matches',
      1
    );

    // 패자 업데이트
    await this.foodItemRepository.increment(
      { id: loserId },
      'totalVotes',
      1
    );
    await this.foodItemRepository.increment(
      { id: loserId },
      'matches',
      1
    );
  }

  async getFoodItemStats(foodId: number) {
    const food = await this.foodItemRepository.findOne({
      where: { id: foodId },
    });

    if (!food) {
      throw new Error('음식을 찾을 수 없습니다');
    }

    const winRate = food.matches > 0 ? (food.wins / food.matches) * 100 : 0;

    // 전체 음식 대비 승률 순위
    const allFoods = await this.foodItemRepository.find();
    const sortedByWinRate = allFoods
      .map(f => ({
        id: f.id,
        winRate: f.matches > 0 ? (f.wins / f.matches) * 100 : 0,
      }))
      .sort((a, b) => b.winRate - a.winRate);

    const rank = sortedByWinRate.findIndex(f => f.id === foodId) + 1;
    const championshipRate = ((allFoods.length - rank + 1) / allFoods.length) * 100;

    return {
      id: food.id,
      name: food.name,
      imagePath: food.imagePath.replace('./uploads', '/uploads'),
      totalVotes: food.totalVotes,
      wins: food.wins,
      matches: food.matches,
      winRate: Math.round(winRate * 100) / 100,
      rank,
      championshipRate: Math.round(championshipRate * 100) / 100,
    };
  }

  async getLeaderboard(limit = 10) {
    const foods = await this.foodItemRepository.find({
      order: { wins: 'DESC', totalVotes: 'DESC' },
      take: limit,
    });

    return foods.map(food => ({
      id: food.id,
      name: food.name,
      imagePath: food.imagePath.replace('./uploads', '/uploads'),
      totalVotes: food.totalVotes,
      wins: food.wins,
      matches: food.matches,
      winRate: food.matches > 0 ? Math.round((food.wins / food.matches) * 10000) / 100 : 0,
    }));
  }

  async getUserVoteHistory(userId: number): Promise<TournamentVote[]> {
    return await this.voteRepository.find({
      where: { userId },
      relations: ['winner', 'loser'],
      order: { createdAt: 'DESC' },
    });
  }
}