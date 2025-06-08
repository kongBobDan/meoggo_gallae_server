import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @ApiOperation({ 
    summary: '사용자 로그인/생성',
    description: '반, 번호를 입력하여 로그인하거나 새 사용자를 생성합니다.'
  })
  @ApiResponse({ 
    status: 201, 
    description: '로그인 성공',
    schema: {
      example: {
        success: true,
        user: {
          id: 1,
          grade: 2,
          classNumber: 5,
          studentNumber: 15
        }
      }
    }
  })
  async login(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    return {
      success: true,
      user: {
        id: user.id,
        grade: user.grade,
        classNumber: user.classNumber,
        studentNumber: user.studentNumber,
      },
    };
  }

  @Get(':id/stats')
  @ApiOperation({ 
    summary: '사용자 잔반 통계 조회',
    description: '사용자의 잔반량 통계를 조회합니다.'
  })
  @ApiParam({ name: 'id', description: '사용자 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '통계 조회 성공',
    schema: {
      example: {
        success: true,
        stats: {
          total: 15,
          lowLeftover: 8,
          mediumLeftover: 5,
          highLeftover: 2
        }
      }
    }
  })
  async getUserStats(@Param('id') id: number) {
    const stats = await this.userService.getUserStats(id);
    return {
      success: true,
      stats,
    };
  }
}