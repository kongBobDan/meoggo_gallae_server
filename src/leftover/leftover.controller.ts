import { 
  Controller, 
  Post, 
  Body, 
  UseInterceptors, 
  UploadedFile, 
  Get, 
  Param,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LeftoverService } from './leftover.service';
import { CreateLeftoverRecordDto } from './dto/create-leftover-record.dto';

@ApiTags('leftover')
@Controller('leftover')
export class LeftoverController {
  constructor(private readonly leftoverService: LeftoverService) {}

  @Post('check')
  @ApiOperation({ 
    summary: '잔반량 체크',
    description: '사진을 업로드하여 AI로 잔반량을 분석합니다.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ 
    status: 201, 
    description: '잔반량 분석 완료',
    schema: {
      example: {
        success: true,
        record: {
          id: 1,
          recordDate: '2024-03-15',
          leftoverLevel: 'LOW',
          aiConfidence: 0.85,
          imagePath: '/uploads/leftover/abc123.jpg'
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/leftover',
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
  async checkLeftover(
    @Body() createDto: CreateLeftoverRecordDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('이미지 파일이 필요합니다');
    }

    const record = await this.leftoverService.createLeftoverRecord(
      createDto,
      file.path,
    );

    return {
      success: true,
      record: {
        id: record.id,
        recordDate: record.recordDate,
        leftoverLevel: record.leftoverLevel,
        aiConfidence: record.aiConfidence,
        imagePath: `/uploads/leftover/${file.filename}`,
      },
    };
  }

  @Get('history/:userId')
  @ApiOperation({ 
    summary: '잔반 기록 조회',
    description: '사용자의 잔반 기록 히스토리를 조회합니다.'
  })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '기록 조회 성공',
    schema: {
      example: {
        success: true,
        history: [
          {
            id: 1,
            recordDate: '2024-03-15',
            leftoverLevel: 'LOW',
            aiConfidence: 0.85,
            imagePath: '/uploads/leftover/abc123.jpg'
          }
        ]
      }
    }
  })
  async getHistory(@Param('userId') userId: number) {
    const history = await this.leftoverService.getUserLeftoverHistory(userId);
    
    return {
      success: true,
      history: history.map(record => ({
        id: record.id,
        recordDate: record.recordDate,
        leftoverLevel: record.leftoverLevel,
        aiConfidence: record.aiConfidence,
        imagePath: record.imagePath.replace('./uploads', '/uploads'),
      })),
    };
  }

  @Get('today/:userId')
  @ApiOperation({ 
    summary: '오늘의 잔반 기록 조회',
    description: '사용자의 오늘 잔반 기록을 조회합니다.'
  })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '오늘 기록 조회 성공' 
  })
  async getTodayRecord(@Param('userId') userId: number) {
    const record = await this.leftoverService.getTodayRecord(userId);
    
    return {
      success: true,
      record: record ? {
        id: record.id,
        recordDate: record.recordDate,
        leftoverLevel: record.leftoverLevel,
        aiConfidence: record.aiConfidence,
        imagePath: record.imagePath.replace('./uploads', '/uploads'),
      } : null,
    };
  }
}