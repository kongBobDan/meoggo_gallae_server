import { 
  Controller, 
  Post, 
  Body, 
  UseInterceptors, 
  UploadedFile, 
  Get, 
  Param,
  Query,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TournamentService } from './tournament.service';
import { CreateFoodItemDto, VoteDto, GetTournamentRoundDto } from './dto/tournament.dto';

@Controller('tournament')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post('food')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/food',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('이미지 파일만 업로드 가능합니다!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async createFoodItem(
    @Body() createDto: CreateFoodItemDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('이미지 파일이 필요합니다');
    }

    const foodItem = await this.tournamentService.createFoodItem(
      createDto,
      file.path,
    );

    return {
      success: true,
      foodItem: {
        id: foodItem.id,
        name: foodItem.name,
        imagePath: `/uploads/food/${file.filename}`,
      },
    };
  }

  @Get('foods')
  async getAllFoodItems() {
    const foods = await this.tournamentService.getAllFoodItems();
    
    return {
      success: true,
      foods: foods.map(food => ({
        id: food.id,
        name: food.name,
        imagePath: food.imagePath.replace('./uploads', '/uploads'),
        totalVotes: food.totalVotes,
        wins: food.wins,
        matches: food.matches,
      })),
    };
  }

  @Get('round')
  async getTournamentRound(@Query() query: GetTournamentRoundDto) {
    const { round = 16, limit = 2 } = query;
    const foods = await this.tournamentService.getTournamentRound(round, limit);
    
    return {
      success: true,
      round,
      foods: foods.map(food => ({
        id: food.id,
        name: food.name,
        imagePath: food.imagePath.replace('./uploads', '/uploads'),
      })),
    };
  }

  @Post('vote')
  async vote(@Body() voteDto: VoteDto) {
    const vote = await this.tournamentService.vote(voteDto);
    
    return {
      success: true,
      vote: {
        id: vote.id,
        winnerId: vote.winnerId,
        loserId: vote.loserId,
        round: vote.round,
        createdAt: vote.createdAt,
      },
    };
  }

  @Get('food/:id/stats')
  async getFoodStats(@Param('id') id: number) {
    const stats = await this.tournamentService.getFoodItemStats(id);
    
    return {
      success: true,
      stats,
    };
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit = 10) {
    const leaderboard = await this.tournamentService.getLeaderboard(limit);
    
    return {
      success: true,
      leaderboard,
    };
  }

  @Get('user/:userId/votes')
  async getUserVoteHistory(@Param('userId') userId: number) {
    const votes = await this.tournamentService.getUserVoteHistory(userId);
    
    return {
      success: true,
      votes: votes.map(vote => ({
        id: vote.id,
        round: vote.round,
        createdAt: vote.createdAt,
        winner: {
          id: vote.winner.id,
          name: vote.winner.name,
          imagePath: vote.winner.imagePath.replace('./uploads', '/uploads'),
        },
        loser: {
          id: vote.loser.id,
          name: vote.loser.name,
          imagePath: vote.loser.imagePath.replace('./uploads', '/uploads'),
        },
      })),
    };
  }
}