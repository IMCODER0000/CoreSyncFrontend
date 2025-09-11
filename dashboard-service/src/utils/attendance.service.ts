// src/utils/attendance.service.ts
// ---------------------------------------------------------
// ★ 이 파일 하나로 목업 ↔ 실서버 전환합니다.
//    - 기본은 MOCK(목업) 구현 활성화
//    - 백엔드 붙일 때 아래 지시에 따라 MOCK 블록을 삭제하고
//      REAL API 블록의 주석을 해제하면 됩니다.
// ---------------------------------------------------------

// (REAL 전환 시 사용) import { attendanceApi } from "./apiClient";

export type ShiftPayload = {
		at?: string;  // 서버에서 시간 찍으면 생략 가능
		lat?: number; // ★ GPS 위도
		lng?: number; // ★ GPS 경도
};
export type ShiftResponse = {
		id: string;
		clockInAt?: string;
		clockOutAt?: string;
		// [추가] 훅(useWorkTimer)에서 참조해도 타입 에러 안 나도록 선택 필드로 추가
		presentSeconds?: number;
};
export type TodaySummary = {
		presentSeconds: number; // 오늘 누적 근무(초)
		clockInAt?: string;
		clockOutAt?: string;
};

// =========================================================
// ================   MOCK (목업)  START   ==================
// 백엔드 연결 시, 이 블록 전체를 "삭제" 하세요.
// 그리고 아래 REAL API 블록의 주석을 "해제" 하세요.
// =========================================================
const MOCK_LATENCY = 200;

const LSK = {
		working: "demo:isWorking",
		clockInAt: "demo:clockInAt",
		lastClockOutAt: "demo:lastClockOutAt",
		lastLat: "demo:lastLat",
		lastLng: "demo:lastLng",
};

// [변경 없음] 출근
export async function startShift(payload: ShiftPayload): Promise<ShiftResponse> {
		return new Promise((resolve) => {
				setTimeout(() => {
						const nowIso = new Date().toISOString();
						localStorage.setItem(LSK.working, "1");
						localStorage.setItem(LSK.clockInAt, nowIso);
						if (payload.lat != null) localStorage.setItem(LSK.lastLat, String(payload.lat));
						if (payload.lng != null) localStorage.setItem(LSK.lastLng, String(payload.lng));
						resolve({
								id: `mock-${Date.now()}`,
								clockInAt: nowIso,
								presentSeconds: 0, // [추가] 출근 직후 누적 0초
						});
				}, MOCK_LATENCY);
		});
}

// [변경] 퇴근 시 presentSeconds 함께 계산해 반환
export async function stopShift(payload: ShiftPayload): Promise<ShiftResponse> {
		return new Promise((resolve) => {
				setTimeout(() => {
						const nowIso = new Date().toISOString();
						localStorage.setItem(LSK.working, "0");
						localStorage.setItem(LSK.lastClockOutAt, nowIso);
						if (payload.lat != null) localStorage.setItem(LSK.lastLat, String(payload.lat));
						if (payload.lng != null) localStorage.setItem(LSK.lastLng, String(payload.lng));

						// [추가] 출근 시간이 있으면 (퇴근 - 출근) 초 구해서 함께 반환
						const inIso = localStorage.getItem(LSK.clockInAt);
						let presentSeconds = 0;
						if (inIso) {
								presentSeconds = Math.max(
										0,
										Math.floor((new Date(nowIso).getTime() - new Date(inIso).getTime()) / 1000)
								);
						}

						resolve({
								id: `mock-${Date.now()}`,
								clockOutAt: nowIso,
								presentSeconds, // [추가]
						});
				}, MOCK_LATENCY);
		});
}

// [변경] 오늘 요약: 근무 중이 아니더라도 오늘 출/퇴근이 둘 다 있으면 누적 계산해서 반환
export async function getTodaySummary(): Promise<TodaySummary> {
		return new Promise((resolve) => {
				setTimeout(() => {
						const isWorking = localStorage.getItem(LSK.working) === "1";
						const clockInAt = localStorage.getItem(LSK.clockInAt) || undefined;
						const clockOutAt = localStorage.getItem(LSK.lastClockOutAt) || undefined;

						let presentSeconds = 0;
						if (isWorking && clockInAt) {
								// 근무 중: 지금까지 경과
								const diff = Math.floor((Date.now() - new Date(clockInAt).getTime()) / 1000);
								presentSeconds = Math.max(0, diff);
						} else if (clockInAt && clockOutAt) {
								// [추가] 근무 종료 상태: 오늘 출/퇴근 둘 다 있으면 해당 차이 반환
								const diff = Math.floor(
										(new Date(clockOutAt).getTime() - new Date(clockInAt).getTime()) / 1000
								);
								presentSeconds = Math.max(0, diff);
						}

						resolve({ presentSeconds, clockInAt, clockOutAt });
				}, MOCK_LATENCY);
		});
}

// (테스트 편의) 목업 상태 초기화
export function __mock_resetAttendance() {
		Object.values(LSK).forEach((k) => localStorage.removeItem(k));
}
// =================   MOCK (목업)  END   ===================
// =========================================================


/* =========================================================
===================   REAL API  (주석 해제)  ===============
백엔드 연결 시, 위의 MOCK 블록을 "삭제"하고
아래 주석을 "전부 해제"하세요.

⚠️ 서버 응답에 'presentSeconds'가 없다면, 프론트 훅이 직접 계산하므로
   없어도 동작합니다. 있으면 그대로 사용합니다.
=========================================================

export async function startShift(payload: ShiftPayload) {
  const { data } = await attendanceApi.post<ShiftResponse>("/attendance/clock-in", payload);
  return data;
}

export async function stopShift(payload: ShiftPayload) {
  const { data } = await attendanceApi.post<ShiftResponse>("/attendance/clock-out", payload);
  return data;
}

export async function getTodaySummary() {
  const { data } = await attendanceApi.get<TodaySummary>("/attendance/today");
  return data;
}

========================================================= */
