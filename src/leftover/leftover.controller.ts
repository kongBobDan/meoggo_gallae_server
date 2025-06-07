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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LeftoverService } from './leftover.service';
import { CreateLeftoverRecordDto } from './dto/create-leftover-record.dto';

@Controller('leftover')
export class LeftoverController {
  constructor(private readonly leftoverService: LeftoverService) {}

  @Post('check')
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