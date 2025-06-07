import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface MealInfo {
  breakfast?: string[];
  lunch?: string[];
  dinner?: string[];
  date: string;
}

@Injectable()
export class MealService {
  private readonly apiKey = process.env.NEIS_API_KEY; // 나이스 Open API 키
  private readonly schoolCode = process.env.SCHOOL_CODE; // 학교 코드
  private readonly officeCode = process.env.OFFICE_CODE; // 교육청 코드

  async getTodayMeal(): Promise<MealInfo> {
    const today = new Date();
    const dateStr = this.formatDate(today);
    
    return await this.getMealByDate(dateStr);
  }

  async getMealByDate(date: string): Promise<MealInfo> {
    try {
      const url = `https://open.neis.go.kr/hub/mealServiceDietInfo`;
      const params = {
        KEY: this.apiKey,
        Type: 'json',
        pIndex: 1,
        pSize: 100,
        ATPT_OFCDC_SC_CODE: this.officeCode,
        SD_SCHUL_CODE: this.schoolCode,
        MLSV_YMD: date,
      };

      const response = await axios.get(url, { params });
      
      if (!response.data.mealServiceDietInfo) {
        return {
          date,
          breakfast: null,
          lunch: null,
          dinner: null,
        };
      }

      const meals = response.data.mealServiceDietInfo[1].row;
      const result: MealInfo = { date };

      meals.forEach((meal: any) => {
        const dishes = meal.DDISH_NM
          .replace(/<br\/>/g, '\n')
          .split('\n')
          .map((dish: string) => dish.trim())
          .filter((dish: string) => dish.length > 0);

        switch (meal.MMEAL_SC_NM) {
          case '조식':
            result.breakfast = dishes;
            break;
          case '중식':
            result.lunch = dishes;
            break;
          case '석식':
            result.dinner = dishes;
            break;
        }
      });

      return result;
    } catch (error) {
      console.error('급식 정보 조회 중 오류 발생:', error);
      
      // API 오류 시 기본값 반환
      return {
        date,
        breakfast: null,
        lunch: null,
        dinner: null,
      };
    }
  }

  async getWeeklyMeal(): Promise<MealInfo[]> {
    const today = new Date();
    const weekMeals: MealInfo[] = [];

    // 이번 주 월요일부터 금요일까지
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);

    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = this.formatDate(date);
      
      const meal = await this.getMealByDate(dateStr);
      weekMeals.push(meal);
    }

    return weekMeals;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  // 급식 정보가 없을 때 표시할 기본 메시지
  private getNoMealMessage(mealType: string): string[] {
    return [`${mealType} 급식 정보가 없습니다.`];
  }
}