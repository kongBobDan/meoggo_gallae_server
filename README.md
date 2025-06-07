학교 급식 잔반 관리 시스템
학교에서 급식 잔반을 줄이고, 급식 메뉴를 민주적으로 결정하기 위한 내부 시스템입니다.
주요 기능
1. 사용자 인증
간단한 반/번호 입력으로 로그인
별도의 회원가입 과정 없음
2. 잔반량 통계
개인별 잔반량 통계 (적게/적당히/많이 남긴 날)
AI 이미지 분석을 통한 객관적 측정
3. 급식 메뉴 월드컵
토너먼트 방식의 급식 메뉴 투표
메뉴별 승률과 순위 통계
음식 이미지와 함께 투표 진행
4. 오늘의 잔반량 체크
사진 업로드를 통한 AI 잔반량 분석
실시간 분석 결과 제공
5. 급식 정보 조회
나이스 Open API를 통한 실시간 급식 정보
아침/점심/저녁 급식 메뉴 제공
주간 급식 일정 조회
기술 스택
Backend: NestJS, TypeScript
Database: PostgreSQL, TypeORM
File Upload: Multer
External API: NEIS Open API (급식 정보)
AI Integration: Custom AI Server (이미지 분석)
설치 및 실행
1. 환경 설정
bash
# 저장소 클론
git clone <repository-url>
cd school-meal-management

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 열어 실제 값으로 수정
2. 데이터베이스 설정
bash
# PostgreSQL 설치 및 데이터베이스 생성
createdb school_meal
3. 실행
bash
# 개발 모드 실행
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
API 엔드포인트
사용자 관리
POST /user/login - 사용자 로그인/생성
GET /user/:id/stats - 사용자 잔반 통계
잔반 관리
POST /leftover/check - 잔반량 체크 (이미지 업로드)
GET /leftover/history/:userId - 잔반 기록 조회
GET /leftover/today/:userId - 오늘의 잔반 기록
토너먼트
POST /tournament/food - 음식 아이템 등록
GET /tournament/foods - 모든 음식 목록
GET /tournament/round - 토너먼트 라운드 데이터
POST /tournament/vote - 투표하기
GET /tournament/food/:id/stats - 음식별 통계
GET /tournament/leaderboard - 리더보드
급식 정보
GET /meal/today - 오늘의 급식
GET /meal/date?date=YYYYMMDD - 특정 날짜 급식
GET /meal/week - 주간 급식 일정
환경변수 설명
bash
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=school_meal

# AI 서버 설정
AI_SERVER_URL=http://your-ai-server:5000/analyze-leftover

# 나이스 Open API 설정
NEIS_API_KEY=your_api_key
SCHOOL_CODE=your_school_code
OFFICE_CODE=your_office_code
AI 서버 연동
잔반량 분석을 위한 AI 서버가 필요합니다. AI 서버는 다음 형식으로 응답해야 합니다:
json
{
  "leftover_level": "low|medium|high",
  "confidence": 0.95
}
개발 참고사항
디렉토리 구조
src/
├── user/           # 사용자 관리
├── leftover/       # 잔반 관리
├── tournament/     # 토너먼트
├── meal/          # 급식 정보
└── main.ts        # 애플리케이션 진입점
주요 특징
TypeORM을 사용한 데이터베이스 관리
파일 업로드를 위한 Multer 설정
외부 API 연동 (나이스 Open API)
AI 서버와의 HTTP 통신
간단한 인증 시스템
라이센스
이 프로젝트는 학교 내부 사용을 위한 프로젝트입니다.
