
// ---------------------------------------------------------
// ✅ 지금은 MOCK(목업) 활성화 상태
//    - getUserProfile(): 사용자 프로필(이름/팀/상태/아바타)
//    - getMonthSummary(): 월간 출근 요약(출근일수/총 일수)
// 🔁 백엔드 연결 시
//    1) 아래 MOCK START ~ END 블록 "삭제"
//    2) REAL API 블록의 주석 "해제"
//    3) apiClient.ts 의 profileApi baseURL/인증만 맞추면 끝
// ---------------------------------------------------------

// (REAL 전환 시 사용) import { profileApi } from "./apiClient";

export type UserProfile = {
		id: string;
		name: string;
		team?: string;
		statusMessage?: string;
		avatarUrl?: string;
		email?: string;
		role?: "EMP" | "LEAD" | "HR" | "ADMIN";
};

export type MonthSummary = {
		presentDays: number;
		totalDays: number;
};

/** 이번 달 총 일수 계산 */
function daysInThisMonth() {
		const d = new Date();
		return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/* =========================================================
====================   MOCK  START   =======================
백엔드 붙일 때, 이 블록을 전부 "삭제"하세요.
그리고 아래 REAL API 블록의 주석을 "해제"하세요.
========================================================= */

// 사용자 목업 (원하면 __mock_setUser 로 테스트 값 변경)
let __mock_user: UserProfile = {
		id: "u-001",
		name: "배진아",
		team: "프론트엔드팀",
		statusMessage: "출근 중 ☕",
		// 로컬 이미지가 없다면 빈 값 유지(아바타 영역은 자동 회색 배경)
		avatarUrl: "",
		email: "baejina@example.com",
		role: "EMP",
};

// 월간 출근 목업
let __mock_present = 15;

export async function getUserProfile(): Promise<UserProfile> {
		// 네트워크 느낌만 살짝
		await new Promise((r) => setTimeout(r, 150));
		return { ...__mock_user };
}

export async function getMonthSummary(): Promise<MonthSummary> {
		await new Promise((r) => setTimeout(r, 150));
		return { presentDays: __mock_present, totalDays: daysInThisMonth() };
}

// 테스트 편의 목업 조작기
export function __mock_setUser(next: Partial<UserProfile>) {
		__mock_user = { ...__mock_user, ...next };
}
export function __mock_setPresentDays(n: number) {
		__mock_present = n;
}
/* ====================   MOCK  END   ====================== */


/* =========================================================
====================   REAL API (주석 해제)  ================
백엔드 연결 시, 위의 MOCK 블록을 "삭제"하고
아래 주석을 "전부 해제"하세요.
=========================================================

export async function getUserProfile(): Promise<UserProfile> {
  const { data } = await profileApi.get<UserProfile>("/profile/me");
  return data;
}

export async function getMonthSummary(): Promise<MonthSummary> {
  const { data } = await profileApi.get<MonthSummary>("/profile/month-summary");
  return data;
}

========================================================= */
