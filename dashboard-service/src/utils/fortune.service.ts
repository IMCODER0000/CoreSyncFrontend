// ---------------------------------------------------------
// MOCK(목업) 활성화 상태
// getTodayFortune(): 오늘의 운세 1건
// REAL 연결 시: MOCK 블록 삭제 → REAL 블록 주석 해제 → apiClient 설정
// ---------------------------------------------------------

// (REAL 전환 시 사용) import { fortuneApi } from "./apiClient";

import GiftImg from "../assets/Icons/Gift_perspective_matte.png";        // 🎁
import TargetImg from "../assets/Icons/Target_perspective_matte.png";    // 🎯
import LightBulbImg from "../assets/Icons/Light_bulb_perspective_matte.png"; // 💡
import LikeImg from "../assets/Icons/Like_perspective_matte.png";        // 👍

export type FortuneCategories = { work?: number; love?: number; money?: number; health?: number; };

export type FortuneData = {
    date: string;
    score: number;     // 0~100
    short: string;
    detail: string;
    luckyColor?: string;
    luckyItem?: string;
    luckyNumber?: number;
    zodiac?: string;
    categories?: FortuneCategories;

    // 번들된 파일 URL(string) 이 들어옵니다 (asset/resource)
    decoRightUrl?: string;
    decoLeftUrl?: string;
};

export type FortuneRequest = { date?: string };
export type FortuneResponse = { item: FortuneData };

/* =========================================================
====================   MOCK  START   =======================
백엔드 붙일 때, 이 블록을 전부 "삭제"
아래 REAL API 블록의 주석을 "해제"
========================================================= */
const today = toDateStr(new Date());
const __mock_fortune_byDate: Record<string, FortuneData> = {
    [today]: {
        date: today,
        score: 92,
        short: "소신껏 일에 전념하는 당신에게 오늘 큰 행운이 올 거예요.",
        detail:
            "주도적으로 움직일수록 운이 붙습니다. 중요한 결정을 미루지 마세요.\n" +
            "동료의 제안을 유심히 듣다 보면 생각지 못한 실마리를 얻습니다. 오후에는 가벼운 산책이 머리를 맑게 해 줄 거예요.",
        luckyColor: "indigo",
        luckyItem: "메모장",
        luckyNumber: 3,
        zodiac: "처녀자리",
        categories: { work: 90, love: 70, money: 65, health: 80 },

        decoRightUrl: TargetImg,
        decoLeftUrl: LightBulbImg,
    },
};

export async function getTodayFortune(
    req: FortuneRequest = {}
): Promise<FortuneResponse> {
    await sleep(200);
    const key = req.date ?? toDateStr(new Date());
    const found = __mock_fortune_byDate[key];
    if (found) return { item: found };

    const rnd = Math.floor(70 + Math.random() * 30);
    return {
        item: {
            date: key,
            score: rnd,
            short: "컨디션이 좋은 날! 주도적으로 움직여 보세요.",
            detail:
                "새로운 시도를 하기 좋은 날입니다. 동료의 도움을 받으면 더 빠르게 진척이 있을 거예요.\n" +
                "오후에는 잠깐의 휴식이 집중력을 회복시켜 줍니다.",
            luckyColor: "skyblue",
            luckyItem: "볼펜",
            luckyNumber: Math.floor(1 + Math.random() * 9),
            zodiac: "사자자리",
            categories: { work: rnd, love: 60, money: 55, health: 75 },

            decoRightUrl: GiftImg,
            decoLeftUrl: LikeImg,
        },
    };
}
/* ====================   MOCK  END   ====================== */


/* =========================================================
====================   REAL API (주석 해제)  ================
export async function getTodayFortune(
  req: FortuneRequest = {}
): Promise<FortuneResponse> {
  const { date } = req;
  const { data } = await fortuneApi.get<FortuneResponse>("/fortune/today", {
    params: { date },
    withCredentials: true,
  });
  return data;
}
========================================================= */

// 유틸
export function toDateStr(d: Date) {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${day}`;
}
export function formatDateKOR(dateStr: string) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("ko-KR", {
            year: "numeric", month: "long", day: "numeric", weekday: "short",
        });
    } catch {
        return dateStr;
    }
}
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
