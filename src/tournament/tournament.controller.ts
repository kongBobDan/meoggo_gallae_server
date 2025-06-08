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
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiParam, ApiQuery } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TournamentService } from './tournament.service';
import { CreateFoodItemDto, VoteDto, GetTournamentRoundDto } from './dto/tournament.dto';

@ApiTags('tournament')
@Controller('tournament')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post('food')
  @ApiOperation({ 
    summary: '음식 아이템 등록',
    description: '토너먼트에 사용할 음식을 이미지와 함께 등록합니다.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ 
    status: 201, 
    description: '음식 등록 성공',
    schema: {
      example: {
        success: true,
        foodItem: {
          id: 1,
          name: '김치찌개',
          imagePath: '/uploads/food/abc123.jpg'
        }
      }
    }
  })
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
  @ApiOperation({ 
    summary: '모든 음식 목록 조회',
    description: '등록된 모든 음식의 목록과 통계를 조회합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '음식 목록 조회 성공' 
  })
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
  @ApiOperation({ 
    summary: '토너먼트 라운드 데이터 조회',
    description: '특정 라운드에 맞는 음식 데이터를 랜덤하게 가져옵니다.'
  })
  @ApiQuery({ name: 'round', required: false, description: '토너먼트 라운드' })
  @ApiQuery({ name: 'limit', required: false, description: '가져올 음식 개수' })
  @ApiResponse({ 
    status: 200, 
    description: '라운드 데이터 조회 성공' 
  })
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
  @ApiOperation({ 
    summary: '토너먼트 투표',
    description: '두 음식 중 선호하는 음식에 투표합니다.'
  })
  @ApiResponse({ 
    status: 201, 
    description: '투표 완료',
    schema: {
      example: {
        success: true,
        vote: {
          id: 1,
          winnerId: 3,
          loserId: 7,
          round: 16,
          createdAt: '2024-03-15T10:30:00.000Z'
        }
      }
    }
  })
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
  @ApiOperation({ 
    summary: '음식별 통계 조회',
    description: '특정 음식의 승률, 순위 등의 상세 통계를 조회합니다.'
  })
  @ApiParam({ name: 'id', description: '음식 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '통계 조회 성공' 
  })
  async getFoodStats(@Param('id') id: number) {
    const stats = await this.tournamentService.getFoodItemStats(id);
    
    return {
      success: true,
      stats,
    };
  }

  @Get('leaderboard')
  @ApiOperation({ 
    summary: '리더보드 조회',
    description: '승수 기준으로 정렬된 음식 순위를 조회합니다.'
  })
  @ApiQuery({ name: 'limit', required: false, description: '조회할 개수' })
  @ApiResponse({ 
    status: 200, 
    description: '리더보드 조회 성공' 
  })
  async getLeaderboard(@Query('limit') limit = 10) {
    const leaderboard = await this.tournamentService.getLeaderboard(limit);
    
    return {
      success: true,
      leaderboard,
    };
  }

  @Get('user/:userId/votes')
  @ApiOperation({ 
    summary: '사용자 투표 히스토리',
    description: '특정 사용자의 투표 기록을 조회합니다.'
  })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '투표 히스토리 조회 성공' 
  })
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