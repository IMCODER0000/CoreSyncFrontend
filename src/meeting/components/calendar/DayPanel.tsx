type Props = {
    date: Date;
    items: Array<{
        id?: string | number;
        title?: string;
        timeRange?: string;
        color?: string;
        note?: string;
    }>;
    onPrevDay?: () => void;
    onNextDay?: () => void;
};

const fmtK = (d: Date) =>
    d
        .toLocaleDateString("ko-KR", {month: "2-digit", day: "2-digit", weekday: "long"})
        .replace(".", "월 ")
        .replace(".", "일 ");

export default function DayPanel({date, items, onPrevDay, onNextDay}: Props) {
    const empty = !items || items.length === 0;

    return (
        <div className="flex h-full flex-col bg-white rounded-2xl">
            {/* 날짜 헤더 */}
            <div className="flex items-center justify-between px-12 py-6">
                {/* 이전 아이콘 */}
                <button
                    aria-label="prev-day"
                    onClick={onPrevDay}
                    className="h-10 w-10 inline-flex items-center justify-center rounded-full text-[#D1D5DB] hover:text-[#9AA0A6]"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M15 18l-6-6 6-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {/* 날짜 */}
                <div className="text-[18px] font-semibold text-[#3B4048]">{fmtK(date)}</div>

                {/* 이후 아이콘 */}
                <button
                    aria-label="next-day"
                    onClick={onNextDay}
                    className="h-10 w-10 inline-flex items-center justify-center rounded-full text-[#D1D5DB] hover:text-[#9AA0A6]"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M9 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {/* 콘텐츠 */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
                {empty ? (
                    <div className="flex h-full items-start justify-center pt-8">
                        <div className="text-[13px] text-[#A0A8B8]">오늘은 미팅이 없습니다</div>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {items.map((it, idx) => (
                            <li
                                key={String(it.id ?? idx)}
                                className="rounded-xl border border-[#E6ECF5] p-3 hover:bg-[#FAFBFF]"
                            >
                                <div className="flex items-start gap-2">
                                    <div
                                        className="mt-1 h-2.5 w-2.5 rounded-full"
                                        style={{background: it.color ?? "#3A72F8"}}
                                    />
                                    <div className="flex-1">
                                        <div className="text-[13px] font-medium text-[#2B2F37]">
                                            {it.title ?? "Untitled"}
                                        </div>
                                        {it.timeRange && (
                                            <div className="mt-0.5 text-[11px] text-[#8A93A3]">{it.timeRange}</div>
                                        )}
                                        {it.note && (
                                            <div className="mt-1 text-[12px] text-[#6B7280] leading-5">
                                                {it.note}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
