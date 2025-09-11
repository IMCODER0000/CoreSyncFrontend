// src/utils/leave.service.ts
// ---------------------------------------------------------
// ✅ 지금은 MOCK(목업) 활성화 상태
//    - getLeaveSummary(): 총연차/사용연차/잔여연차 요약 반환
// 🔁 백엔드 연결 시
//    1) 아래 MOCK START ~ END 블록 "삭제"
//    2) REAL API 블록의 주석 "해제"
//    3) apiClient.ts 의 leaveApi baseURL/인증만 맞추면 끝
// ---------------------------------------------------------

// (REAL 전환 시 사용) import { leaveApi } from "./apiClient";

export type LeaveSummary = {
    totalDays: number;   // 총연차
    usedDays: number;    // 사용연차
    remainDays: number;  // 잔여연차
};

/* =========================================================
====================   MOCK  START   =======================
백엔드 붙일 때, 이 블록을 전부 "삭제"하세요.
그리고 아래 REAL API 블록의 주석을 "해제"하세요.
========================================================= */

// 목업 상태값 (테스트 시 아래 조작기 함수로 자유롭게 변경)
let __mock_totalDays = 15;
let __mock_usedDays = 9;

export async function getLeaveSummary(): Promise<LeaveSummary> {
    // 네트워크 지연 느낌만 살짝
    await new Promise((r) => setTimeout(r, 150));
    const total = asInt(__mock_totalDays);
    const used = clamp(asInt(__mock_usedDays), 0, total);
    return { totalDays: total, usedDays: used, remainDays: total - used };
}

// 테스트 편의 목업 조작기 (선택)
export function __mock_setLeave(next: Partial<LeaveSummary>) {
    if (typeof next.totalDays === "number") __mock_totalDays = asInt(next.totalDays);
    if (typeof next.usedDays === "number") __mock_usedDays = asInt(next.usedDays);
}
/* ====================   MOCK  END   ====================== */


/* =========================================================
====================   REAL API (주석 해제)  ================
백엔드 연결 시, 위의 MOCK 블록을 "삭제"하고
아래 주석을 "전부 해제"하세요.
=========================================================

type ApiLeaveSummary =
  | LeaveSummary
  | {
      total?: number; used?: number; remaining?: number;
      totalDays?: number; usedDays?: number; remainDays?: number;
      remainingDays?: number;
    };

export async function getLeaveSummary(opts?: { signal?: AbortSignal }): Promise<LeaveSummary> {
  const { data } = await leaveApi.get<ApiLeaveSummary>("/leave/summary/me", {
    signal: opts?.signal,
    withCredentials: true,
  });
  return normalizeLeaveSummary(data);
}

function normalizeLeaveSummary(raw?: ApiLeaveSummary | null): LeaveSummary {
  const total = pickNumber(raw, ["totalDays", "total"], 0);
  const used = pickNumber(raw, ["usedDays", "used"], 0);
  const remain = pickNumber(raw, ["remainDays", "remainingDays", "remaining"], total - used);

  const t = asInt(total);
  const u = clamp(asInt(used), 0, t);
  const r = clamp(asInt(remain), 0, t);
  return { totalDays: t, usedDays: u, remainDays: r };
}

function pickNumber(obj: any, keys: string[], fallback: number) {
  for (const k of keys) {
    const v = Number(obj?.[k]);
    if (Number.isFinite(v)) return v;
  }
  return fallback;
}

========================================================= */

// ---- 공용 유틸 (필요하면 다른 곳으로 이동해도 OK) ----
function asInt(n: unknown): number {
    const v = Number(n);
    return Number.isFinite(v) ? Math.round(v) : 0;
}
function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}
