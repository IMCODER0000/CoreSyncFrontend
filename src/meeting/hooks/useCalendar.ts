import { useMemo, useState, useEffect } from "react";
import { addDays, endOfMonth, isSameDate, startOfMonth, startOfWeek } from "../utils/date";
import { meetingApi } from "../../api/meetingApi";

export interface Meeting {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
}

export function useCalendar() {
		const [cursor, setCursor] = useState(new Date());
		const [selectedDate, setSelectedDate] = useState<Date>(new Date());
		const [query, setQuery] = useState("");
		const [meetings, setMeetings] = useState<Meeting[]>([]);

		const firstGridDay = useMemo(() => startOfWeek(startOfMonth(cursor)), [cursor]);
		const monthDays = useMemo(() => new Array(42).fill(0).map((_, i) => addDays(firstGridDay, i)), [firstGridDay]);
		const monthWeeks = useMemo(() => chunk(monthDays, 7), [monthDays]);

		// 현재 범위 데이터 API 연동
		useEffect(() => {
				const loadMeetings = async () => {
						const s = startOfMonth(cursor);
						const e = endOfMonth(cursor);
						const from = formatDate(s);
						const to = formatDate(e);
						
						const data = await meetingApi.getMeetingList({ from, to });
						const formattedMeetings: Meeting[] = (data.items || []).map((m: any) => ({
								id: m.publicId,
								title: m.title,
								start: m.startTime,
								end: m.endTime,
								allDay: m.allDay,
						}));
						setMeetings(formattedMeetings);
				};
				loadMeetings();
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
function formatDate(d: Date): string {
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
}
