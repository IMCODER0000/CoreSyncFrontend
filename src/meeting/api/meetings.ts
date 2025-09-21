export type Meeting = {
		id: string;
		title: string;
		allDay?: boolean;
		start: string; // ISO
		end: string;   // ISO
		status?: "종일" | "진행" | "완료";
};

const mock: Meeting[] = [
		{
				id: "m1",
				title: "스탠드업 미팅",
				allDay: true,
				start: new Date().toISOString(),
				end: new Date().toISOString(),
				status: "종일",
		},
		{
				id: "m2",
				title: "스프린트 계획",
				start: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
				end: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
				status: "진행",
		},
];

export function listMeetings(params: { start: Date; end: Date; q?: string }): Meeting[] {
		const { q } = params;
		const filtered = q?.trim()
				? mock.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()))
				: mock;
		return filtered;
}

/* [REAL 예시]
import { apiClient } from "./apiClient";
export async function listMeetings(params:{start:Date; end:Date; q?:string}) {
  const res = await apiClient.get<Meeting[]>("/meetings", {
    start: params.start.toISOString(),
    end: params.end.toISOString(),
    q: params.q
  });
  return res;
}
*/
