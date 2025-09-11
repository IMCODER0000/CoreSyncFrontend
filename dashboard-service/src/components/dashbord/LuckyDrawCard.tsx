import {useMemo, useState} from "react";
import LuckyDrawModal from "./LuckyDrawModal";
import {canSpinToday, getLastResult, toKoreanDateStr, todayStr} from "../../utils/luckyDraw.service";

import GiftImg from "../../assets/Icons/Gift_perspective_matte.png";        // 🎁
import LikeImg from "../../assets/Icons/Like_perspective_matte.png";        // 👍

// 카드 UI는 기존 운세 카드와 같은 톤의 그라데이션으로 복구
export default function LuckyDrawCard() {
    const [open, setOpen] = useState(false);
    const last = useMemo(() => getLastResult(), []);
    const today = todayStr();
    const doneToday = last?.date === today;
    const sub = `오늘(${toKoreanDateStr(new Date(today))}) ${doneToday ? "참여 완료" : "참여 가능"}`;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="block w-full min-w-0 max-w-full
                             rounded-[30px] px-6 py-5 text-left
                             shadow-[1px_1px_20px_0_rgba(112,124,154,0.10)]
                             bg-gradient-to-br from-[#2E63FF] to-[#2784FF]
                             text-white relative overflow-hidden
                             min-h-[120px]"
            >
                {/* 내용 구조: 가로 배치 → 2줄 블록으로 고정 */}
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-medium leading-none">오늘의 뽑기</h3>
                        <svg className="w-3.5 h-3.5 opacity-95" viewBox="0 0 20 20" fill="none">
                            <path d="M7.5 5l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </div>

                    <div className="mt-3">
                        <p className="text-xl font-bold leading-6">꽝 없는</p>
                        <p className="text-2xl font-extrabold leading-7">랜덤 뽑기권</p>
                    </div>
                </div>

                {/* 장식 아이콘들 */}
                <div className="pointer-events-none absolute inset-0">
                    <img
                        src={GiftImg}
                        alt="" aria-hidden
                        className="w-20 h-20 absolute right-4 -bottom-2 origin-top-left rotate-[19deg] opacity-95"
                    />
                    <img
                        src={LikeImg}
                        alt="" aria-hidden
                        className="w-8 h-8 absolute left-3 bottom-3 -rotate-[24deg] opacity-90"
                    />
                </div>
            </button>

            {open && <LuckyDrawModal open={open} onClose={() => setOpen(false)}/>}
        </>
    );
}
