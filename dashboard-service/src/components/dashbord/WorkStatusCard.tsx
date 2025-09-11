import { useEffect, useRef, useState } from "react";
import Card from "./Card";
import DeptSelect from "../dashbord/common/DeptSelect";
import {
    getWorkStatusList,
    type WorkDept,
    type WorkStatus,
    type WorkStatusItem,
} from "../../utils/workStatus.service";

type TabKey = "PRESENT" | "FIELD" | "VACATION";

// 서비스 카테고리 매핑 (유지)
const TAB_TO_CATEGORY: Record<TabKey, WorkStatus> = {
    PRESENT: "WORKING",
    FIELD: "EXTERNAL",
    VACATION: "LEAVE",
};

export default function WorkStatusCard({ className = "" }: { className?: string }) {
    const [tab, setTab] = useState<TabKey>("PRESENT");
    const [dept, setDept] = useState<WorkDept>("ALL");
    const [q, setQ] = useState("");
    const [items, setItems] = useState<WorkStatusItem[]>([]);

    // ===== [NEW] 스크롤 가시/숨김 제어 (네가 준 sb-ghost 유틸 사용) =====
    const [scrolling, setScrolling] = useState(false);
    const timerRef = useRef<number | null>(null);
    const showScrollbar = () => {
        if (!scrolling) setScrolling(true);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setScrolling(false), 700);
    };
    const hideScrollbarSoon = () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setScrolling(false), 300);
    };

    useEffect(() => {
        let alive = true;
        (async () => {
            const list = await getWorkStatusList({
                dept,
                category: TAB_TO_CATEGORY[tab],
                query: q || undefined,
            });
            if (!alive) return;
            setItems(list);
        })();
        return () => {
            alive = false;
        };
    }, [tab, dept, q]);

    return (
        <Card className={`p-8 h-full max-h-[475px] flex flex-col ${className}`}>
            {/* 헤더 */}
            <div className="text-neutral-900 text-xl sm:text-2xl font-bold leading-7">근무현황</div>

            {/* 날짜 · 부서 선택 */}
            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-stone-500">
                    {new Date().toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </div>

                <DeptSelect
                    value={dept}
                    onChange={(v) => setDept(v as WorkDept)}
                    className="h-7 w-28 text-xs text-gray-700 !border-0 !outline-0 !ring-0 !p-0 !bg-transparent"
                />
            </div>

            {/* 구분선 */}
            <div className="mt-3 h-px bg-zinc-100" />

            {/* 탭 & 검색 버튼 행 */}
            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTab("PRESENT")}
                        className={`px-2.5 py-1.5 rounded-2xl text-xs ${
                            tab === "PRESENT"
                                ? "bg-indigo-500 text-white"
                                : "bg-white border border-neutral-300 text-neutral-400"
                        }`}
                    >
                        출근
                    </button>
                    <button
                        onClick={() => setTab("FIELD")}
                        className={`px-2.5 py-1.5 rounded-2xl text-xs ${
                            tab === "FIELD"
                                ? "bg-indigo-500 text-white"
                                : "bg-white border border-neutral-300 text-neutral-400"
                        }`}
                    >
                        외근/출장
                    </button>
                    <button
                        onClick={() => setTab("VACATION")}
                        className={`px-2.5 py-1.5 rounded-2xl text-xs ${
                            tab === "VACATION"
                                ? "bg-indigo-500 text-white"
                                : "bg-white border border-neutral-300 text-neutral-400"
                        }`}
                    >
                        연차/휴가
                    </button>
                </div>

                {/* 검색 아이콘 */}
                <button
                    aria-label="검색"
                    onClick={() => {
                        const v = prompt("이름/직함/메시지 검색어");
                        if (v !== null) setQ(v.trim());
                    }}
                    className="h-7 w-7 grid place-items-center rounded-full bg-indigo-500 text-white"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {/* 리스트 */}
            <div
                onScroll={showScrollbar}
                onMouseEnter={showScrollbar}
                onMouseLeave={hideScrollbarSoon}
                className={`
                      mt-2 flex-1 min-h-0                       
                      overflow-y-auto pb-3
                      pr-[22px] -mr-[22px]
                      sb-ghost ${scrolling ? "sb-ghost-active" : "sb-ghost-idle"}
                    `}
            >
                <ul className="divide-y divide-zinc-100">
                    {items.map((it) => (
                        <li key={it.id} className="py-3">
                            <div className="flex items-center gap-4 pl-1.5">
                                {/* 아바타 */}
                                <div className="relative w-12 h-12">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-200 overflow-hidden" />
                                    <span
                                        className={`
                                              absolute -left-0.5 -bottom-0.5 
                                              w-2.5 h-2.5 rounded-full ring-2 ring-white
                                              ${it.status === "WORKING"
                                            ? "bg-green-400"
                                            : it.status === "EXTERNAL"
                                                ? "bg-yellow-400"
                                                : "bg-rose-400"}
        `}
                                    />
                                </div>

                                {/* 이름/직함/메시지 */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-neutral-900 text-sm font-medium">{it.name}</span>
                                        <span className="text-neutral-400 text-xs">{it.role}</span>
                                    </div>
                                    <div className="text-xs text-stone-500 truncate mt-0.5">{it.message}</div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                {items.length === 0 && (
                    <div className="py-14 text-center text-sm text-neutral-400">
                        데이터가 없습니다.
                    </div>
                )}
            </div>
        </Card>
    );
}
