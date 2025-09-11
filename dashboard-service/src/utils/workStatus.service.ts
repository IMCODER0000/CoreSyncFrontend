// ---------------------------------------------------------
//  MOCK(목업)
//    - getWorkStatusList(): 근무현황 리스트(필터 적용)
//  백엔드 연결 시
//    1) 아래 MOCK START ~ END 블록 "삭제"
//    2) REAL API 블록의 주석 "해제"
//    3) apiClient.ts 의 workApi baseURL/인증만 맞추면 끝
// ---------------------------------------------------------

// (REAL 전환 시 사용) import { workApi } from "./apiClient";

// [KEEP] 타입 이름/값 고정
export type WorkDept =
    | "ALL"
    | "HR"
    | "SALES"
    | "BACKEND"
    | "FRONTEND"
    | "DESIGN";

export type WorkStatus = "WORKING" | "EXTERNAL" | "LEAVE"; // 출근/외근/연차

// [KEEP] 카드/서비스 공용 아이템 타입
export type WorkStatusItem = {
    id: string;
    name: string;
    role: string;        // 직함
    message: string;     // 상태 메시지
    status: WorkStatus;  // WORKING | EXTERNAL | LEAVE
    dept: WorkDept;      // 부서
    date: string;        // YYYY-MM-DD
};

// [KEEP] 요청 필터
export type WorkStatusFilter = {
    dept: WorkDept;        // "ALL" 포함
    category: WorkStatus;  // 상태(출근/외근/연차)
    date?: string;         // 기본: 오늘
    query?: string;        // 이름/직함/메시지 검색
};

/* =========================================================
====================   MOCK  START   =======================
백엔드 붙일 때, 삭제
REAL API 블록의 주석을 해제
========================================================= */
const todayISO = () => new Date().toISOString().slice(0, 10);
const D = todayISO();

// FRONTEND 8
const FE: WorkStatusItem[] = [
    { id: "fe-1", name: "박태준", role: "과장", message: "리팩터링 진행 중", status: "WORKING", dept: "FRONTEND", date: D },
    { id: "fe-2", name: "서민재", role: "사원", message: "스토리북 보강", status: "WORKING", dept: "FRONTEND", date: D },
    { id: "fe-3", name: "이승현", role: "대리", message: "테이블 가상 스크롤", status: "WORKING", dept: "FRONTEND", date: D },
    { id: "fe-4", name: "전지연", role: "대리", message: "디자인 시스템 적용", status: "WORKING", dept: "FRONTEND", date: D },
    { id: "fe-5", name: "정하윤", role: "사원", message: "검색 UX 미세조정", status: "WORKING", dept: "FRONTEND", date: D },
    { id: "fe-6", name: "김지우", role: "주임", message: "고객사 미팅(원격)", status: "EXTERNAL", dept: "FRONTEND", date: D },
    { id: "fe-7", name: "배진아", role: "사원", message: "오전 반차", status: "LEAVE", dept: "FRONTEND", date: D },
    { id: "fe-8", name: "이나래", role: "사원", message: "버그 재현 중", status: "WORKING", dept: "FRONTEND", date: D },
];

// BACKEND 8
const BE: WorkStatusItem[] = [
    { id: "be-1", name: "김도현", role: "과장", message: "API 캐시 튜닝", status: "WORKING", dept: "BACKEND", date: D },
    { id: "be-2", name: "이준호", role: "대리", message: "배치 스케줄 조정", status: "WORKING", dept: "BACKEND", date: D },
    { id: "be-3", name: "박서준", role: "주임", message: "DB 인덱스 점검", status: "WORKING", dept: "BACKEND", date: D },
    { id: "be-4", name: "최민수", role: "사원", message: "테스트 코드 보강", status: "WORKING", dept: "BACKEND", date: D },
    { id: "be-5", name: "강하늘", role: "사원", message: "서버 자원 모니터링", status: "WORKING", dept: "BACKEND", date: D },
    { id: "be-6", name: "오지훈", role: "대리", message: "IDC 점검(외근)", status: "EXTERNAL", dept: "BACKEND", date: D },
    { id: "be-7", name: "윤다은", role: "사원", message: "연차 사용", status: "LEAVE", dept: "BACKEND", date: D },
    { id: "be-8", name: "장우진", role: "사원", message: "로그 적재 최적화", status: "WORKING", dept: "BACKEND", date: D },
];

// HR 8
const HR: WorkStatusItem[] = [
    { id: "hr-1", name: "김가영", role: "대리", message: "근태 집계", status: "WORKING", dept: "HR", date: D },
    { id: "hr-2", name: "이수민", role: "사원", message: "채용 공고 등록", status: "WORKING", dept: "HR", date: D },
    { id: "hr-3", name: "박정현", role: "사원", message: "서류 검토", status: "WORKING", dept: "HR", date: D },
    { id: "hr-4", name: "최유리", role: "주임", message: "면접 일정 조율", status: "WORKING", dept: "HR", date: D },
    { id: "hr-5", name: "한지원", role: "사원", message: "교육 자료 배포", status: "WORKING", dept: "HR", date: D },
    { id: "hr-6", name: "서가흔", role: "대리", message: "노무사 상담(외근)", status: "EXTERNAL", dept: "HR", date: D },
    { id: "hr-7", name: "오세린", role: "사원", message: "오전 반차", status: "LEAVE", dept: "HR", date: D },
    { id: "hr-8", name: "윤하늘", role: "사원", message: "복지 포인트 정산", status: "WORKING", dept: "HR", date: D },
];

// SALES 8
const SALES: WorkStatusItem[] = [
    { id: "sa-1", name: "정민호", role: "과장", message: "제안서 작성", status: "WORKING", dept: "SALES", date: D },
    { id: "sa-2", name: "박소연", role: "대리", message: "견적 산출", status: "WORKING", dept: "SALES", date: D },
    { id: "sa-3", name: "최강민", role: "사원", message: "고객 응대", status: "WORKING", dept: "SALES", date: D },
    { id: "sa-4", name: "이예린", role: "사원", message: "마케팅 협의", status: "WORKING", dept: "SALES", date: D },
    { id: "sa-5", name: "배서윤", role: "주임", message: "리드 분석", status: "WORKING", dept: "SALES", date: D },
    { id: "sa-6", name: "고현수", role: "대리", message: "고객사 미팅(외근)", status: "EXTERNAL", dept: "SALES", date: D },
    { id: "sa-7", name: "문지호", role: "사원", message: "연차", status: "LEAVE", dept: "SALES", date: D },
    { id: "sa-8", name: "서민경", role: "사원", message: "계약 프로세스 점검", status: "WORKING", dept: "SALES", date: D },
];

// DESIGN 8
const DESIGN: WorkStatusItem[] = [
    { id: "de-1", name: "문수현", role: "과장", message: "디자인 QA", status: "WORKING", dept: "DESIGN", date: D },
    { id: "de-2", name: "이예진", role: "대리", message: "아이콘 최적화", status: "WORKING", dept: "DESIGN", date: D },
    { id: "de-3", name: "박다영", role: "사원", message: "색상 토큰 정리", status: "WORKING", dept: "DESIGN", date: D },
    { id: "de-4", name: "장민지", role: "사원", message: "반응형 점검", status: "WORKING", dept: "DESIGN", date: D },
    { id: "de-5", name: "손서윤", role: "주임", message: "일러스트 업데이트", status: "WORKING", dept: "DESIGN", date: D },
    { id: "de-6", name: "최지훈", role: "사원", message: "촬영 지원(외근)", status: "EXTERNAL", dept: "DESIGN", date: D },
    { id: "de-7", name: "강민아", role: "사원", message: "오후 반차", status: "LEAVE", dept: "DESIGN", date: D },
    { id: "de-8", name: "홍유림", role: "사원", message: "모션 가이드 정리", status: "WORKING", dept: "DESIGN", date: D },
];

// ALL = 전부 합치기
const MOCK: WorkStatusItem[] = [...FE, ...BE, ...HR, ...SALES, ...DESIGN];

/** [KEEP] 서비스 함수 이름/시그니처 고정 */
export async function getWorkStatusList(
    filter: WorkStatusFilter
): Promise<WorkStatusItem[]> {
    const { dept, category, date = todayISO(), query } = filter;

    // 날짜/상태 우선 필터
    let list = MOCK.filter((x) => x.date === date && x.status === category);

    // 부서 필터
    if (dept !== "ALL") list = list.filter((x) => x.dept === dept);

    // 검색 필터
    if (query && query.trim()) {
        const q = query.trim();
        list = list.filter(
            (x) =>
                x.name.includes(q) ||
                x.role.includes(q) ||
                x.message.includes(q)
        );
    }

    // 가벼운 네트워크 지연 흉내
    await new Promise((r) => setTimeout(r, 120));
    return list;
}
/* ====================   MOCK  END   ====================== */


/* =========================================================
====================   REAL API (주석 해제)  ================
// [REAL] 서버 합류 시 아래 블록 주석 해제, MOCK 블록 삭제
// export async function getWorkStatusList(
//   filter: WorkStatusFilter
// ): Promise<WorkStatusItem[]> {
//   const { dept, category, date = new Date().toISOString().slice(0, 10), query } = filter;
//   const { data } = await workApi.get<WorkStatusItem[]>("/work-status", {
//     params: { dept, category, date, query },
//     withCredentials: true,
//   });
//   return data;
// }
========================================================= */
