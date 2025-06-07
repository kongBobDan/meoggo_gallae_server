import { Controller, Get, Query } from '@nestjs/common';
import { MealService } from './meal.service';

@Controller('meal')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Get('today')
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