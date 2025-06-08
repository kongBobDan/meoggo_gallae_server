import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MealService } from './meal.service';

@ApiTags('meal')
@Controller('meal')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Get('today')
  @ApiOperation({ 
    summary: '오늘의 급식 조회',
    description: '오늘의 아침, 점심, 저녁 급식 메뉴를 조회합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '급식 정보 조회 성공',
    schema: {
      example: {
        success: true,
        meal: {
          date: '20240315',
          breakfast: ['백미밥', '미역국', '김치'],
          lunch: ['현미밥', '김치찌개', '불고기', '깍두기'],
          dinner: ['급식 정보가 없습니다.']
        }
      }
    }
  })
  async getTodayMeal() {
    const meal = await this.mealService.getTodayMeal();
    
    return {
      success: true,
      meal: {
        date: meal.date,
        breakfast: meal.breakfast || ['조식 정보가 없습니다.'],
        lunch: meal.lunch || ['중식 정보가 없습니다.'],
        dinner: meal.dinner || ['석식 정보가 없습니다.'],
      },
    };
  }

  @Get('date')
  @ApiOperation({ 
    summary: '특정 날짜 급식 조회',
    description: '지정한 날짜의 급식 메뉴를 조회합니다.'
  })
  @ApiQuery({ 
    name: 'date', 
    description: 'YYYYMMDD 형식의 날짜', 
    example: '20240315' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '급식 정보 조회 성공' 
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 날짜 형식' 
  })
  async getMealByDate(@Query('date') date: string) {
    if (!date || !date.match(/^\d{8}$/)) {
      return {
        success: false,
        message: '날짜는 YYYYMMDD 형식이어야 합니다.',
      };
    }

    const meal = await this.mealService.getMealByDate(date);
    
    return {
      success: true,
      meal: {
        date: meal.date,
        breakfast: meal.breakfast || ['조식 정보가 없습니다.'],
        lunch: meal.lunch || ['중식 정보가 없습니다.'],
        dinner: meal.dinner || ['석식 정보가 없습니다.'],
      },
    };
  }

  @Get('week')
  @ApiOperation({ 
    summary: '주간 급식 일정 조회',
    description: '이번 주 월요일부터 금요일까지의 급식 일정을 조회합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '주간 급식 일정 조회 성공',
    schema: {
      example: {
        success: true,
        meals: [
          {
            date: '20240311',
            breakfast: ['백미밥', '미역국'],
            lunch: ['현미밥', '김치찌개'],
            dinner: ['석식 정보가 없습니다.']
          }
        ]
      }
    }
  })
  async getWeeklyMeal() {
    const meals = await this.mealService.getWeeklyMeal();
    
    return {
      success: true,
      meals: meals.map(meal => ({
        date: meal.date,
        breakfast: meal.breakfast || ['조식 정보가 없습니다.'],
        lunch: meal.lunch || ['중식 정보가 없습니다.'],
        dinner: meal.dinner || ['석식 정보가 없습니다.'],
      })),
    };
  }
}