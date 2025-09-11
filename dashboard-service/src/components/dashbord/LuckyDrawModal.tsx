import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
} from "react";
import {
    canSpinToday,
    getLastResult,
    saveResult,
    spinIndexByWeight,
    toKoreanDateStr,
    todayStr,
    type SpinResult,
} from "../../utils/luckyDraw.service";

type Props = { open: boolean; onClose: () => void };

// 룰렛 항목(순서 고정)
const PRIZES = ["요기요 3,000", "배민 5,000", "이모티콘", "CU 1,000", "스타벅스 1만", "커피 1잔"] as const;
const SLICE = 360 / PRIZES.length; // 60deg

export default function LuckyDrawModal({open, onClose}: Props) {
    const wheelRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const [headerH, setHeaderH] = useState(0);

    const [rot, setRot] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<SpinResult | null>(getLastResult());

    const today = todayStr();
    const doneToday = result?.date === today;
    const headerDateText = useMemo(() => toKoreanDateStr(new Date(today)), [today]);

    // 뷰포트에 맞춰 룰렛 지름 동적 계산 (헤더 높이 측정 포함)
    const [size, setSize] = useState(460);
    useEffect(() => {
        const compute = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const maxFitting = Math.min(520, Math.floor(vw * 0.8), Math.floor(vh * 0.55));
            setSize(Math.max(320, maxFitting));
            setHeaderH(headerRef.current?.offsetHeight ?? 0);
        };
        compute();
        window.addEventListener("resize", compute);
        return () => window.removeEventListener("resize", compute);
    }, [open]);
    const inner = size - 30;

    useEffect(() => {
        setRot(0);
    }, [open]);

    // 모달 열릴 때 배경 스크롤 잠금(스크롤은 모달 내부 전용)
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    const handleSpin = async () => {
        if (spinning || !canSpinToday()) return;
        setSpinning(true);

        const winIndex = spinIndexByWeight(PRIZES.length);
        const center = (winIndex + 0.5) * SLICE; // 해당 조각 중앙각
        const extra = Math.floor(3 + Math.random() * 3) * 360; // 1080~1800도
        const target = extra + (360 - center); // 포인터(12시)에 맞추기

        setRot((prev) => prev + target);
        setTimeout(() => {
            const prize = PRIZES[winIndex];
            const r: SpinResult = {date: todayStr(), prize};
            saveResult(r);
            setResult(r);
            setSpinning(false);
        }, 4200);
    };

    // 스크롤바
    const [sbActive, setSbActive] = useState(false); // [NEW]
    const idleTimer = useRef<number | null>(null); // [NEW]
    const pokeScrollbar = () => {
        setSbActive(true);
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
        idleTimer.current = window.setTimeout(() => setSbActive(false), 900);
    };
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const keys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
        if (keys.includes(e.key)) pokeScrollbar();
    };
    useEffect(() => {
        return () => {
            if (idleTimer.current) window.clearTimeout(idleTimer.current);
        };
    }, []);
    // =====================================================================

    return (
        <div className="fixed inset-0 z-[70]">
            {/* 배경 흐림/딤 */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose}/>

            {/*  모달 컨테이너: 헤더 고정, 본문만 스크롤되게 overflow-hidden */}
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[min(900px,92vw)] max-h-[90vh] rounded-3xl bg-white shadow-xl overflow-hidden"
            >
                {/* 수직 레이아웃 고정 */}
                <div className="flex flex-col max-h-[90vh]">
                    {/* 헤더(고정) */}
                    <div
                        ref={headerRef}
                        className="relative bg-gradient-to-r from-[#2E63FF] to-[#2784FF] text-white rounded-t-3xl px-6 py-4"
                    >
                        <div className="text-sm opacity-90">{headerDateText}</div>
                        <div className="mt-1 text-2xl font-extrabold">꿩 없는 랜덤 뽑기</div>
                        <div className="text-[13px] opacity-90 mt-1">하루에 한 번! 오늘의 럭키 보상을 받아보세요 ✨</div>

                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 h-8 w-8 grid place-items-center rounded-full bg-white/20 hover:bg-white/30"
                            aria-label="닫기"
                        >
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                <path d="M5 5l10 10M15 5L5 15" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>

                    {/* 본문 */}
                    <div
                        className={[
                            "px-6 py-6 flex-1 overflow-y-auto overscroll-contain",
                            "sb-ghost",
                            sbActive ? "sb-ghost-active" : "sb-ghost-idle",
                            "focus:outline-none",
                        ].join(" ")}
                        style={{maxHeight: `calc(90vh - ${headerH}px)`}}
                        onScroll={pokeScrollbar}
                        onWheel={pokeScrollbar}
                        onTouchStart={pokeScrollbar}
                        onTouchMove={pokeScrollbar}
                        onKeyDown={handleKeyDown}
                        tabIndex={0}
                    >
                        <div className="flex flex-col items-center">
                            <div className="relative" style={{width: size, height: size}}>
                                {/* 바깥 파란 테두리 */}
                                <div
                                    className="absolute rounded-full"
                                    style={{inset: 0, boxShadow: "inset 0 0 0 14px #2F6AFF, inset 0 0 0 22px #DCE8FF"}}
                                />
                                {/* 포인터 */}
                                <div className="absolute left-1/2 -translate-x-1/2 -top--2 z-20">
                                    <svg width="34" height="26" viewBox="0 0 34 26" fill="none">
                                        <path d="M17 26L3 3h28L17 26z" fill="#2F6AFF"/>
                                        {/*<circle cx="17" cy="3" r="2.4" fill="#ffffff" />*/}
                                    </svg>
                                </div>

                                {/* 회전판 */}
                                <div
                                    ref={wheelRef}
                                    className="absolute inset-[22px] rounded-full transition-transform duration-[4200ms] ease-out"
                                    style={{
                                        transform: `rotate(${rot}deg)`,
                                        background: "radial-gradient(#F7FAFF, #F5F8FF)"
                                    }}
                                >
                                    {/* 조각 */}
                                    <svg viewBox="0 0 200 200" className="absolute inset-0">
                                        {PRIZES.map((_, i) => {
                                            const a0 = (i * SLICE - 90) * (Math.PI / 180);
                                            const a1 = ((i + 1) * SLICE - 90) * (Math.PI / 180);
                                            const r = 98;
                                            const x0 = 100 + r * Math.cos(a0);
                                            const y0 = 100 + r * Math.sin(a0);
                                            const x1 = 100 + r * Math.cos(a1);
                                            const y1 = 100 + r * Math.sin(a1);
                                            const large = SLICE > 180 ? 1 : 0;
                                            const fill = i % 2 === 0 ? "#FFFFFF" : "#F4F7FF";
                                            const d = [`M 100 100`, `L ${x0} ${y0}`, `A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`, `Z`].join(" ");
                                            return <path key={i} d={d} fill={fill}/>;
                                        })}
                                    </svg>

                                    {/* 항목 텍스트(넘침 방지) */}
                                    {PRIZES.map((label, i) => {
                                        const ang = (i + 0.5) * SLICE - 90;
                                        const rad = (ang * Math.PI) / 180;
                                        const rTxt = inner / 2 - 60; // [CHANGED] 더 안쪽으로
                                        const cx = inner / 2 + rTxt * Math.cos(rad);
                                        const cy = inner / 2 + rTxt * Math.sin(rad);
                                        return (
                                            <div
                                                key={label}
                                                className="absolute text-slate-700 font-semibold text-[13px] sm:text-[15px] leading-tight text-center break-keep"
                                                style={{
                                                    left: cx,
                                                    top: cy,
                                                    transform: "translate(-50%,-50%)",
                                                    maxWidth: 86,
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {label}
                                            </div>
                                        );
                                    })}

                                    {/* 중앙 버튼 */}
                                    <button
                                        type="button"
                                        disabled={spinning || doneToday}
                                        onClick={handleSpin}
                                        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                        h-28 w-28 rounded-full grid place-items-center
                                        shadow-[0_6px_16px_rgba(47,106,255,0.15)]
                                        ${doneToday ? "bg-white" : "bg-white hover:bg-slate-50"}
                                        border-4 border-[#EAF0FF]`}
                                    >
                                        <span className="text-slate-500 font-extrabold tracking-wider text-[18px]">
                                          {doneToday ? "내일!" : "START"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* 상태 문구 */}
                            <div className="mt-5 text-slate-500">
                                오늘(<span className="font-medium">{toKoreanDateStr(new Date(today))}</span>){" "}
                                {doneToday ? "참여 완료" : "참여 가능"}
                            </div>

                            {/* 결과 박스 */}
                            <div className="mt-4 w-full max-w-[720px]">
                                <div
                                    className="rounded-2xl bg-slate-50 p-6 text-center text-slate-600 shadow-[inset_0_0_0_1px_#EDF2F7]">
                                    {result?.date === today ? (
                                        <div className="text-slate-700">
                                            🎉 <span className="font-semibold">당첨: {result.prize}</span>
                                            <div className="text-xs mt-2 opacity-70">※ 당첨 내역은 사내 복지몰 쿠폰으로 지급됩니다.</div>
                                        </div>
                                    ) : (
                                        <>
                                            돌리면 당첨 결과가 여기에 표시됩니다.
                                            <div className="text-xs mt-2 opacity-70">※ 당첨 내역은 사내 복지몰 쿠폰으로 지급됩니다.</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
