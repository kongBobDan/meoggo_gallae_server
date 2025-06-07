import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
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
  async getUserStats(@Param('id') id: number) {
    const stats = await this.userService.getUserStats(id);
    return {
      success: true,
      stats,
    };
  }
}