import type {Meeting} from "../../api/meetings";
import {isSameDate, isBetweenDay, ymd} from "../../utils/date";

type Props = {
    cursor: Date;
    weeks: Date[][];
    meetings: Meeting[];
    onSelectDate: (d: Date) => void;
    selectedDate?: Date;
};

export default function MonthGrid({
                                      cursor, weeks, meetings, onSelectDate, selectedDate,
                                  }: Props) {

    return (
        <div className="h-full overflow-hidden pt-2 pb-6">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 border-y border-gray-200 text-center bg-gray-50">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => (
                    <div key={d} className="py-2.5 text-xs font-semibold tracking-wide">
                        <span
                            className={i === 0 ? "text-red-500" : i === 6 ? "text-[#5b7cdb]" : "text-gray-600"}>{d}</span>
                    </div>
                ))}
            </div>

            {/* 6행 균등압축 + 경계선 안정화 */}
            <div className="grid h-[calc(100%-44px)] grid-rows-[repeat(6,minmax(0,1fr))] divide-y divide-gray-200">
                {weeks.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-7 divide-x divide-gray-200">
                        {row.map((d, di) => {
                            const out = d.getMonth() !== cursor.getMonth();
                            const isSel = selectedDate ? isSameDate(d, selectedDate) : false;
                            const isToday = isSameDate(d, new Date());
                            const isSun = d.getDay() === 0;
                            const isSat = d.getDay() === 6;

                            const items = meetings.filter(
                                (m) =>
                                    isSameDate(d, new Date(m.start)) ||
                                    (m.allDay && isBetweenDay(d, new Date(m.start), new Date(m.end)))
                            );

                            return (
                                <div
                                    key={di}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onSelectDate(d)}
                                    onKeyDown={(e) => e.key === "Enter" && onSelectDate(d)}
                                    className={[
                                        "relative h-full cursor-pointer overflow-hidden transition-colors duration-150",
                                        out ? "bg-gray-50/50" : "bg-white hover:bg-gray-50",
                                    ].join(" ")}
                                >
                                    {/* 선택 라인 */}
                                    {isSel && (
                                        <span
                                            aria-hidden
                                            className="pointer-events-none absolute inset-0 z-10 outline outline-[2px] outline-[#5b7cdb] outline-offset-[-2px]"
                                        />
                                    )}

                                    {/* 날짜 */}
                                    <div className="px-2 pt-2">
                                        <span
                                            title={ymd(d)}
                                            className={[
                                                "inline-flex h-7 w-7 items-center justify-center text-xs font-semibold leading-none",
                                                isToday ? "rounded-full bg-[#5b7cdb] text-white" : "",
                                                out ? "text-gray-300" : "text-gray-800",
                                                isSun && !isToday ? "text-red-500" : "",
                                                isSat && !isToday ? "text-[#5b7cdb]" : "",
                                            ].join(" ")}
                                        >
                                            {d.getDate()}
                                        </span>
                                    </div>

                                    {/* 일정 목록 */}
                                    <div className="space-y-1 px-2.5 pb-2">
                                        {items.map((m) => (
                                            <div
                                                key={m.id}
                                                className="flex items-center gap-1.5 truncate text-xs text-gray-700 bg-gray-50 rounded px-2 py-1 hover:bg-gray-100 transition-colors duration-150"
                                                title={m.title}
                                            >
                                                <span
                                                    className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                                                    style={{backgroundColor: m.allDay ? "#f5a962" : "#5b7cdb"}}
                                                />
                                                <span className="truncate font-medium">{m.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}