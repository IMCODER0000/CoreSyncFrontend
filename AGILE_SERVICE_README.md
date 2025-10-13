# IT 애자일 서비스 가이드

## 📋 개요

백엔드 API를 기반으로 구축된 IT 애자일 프로젝트 관리 시스템입니다.

## 🏗️ 구조

### 주요 기능
1. **프로젝트 관리** - 프로젝트 생성, 목록 조회, 상세 보기
2. **애자일 보드** - 프로젝트별 애자일 보드 생성 및 관리
3. **칸반 티켓** - 티켓 생성 및 상태별 관리 (TODO, IN_PROGRESS, DONE)

### 디렉토리 구조
```
src/
├── api/                      # API 레이어
│   ├── axiosInstance.ts      # Axios 인스턴스 (인증 헤더 자동 추가)
│   ├── types.ts              # TypeScript 타입 정의
│   ├── projectApi.ts         # 프로젝트 API
│   ├── agileBoardApi.ts      # 애자일 보드 API
│   └── kanbanTicketApi.ts    # 칸반 티켓 API
│
└── agile/                    # 애자일 기능 모듈
    ├── pages/
    │   ├── ProjectListPage.tsx      # 프로젝트 목록
    │   ├── ProjectDetailPage.tsx    # 프로젝트 상세 (보드 목록)
    │   └── KanbanBoardPage.tsx      # 칸반 보드 (티켓 관리)
    └── routers/
        └── AgileRouter.tsx           # 애자일 라우터
```

## 🚀 시작하기

### 1. 환경 변수 설정

`.env` 파일을 생성하고 백엔드 API URL을 설정하세요:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 접근 경로

- **프로젝트 목록**: `/agile/projects`
- **프로젝트 상세**: `/agile/project/:projectId`
- **칸반 보드**: `/agile/board/:boardId`

## 📡 API 엔드포인트

### 프로젝트 API
- `GET /project/list` - 프로젝트 목록 조회
- `POST /project/register` - 프로젝트 생성
- `GET /project/read/:id` - 프로젝트 상세 조회

### 애자일 보드 API
- `POST /agile-board/register` - 애자일 보드 생성
- `GET /agile-board/read/:id` - 애자일 보드 상세 조회 (티켓 포함)

### 칸반 티켓 API
- `POST /kanban-ticket/register` - 칸반 티켓 생성

## 🔐 인증

모든 API 요청은 `Authorization` 헤더에 Bearer 토큰이 필요합니다.
토큰은 `localStorage`의 `userToken` 키에 저장됩니다.

```typescript
// axiosInstance가 자동으로 처리
headers: {
  Authorization: `Bearer ${localStorage.getItem('userToken')}`
}
```

## 🎨 UI/UX 특징

### 프로젝트 목록 페이지
- 그리드 레이아웃으로 프로젝트 카드 표시
- 프로젝트 생성 다이얼로그
- 빈 상태(Empty State) 처리

### 프로젝트 상세 페이지
- Breadcrumb 네비게이션
- 애자일 보드 목록
- 보드 생성 기능

### 칸반 보드 페이지
- 3개 컬럼 레이아웃 (TODO, IN_PROGRESS, DONE)
- 드래그 앤 드롭 준비 구조
- 티켓 우선순위 및 도메인 표시
- 실시간 티켓 카운트

## 🛠️ 기술 스택

- **React 19** + **TypeScript**
- **React Router v7** - 라우팅
- **Material-UI v7** - UI 컴포넌트
- **Axios** - HTTP 클라이언트
- **Vite** - 빌드 도구

## 📝 타입 정의

### 주요 타입
```typescript
// 프로젝트
interface Project {
  id: number;
  title: string;
  writer: { id: number; nickname: string };
  createDate: string;
  updateDate: string;
}

// 애자일 보드
interface AgileBoard {
  id: number;
  title: string;
  projectId: number;
  writer: { id: number; nickname: string };
  createDate: string;
  updateDate: string;
}

// 칸반 티켓
interface KanbanTicket {
  id: number;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  domain: TicketDomain;
  writer: { id: number; nickname: string };
  agileBoardId: number;
  createDate: string;
  updateDate: string;
}
```

## 🔄 향후 개선 사항

1. **드래그 앤 드롭** - 티켓 상태 변경을 위한 DnD 구현
2. **티켓 상세 모달** - 티켓 클릭 시 상세 정보 및 수정 기능
3. **필터링 & 검색** - 티켓 필터링 및 검색 기능
4. **실시간 업데이트** - WebSocket을 통한 실시간 동기화
5. **티켓 할당** - 팀원에게 티켓 할당 기능
6. **스프린트 관리** - 스프린트 생성 및 관리
7. **통계 대시보드** - 프로젝트 진행 상황 시각화

## 🐛 문제 해결

### 401 에러 발생 시
- `localStorage`에 `userToken`이 있는지 확인
- 토큰이 만료되었을 경우 재로그인 필요

### CORS 에러 발생 시
- 백엔드 서버의 CORS 설정 확인
- `.env` 파일의 API URL 확인

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.
