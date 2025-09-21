import { useMemo, useState } from "react";
import { addDays, endOfMonth, isSameDate, startOfMonth, startOfWeek } from "../utils/date";
import { listMeetings } from "../api/meetings";
import type { Meeting } from "../api/meetings";

export function useCalendar() {
		const [cursor, setCursor] = useState(new Date());
		const [selectedDate, setSelectedDate] = useState<Date>(new Date());
		const [query, setQuery] = useState("");

		const firstGridDay = useMemo(() => startOfWeek(startOfMonth(cursor)), [cursor]);
		const monthDays = useMemo(() => new Array(42).fill(0).map((_, i) => addDays(firstGridDay, i)), [firstGridDay]);
		const monthWeeks = useMemo(() => chunk(monthDays, 7), [monthDays]);

		// 현재 범위 데이터 (필요시 API 연동)
		const meetings: Meeting[] = useMemo(() => {
				const s = startOfMonth(cursor);
				const e = endOfMonth(cursor);
				return listMeetings({ start: s, end: e, q: query });
		}, [cursor, query]);

		const meetingsOfDay = (d: Date) =>
				meetings.filter(
						(m) =>
								isSameDate(d, new Date(m.start)) ||
								(m.allDay && d >= startOfDay(new Date(m.start)) && d <= startOfDay(new Date(m.end)))
				);

		return {
				cursor,
				setCursor,
				selectedDate,
				setSelectedDate,
				query,
				setQuery,
				monthDays,
				monthWeeks,
				meetings,
				meetingsOfDay,
		};
}

// ----- helpers (로컬 전용) -----
function chunk<T>(arr: T[], size: number) {
		const out: T[][] = [];
		for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
		return out;
}
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
