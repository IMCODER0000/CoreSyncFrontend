// src/utils/luckyDraw.service.ts
// ---------------------------------------------------------
// MOCK(목업) 활성화 상태
//    - spinLuckyDraw(): 오늘 1회 제한, 로컬에서 랜덤 당첨 저장
//    - canSpinToday(): 오늘 참여 가능 여부
//    - getLastResult(): 마지막 당첨 내역
// 백엔드 연결 시
//    1) 아래 MOCK START ~ END 블록 "삭제"
//    2) REAL API 블록의 주석 "해제"
//    3) apiClient.ts 의 baseURL/인증만 맞추면 끝
// ---------------------------------------------------------

// (REAL 전환 시 사용) import { dashboardApi } from "./apiClient";

// ====== 공통 타입/유틸 ======
export type SpinResult = {
    date: string;          // YYYY-MM-DD
    prize: string;         // 당첨 상품명
    index?: number;        // (선택) 당첨 인덱스
};

export const DEFAULT_PRIZES = [
    "요기요 3,000",
    "배민 5,000",
    "이모티콘",
    "CU 1,000",
    "스타벅스 1만",
    "커피 1잔",
] as const;

const STORAGE_KEY = "lucky:last_result_v1";

// 오늘 날짜
export function todayStr(d: Date = new Date()): string {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${dd}`;
}

// 2025년 9월 10일
export function toKoreanDateStr(d: Date): string {
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 마지막 당첨 결과 조회
export function getLastResult(): SpinResult | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as SpinResult;
    } catch {
        return null;
    }
}

// 결과 저장(컴포넌트에서 직접 저장할 때도 사용)
export function saveResult(r: SpinResult) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
}

// 오늘 참여 가능한지
export function canSpinToday(): boolean {
    const last = getLastResult();
    return last?.date !== todayStr();
}

// 가중치 기반 인덱스 선택(현재는 동일 가중치)
//  - 컴포넌트 쪽에서 클라이언트 회전만 할 때도 재사용 가능
export function spinIndexByWeight(length: number, weights?: number[]): number {
    if (!weights || weights.length !== length) {
        // 균등
        return Math.floor(Math.random() * length);
    }
    const sum = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * sum;
    for (let i = 0; i < length; i++) {
        if (r < weights[i]) return i;
        r -= weights[i];
    }
    return length - 1;
}

/* =========================================================
====================   MOCK  START   =======================
백엔드 붙일 때, 이 블록을 전부 "삭제"
아래 REAL API 블록의 주석을 "해제"
========================================================= */
function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

/**
 * 목업 스핀: 오늘 1회만 가능, 랜덤 당첨 → localStorage 저장 후 반환
 * @param prizes 화면의 룰렛 항목(없으면 기본값)
 * @param weights 각 항목 가중치(선택)
 */
export async function spinLuckyDraw(
    prizes: readonly string[] = DEFAULT_PRIZES,
    weights?: number[]
): Promise<SpinResult> {
    // 약간의 지연(로딩 느낌)
    await sleep(150);

    // 이미 참여했다면 마지막 결과를 그대로 반환
    const today = todayStr();
    const last = getLastResult();
    if (last?.date === today) return last;

    const idx = spinIndexByWeight(prizes.length, weights);
    const prize = prizes[idx];

    const res: SpinResult = { date: today, prize, index: idx };
    saveResult(res);
    return res;
}
/* ====================   MOCK  END   ====================== */


/* =========================================================
====================   REAL API (주석 해제)  ================
사용법:
  1) 위 MOCK 블록 삭제
  2) 아래 주석 해제
  3) apiClient.ts 의 dashboardApi 설정 맞추기

export async function spinLuckyDraw(
  prizes?: readonly string[],
  weights?: number[]
): Promise<SpinResult> {
  const { data } = await dashboardApi.post<SpinResult>(
    "/lucky-draw/spin",
    { prizes, weights },
    { withCredentials: true }
  );
  // 백엔드가 오늘 1회 제한을 보장한다면 아래 저장은 유지해도 무방
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}
========================================================= */
