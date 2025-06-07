import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeftoverRecord, LeftoverLevel } from './leftover-record.entity';
import { CreateLeftoverRecordDto } from './dto/create-leftover-record.dto';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class LeftoverService {
  constructor(
    @InjectRepository(LeftoverRecord)
    private leftoverRepository: Repository<LeftoverRecord>,
  ) {}

  async analyzeLeftoverWithAI(imagePath: string): Promise<{ level: LeftoverLevel; confidence: number }> {
    try {
      // AI 서버로 이미지 전송 (예시 구현)
      // 실제로는 여러분의 AI 서버 URL을 사용하세요
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));

      const response = await axios.post(
        process.env.AI_SERVER_URL || 'http://localhost:5000/analyze-leftover',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 30000,
        }
      );

      const { leftover_level, confidence } = response.data;
      
      // AI 서버 응답을 우리 enum으로 변환
      let level: LeftoverLevel;
      switch (leftover_level.toLowerCase()) {
        case 'low':
          level = LeftoverLevel.LOW;
          break;
        case 'medium':
          level = LeftoverLevel.MEDIUM;
          break;
        case 'high':
          level = LeftoverLevel.HIGH;
          break;
        default:
          level = LeftoverLevel.MEDIUM;
      }

      return { level, confidence };
    } catch (error) {
      console.error('AI 분석 중 오류 발생:', error);
      // AI 서버 연결 실패 시 기본값 반환
      return { level: LeftoverLevel.MEDIUM, confidence: 0.5 };
    }
  }

  async createLeftoverRecord(
    createDto: CreateLeftoverRecordDto,
    imagePath: string,
  ): Promise<LeftoverRecord> {
    const { userId, recordDate } = createDto;

    // 같은 날짜에 이미 기록이 있는지 확인
    const existingRecord = await this.leftoverRepository.findOne({
      where: {
        userId,
        recordDate: new Date(recordDate),
      },
    });

    if (existingRecord) {
      // 기존 기록 업데이트
      const aiResult = await this.analyzeLeftoverWithAI(imagePath);
      
      existingRecord.imagePath = imagePath;
      existingRecord.leftoverLevel = aiResult.level;
      existingRecord.aiConfidence = aiResult.confidence;
      
      return await this.leftoverRepository.save(existingRecord);
    }

    // AI로 이미지 분석
    const aiResult = await this.analyzeLeftoverWithAI(imagePath);

    const record = this.leftoverRepository.create({
      userId,
      recordDate: new Date(recordDate),
      imagePath,
      leftoverLevel: aiResult.level,
      aiConfidence: aiResult.confidence,
    });

    return await this.leftoverRepository.save(record);
  }

  async getUserLeftoverHistory(userId: number): Promise<LeftoverRecord[]> {
    return await this.leftoverRepository.find({
      where: { userId },
      order: { recordDate: 'DESC' },
    });
  }

  async getTodayRecord(userId: number): Promise<LeftoverRecord | null> {
    const today = new Date().toISOString().split('T')[0];
    
    return await this.leftoverRepository.findOne({
      where: {
        userId,
        recordDate: new Date(today),
      },
    });
  }
}