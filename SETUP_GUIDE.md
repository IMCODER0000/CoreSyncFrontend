# IT 애자일 서비스 설치 및 실행 가이드

## 🚀 빠른 시작

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하세요:

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일 내용:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 2. 의존성 설치 및 실행

```bash
# 의존성 설치 (이미 설치되어 있다면 생략)
npm install

# 개발 서버 실행
npm run dev
```

### 3. 애자일 서비스 접속

브라우저에서 다음 경로로 접속:
- **프로젝트 목록**: http://localhost:5173/agile/projects

## 📱 주요 기능 사용법

### 프로젝트 생성
1. `/agile/projects` 페이지 접속
2. "새 프로젝트" 버튼 클릭
3. 프로젝트 이름 입력 후 "생성" 클릭

### 애자일 보드 생성
1. 프로젝트 카드 클릭하여 상세 페이지 진입
2. "새 보드" 버튼 클릭
3. 보드 이름 입력 후 "생성" 클릭

### 칸반 티켓 생성
1. 애자일 보드 카드 클릭하여 칸반 보드 진입
2. "새 티켓" 버튼 클릭
3. 티켓 제목 입력 후 "생성" 클릭
4. 티켓은 자동으로 TODO 컬럼에 추가됩니다

## 🔐 인증 요구사항

이 서비스는 인증이 필요합니다. 다음 중 하나의 방법으로 로그인하세요:

1. **카카오 로그인**: `/auth/login` → 카카오 로그인
2. **GitHub 로그인**: `/auth/login` → GitHub 로그인

로그인 후 `localStorage`에 `userToken`이 저장되며, 모든 API 요청에 자동으로 포함됩니다.

## 🗂️ 페이지 구조

```
/agile/projects              → 프로젝트 목록
  ↓ (프로젝트 클릭)
/agile/project/:projectId    → 프로젝트 상세 (애자일 보드 목록)
  ↓ (보드 클릭)
/agile/board/:boardId        → 칸반 보드 (티켓 관리)
```

## 🎯 사이드바 메뉴

좌측 사이드바에서 "애자일 보드" 메뉴를 클릭하면 프로젝트 목록 페이지로 이동합니다.

## 🔧 백엔드 연동 확인사항

### 백엔드 서버가 실행 중인지 확인
```bash
# 백엔드 디렉토리에서
cd /Users/choehyeonsu/back/CoreSyncBackend
./gradlew bootRun
```

### API 엔드포인트 확인
- 백엔드 서버: http://localhost:8080
- 프로젝트 목록 API: http://localhost:8080/project/list
- 애자일 보드 API: http://localhost:8080/agile-board/read/:id
- 칸반 티켓 API: http://localhost:8080/kanban-ticket/register

## 🐛 문제 해결

### 1. "유효하지 않은 토큰입니다" 에러
**원인**: 로그인이 되어있지 않거나 토큰이 만료됨
**해결**: `/auth/login`으로 이동하여 재로그인

### 2. CORS 에러
**원인**: 백엔드 서버의 CORS 설정 문제
**해결**: 백엔드 서버의 CORS 설정에 `http://localhost:5173` 추가

### 3. "프로젝트 목록 로드 실패"
**원인**: 백엔드 서버가 실행되지 않았거나 API URL이 잘못됨
**해결**: 
- 백엔드 서버 실행 확인
- `.env` 파일의 `VITE_API_BASE_URL` 확인

### 4. 빈 화면만 표시됨
**원인**: 아직 생성된 프로젝트가 없음
**해결**: "새 프로젝트" 버튼을 클릭하여 첫 프로젝트 생성

## 📊 데이터 흐름

```
사용자 → 프론트엔드 → axiosInstance (토큰 자동 추가)
                          ↓
                    백엔드 API (인증 확인)
                          ↓
                    데이터베이스
                          ↓
                    응답 데이터
                          ↓
                    프론트엔드 UI 업데이트
```

## 🎨 UI 컴포넌트

- **Material-UI v7** 사용
- 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 다크 모드 준비 (향후 구현 예정)

## 📝 개발 참고사항

### API 호출 예시
```typescript
// 프로젝트 목록 조회
const projects = await projectApi.getProjectList(1, 10);

// 프로젝트 생성
const newProject = await projectApi.createProject({ title: '새 프로젝트' });

// 애자일 보드 생성
const newBoard = await agileBoardApi.createAgileBoard({
  projectId: 1,
  title: '스프린트 1'
});

// 칸반 티켓 생성
const newTicket = await kanbanTicketApi.createKanbanTicket({
  agileBoardId: 1,
  title: '로그인 기능 구현'
});
```

## 🚀 배포 준비

### 프로덕션 빌드
```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 환경 변수 (프로덕션)
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

## 📞 추가 지원

더 자세한 정보는 `AGILE_SERVICE_README.md` 파일을 참고하세요.
