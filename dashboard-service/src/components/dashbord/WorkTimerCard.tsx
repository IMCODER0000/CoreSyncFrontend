import React from "react";
import Card from "./Card";

import MonitorIcon from "../../assets/Icons/monitor.svg";
import StartIcon from "../../assets/Icons/출근 아이콘.svg";
import StopIcon from "../../assets/Icons/퇴근 아이콘.svg";

type Size = "sm" | "md";
type Props = {
    timeText: string;        // 중앙 누적 근무시간 텍스트 (예: 06:54)
    dateText: string;        // 하단 날짜 (예: 2025.09.06(토))
    percent: number;         // 0~100 (8시간 기준 진행률)
    leftChipText?: string;   // 출근 칩에 표기 (예: "08:50" 또는 "출근")
    rightChipText?: string;  // 퇴근 칩에 표기 (예: "17:42" 또는 "퇴근")
    isWorking?: boolean;     // 출근 상태
    isPaused?: boolean;      // 외출(일시정지) 상태
    onTogglePause?: () => void; // 외출/복귀 토글 (퇴근 아님!)
    onLeftAction?: () => void;  // 출근
    onRightAction?: () => void; // 퇴근
    className?: string;
    size?: Size;
};

const S: Record<Size, {
    circleWrap: string;
    time: string;
    date: string;
    chipH: string; chipW: string; chipText: string;
    pauseBtn: string;
    ringBg: number; ringFg: number;
}> = {
    sm: {
        circleWrap: "max-w-[220px]",
        time: "text-[40px] leading-[40px]",
        date: "text-[11px] leading-[14px]",
        chipH: "h-9", chipW: "w-24", chipText: "text-[11px]",
        pauseBtn: "w-12 h-12 right-[-8px] bottom-[-8px]",
        ringBg: 3, ringFg: 6,
    },
    md: {
        circleWrap: "max-w-[300px]",
        time: "text-[48px] leading-[48px]",
        date: "text-xs leading-[14px]",
        chipH: "h-10", chipW: "w-28", chipText: "text-xs",
        pauseBtn: "w-14 h-14 right-[-10px] bottom-[-10px]",
        ringBg: 3, ringFg: 6,
    }
};

export default function WorkTimerCard({
                                          timeText,
                                          dateText,
                                          percent,
                                          leftChipText = "출근",
                                          rightChipText = "퇴근",
                                          isWorking = false,
                                          isPaused = false,
                                          onTogglePause,
                                          onLeftAction,
                                          onRightAction,
                                          className = "",
                                          size = "md"
                                      }: Props) {
    // 중앙은 HH:MM만 사용
    const hhmm = timeText.slice(0, 5);
    const statusLabel = isWorking ? (isPaused ? "paused" : "working") : "paused";

    // 링
    const R = 46;
    const C = 2 * Math.PI * R;
    const dash = Math.max(0, Math.min(100, percent));
    const dashOffset = (1 - dash / 100) * C;

    const SS = S[size];

    return (
        <Card
            className={[
                "overflow-hidden px-9 py-7 bg-white rounded-[30px] shadow-[1px_1px_20px_rgba(112,124,154,0.10)]",
                "flex flex-col items-center gap-4 w-full min-w-0 max-w-[440px] h-full",
                className,
            ].join(" ")}
        >
            {/* 링 + 중앙 콘텐츠 */}
            <div className={`relative w-full ${SS.circleWrap} aspect-square mx-auto`}>
                <svg viewBox="0 0 100 100" className="absolute inset-0">
                    <circle cx="50" cy="50" r={R} fill="none" stroke="rgb(229,231,235)" strokeWidth={3}/>
                    <circle
                        cx="50" cy="50" r={R}
                        fill="none" stroke="rgb(129,140,248)" strokeWidth={6}
                        strokeLinecap="round" strokeDasharray={C} strokeDashoffset={dashOffset}
                        transform="rotate(-90 50 50)"
                    />
                </svg>

                <div className="absolute inset-0 grid place-items-center select-none">
                    <div className="w-48 h-28 relative">
                        {/* 상태 라벨 */}
                        <div className="absolute -top-0 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                            <MonitorIcon
                                className="w-[18px] h-[18px] text-slate-400"
                                style={{strokeWidth: 1.2}}
                            />
                            <span className="text-slate-400 text-sm leading-tight">{statusLabel}</span>
                        </div>

                        {/* 시간(누적 근무) */}
                        <div
                            className="absolute top-8 left-1/2 -translate-x-1/2 text-slate-900 text-[48px] font-bold leading-[48px]">
                            {hhmm}
                        </div>

                        {/* 날짜 */}
                        <div
                            className="absolute -bottom-0 left-1/2 -translate-x-1/2 text-slate-400 text-xs font-medium leading-[14px]">
                            {dateText}
                        </div>
                    </div>
                </div>

                {/* 외출/복귀 토글 */}
                {isWorking && (
                    <button
                        type="button"
                        onClick={onTogglePause}
                        className={[
                            "absolute rounded-full w-10 h-10 bg-neutral-800 flex items-center justify-center shadow-md",
                            "right-[16px] bottom-[16px]",
                        ].join(" ")}
                        title={isPaused ? "복귀" : "외출(일시정지)"}
                        aria-label="pause-toggle"
                    >
                        {isPaused ? (
                            // 복귀(재생)
                            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                                <polygon points="8,5 19,12 8,19" fill="white"/>
                            </svg>
                        ) : (
                            // 일시정지
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"
                                 xmlns="http://www.w3.org/2000/svg">
                                <rect x="6" y="4" width="4" height="16" rx="1.5" fill="white"/>
                                <rect x="14" y="4" width="4" height="16" rx="1.5" fill="white"/>
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {/* 아래 칩(출근/퇴근) — 버튼을 눌렀을 때의 시각을 그대로 표기 */}
            <div className="flex flex-wrap w-full justify-center gap-3">
                <button
                    type="button"
                    onClick={onLeftAction}
                    className="w-28 h-10 px-3 bg-zinc-100 rounded-2xl flex justify-center items-center gap-2 overflow-hidden"
                >
                    <StartIcon
                        className="w-4 h-4 text-zinc-700"
                        style={{strokeWidth: 1.2}}
                    />
                    <span className="text-zinc-700 text-xs leading-snug">{leftChipText}</span>
                </button>

                <button
                    type="button"
                    onClick={onRightAction}
                    className="w-28 h-10 px-3 bg-neutral-800 rounded-2xl flex justify-center items-center gap-2"
                >
                    <StopIcon
                        className="w-4 h-4 text-white"
                        style={{strokeWidth: 1.2}}
                    />
                    <span className="text-white text-xs tracking-widest leading-snug">{rightChipText}</span>
                </button>
            </div>
        </Card>
    );
}
