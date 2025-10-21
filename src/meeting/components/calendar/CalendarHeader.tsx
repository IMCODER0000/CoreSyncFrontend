import Button from "../../../common_ui/Button/index.tsx";
import {yyyyMm} from "../../utils/date";

type Props = {
    cursor: Date;
    setCursor: (d: Date) => void;
    variant?: "default" | "inside";
    mode: "week" | "month";
    onModeChange: (m: "week" | "month") => void;
    onToday: () => void;
};

export default function CalendarHeader({
                                           cursor,
                                           setCursor,
                                           variant = "default",
                                           mode,
                                           onModeChange,
                                           onToday,
                                       }: Props) {

    const wrapper =
        variant === "inside"
            ? "grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 h-14 bg-white border-b border-gray-200"
            : "grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 h-14 bg-white border-b border-gray-200";

    const iconBtn =
        "h-8 w-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-[#5b7cdb] hover:bg-gray-50 transition-colors duration-150";

    const goPrev = () => {
        if (mode === "week") {
            const next = new Date(cursor);
            next.setDate(next.getDate() - 7);
            setCursor(next);
        } else {
            // Month 모드: 기존 동작 유지
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
        }
    };

    const goNext = () => {
        if (mode === "week") {
            const next = new Date(cursor);
            next.setDate(next.getDate() + 7);
            setCursor(next);
        } else {
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
        }
    };

    return (
        <div className={wrapper}>
            {/* 왼쪽: Week/Month 토글 (키움) */}
            <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white">
                <SegmentItem active={mode === "week"} onClick={() => onModeChange("week")} label="Week"/>
                <SegmentItem active={mode === "month"} onClick={() => onModeChange("month")} label="Month"/>
            </div>

            {/* 가운데: ◀  YYYY년 M월  ▶ */}
            <div className="flex items-center justify-center gap-2 leading-none select-none">
                <button aria-label="previous" className={iconBtn} onClick={goPrev}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <h2 className="mx-2 text-base font-bold tracking-tight text-gray-800">
                    {yyyyMm(cursor)}
                </h2>

                <button aria-label="next" className={iconBtn} onClick={goNext}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>

            {/* 오른쪽: Today */}
            <div className="flex items-center gap-2 justify-self-end">
                <Button
                    size="sm"
                    color="secondary"
                    variant="outline"
                    onClick={onToday}
                    className="h-8 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-sm font-medium transition-colors duration-150"
                >
                    Today
                </Button>
            </div>
        </div>
    );
}

function SegmentItem({
                         active, onClick, label,
                     }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "px-4 h-8 text-xs font-medium leading-none transition-colors duration-150",
                active ? "bg-[#5b7cdb] text-white" : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            ].join(" ")}
        >
            {label}
        </button>
    );
}
