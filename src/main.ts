import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // 전역 Validation Pipe 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('학교 급식 잔반 관리 시스템')
    .setDescription('급식 잔반을 줄이고 급식 메뉴를 민주적으로 결정하기 위한 API')
    .setVersion('1.0')
    .addTag('user', '사용자 관리')
    .addTag('leftover', '잔반 관리')
    .addTag('tournament', '급식 메뉴 월드컵')
    .addTag('meal', '급식 정보')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: '급식 관리 시스템 API',
  });
  
  // Docker 환경에서 0.0.0.0으로 바인딩
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server is running on http://0.0.0.0:${port}`);
  console.log(`Swagger API Documentation: http://0.0.0.0:${port}/api`);
}
bootstrap();