export type Meeting = {
		id: string;
		title: string;
		allDay?: boolean;
		start: string;
		end: string;
		status?: "종일" | "진행" | "완료";
		teams?: string[];
		team?: string;
		createdAt?: string;
};

// 팀 프리셋
const TEAMS = ["플랫폼팀", "AI팀", "프론트팀", "백엔드팀", "PM팀"] as const;

function compat(m: Omit<Meeting, "team"> & Partial<Pick<Meeting, "team">>): Meeting {
		const team = m.team ?? (m.teams?.[0] ?? undefined);
		const teams = m.teams ?? (m.team ? [m.team] : undefined);
		return { ...m, team, teams };
}

// ✅ 목업 20개 (2025-09 ~ 10)
//  - "종일" 일정은 allDay: true로 표시
//  - 나머지는 시간 구간
export const mock: Meeting[] = [
		compat({
				id: "m1",
				title: "주간 스탠드업",
				allDay: true,
				start: "2025-09-01T00:00:00.000Z",
				end:   "2025-09-01T23:59:59.000Z",
				status: "종일",
				teams: [TEAMS[0], TEAMS[4]],
				createdAt: "2025-08-31T15:12:00.000Z",
		}),
		compat({
				id: "m2",
				title: "스프린트 계획",
				start: "2025-09-02T10:00:00.000Z",
				end:   "2025-09-02T11:30:00.000Z",
				status: "진행",
				teams: [TEAMS[4]],
				createdAt: "2025-08-31T16:40:00.000Z",
		}),
		compat({
				id: "m3",
				title: "배포 점검",
				start: "2025-09-03T11:00:00.000Z",
				end:   "2025-09-03T12:00:00.000Z",
				status: "완료",
				teams: [TEAMS[3], TEAMS[0]],
				createdAt: "2025-09-01T09:05:00.000Z",
		}),
		compat({
				id: "m4",
				title: "프로젝트 리뷰",
				start: "2025-09-04T16:00:00.000Z",
				end:   "2025-09-04T17:00:00.000Z",
				status: "완료",
				teams: [TEAMS[1]],
				createdAt: "2025-09-02T12:21:00.000Z",
		}),
		compat({
				id: "m5",
				title: "고객 데모 리허설",
				start: "2025-09-05T13:00:00.000Z",
				end:   "2025-09-05T14:00:00.000Z",
				status: "완료",
				teams: [TEAMS[2], TEAMS[4]],
				createdAt: "2025-09-03T18:40:00.000Z",
		}),
		compat({
				id: "m6",
				title: "데이터 파이프라인 점검",
				start: "2025-09-08T10:30:00.000Z",
				end:   "2025-09-08T11:30:00.000Z",
				status: "완료",
				teams: [TEAMS[0]],
				createdAt: "2025-09-06T11:10:00.000Z",
		}),
		compat({
				id: "m7",
				title: "알고리즘 멘토링",
				start: "2025-09-09T09:30:00.000Z",
				end:   "2025-09-09T10:30:00.000Z",
				status: "완료",
				teams: [TEAMS[1], TEAMS[2]],
				createdAt: "2025-09-07T13:02:00.000Z",
		}),
		compat({
				id: "m8",
				title: "프론트 성능 진단",
				start: "2025-09-10T15:00:00.000Z",
				end:   "2025-09-10T16:00:00.000Z",
				status: "완료",
				teams: [TEAMS[2]],
				createdAt: "2025-09-08T10:22:00.000Z",
		}),
		compat({
				id: "m9",
				title: "백엔드 장애 후속 회의",
				start: "2025-09-11T14:30:00.000Z",
				end:   "2025-09-11T15:30:00.000Z",
				status: "완료",
				teams: [TEAMS[3], TEAMS[0]],
				createdAt: "2025-09-09T09:00:00.000Z",
		}),
		compat({
				id: "m10",
				title: "분기 OKR 킥오프",
				start: "2025-09-12T10:00:00.000Z",
				end:   "2025-09-12T11:00:00.000Z",
				status: "완료",
				teams: [TEAMS[4], TEAMS[1]],
				createdAt: "2025-09-10T12:05:00.000Z",
		}),
		compat({
				id: "m11",
				title: "AI 모델 성능 리뷰",
				start: "2025-09-22T11:00:00.000Z",
				end:   "2025-09-22T12:00:00.000Z",
				status: "진행",
				teams: [TEAMS[1]],
				createdAt: "2025-09-18T09:40:00.000Z",
		}),
		compat({
				id: "m12",
				title: "스프린트 미드체크",
				start: "2025-09-23T16:00:00.000Z",
				end:   "2025-09-23T17:00:00.000Z",
				status: "진행",
				teams: [TEAMS[4], TEAMS[0]],
				createdAt: "2025-09-19T13:15:00.000Z",
		}),
		compat({
				id: "m13",
				title: "플랫폼 아키텍처 회의",
				start: "2025-09-24T14:00:00.000Z",
				end:   "2025-09-24T15:30:00.000Z",
				status: "진행",
				teams: [TEAMS[0], TEAMS[3], TEAMS[2]],
				createdAt: "2025-09-20T10:00:00.000Z",
		}),
		compat({
				id: "m14",
				title: "프론트 릴리즈 노트 정리",
				start: "2025-09-25T13:00:00.000Z",
				end:   "2025-09-25T14:00:00.000Z",
				status: "진행",
				teams: [TEAMS[2]],
				createdAt: "2025-09-21T09:20:00.000Z",
		}),
		compat({
				id: "m15",
				title: "백엔드 스키마 변경 논의",
				start: "2025-09-26T10:30:00.000Z",
				end:   "2025-09-26T11:30:00.000Z",
				status: "진행",
				teams: [TEAMS[3], TEAMS[4]],
				createdAt: "2025-09-21T11:47:00.000Z",
		}),
		compat({
				id: "m16",
				title: "고객 이슈 대응 회의",
				start: "2025-09-27T09:00:00.000Z",
				end:   "2025-09-27T10:00:00.000Z",
				status: "진행",
				teams: [TEAMS[4]],
				createdAt: "2025-09-22T08:35:00.000Z",
		}),
		compat({
				id: "m17",
				title: "모니터링 개선 워크숍",
				allDay: false,
				start: "2025-09-29T13:30:00.000Z",
				end:   "2025-09-29T17:30:00.000Z",
				status: "진행",
				teams: [TEAMS[0], TEAMS[2]],
				createdAt: "2025-09-23T14:00:00.000Z",
		}),
		compat({
				id: "m18",
				title: "AI 모델 배포 리뷰",
				start: "2025-09-30T11:00:00.000Z",
				end:   "2025-09-30T12:00:00.000Z",
				status: "진행",
				teams: [TEAMS[1], TEAMS[3]],
				createdAt: "2025-09-24T09:00:00.000Z",
		}),
		compat({
				id: "m19",
				title: "전사 공유 세미나 (All Hands)",
				start: "2025-10-02T09:00:00.000Z",
				end:   "2025-10-02T18:00:00.000Z",
				status: "진행",
				teams: [TEAMS[4], TEAMS[0], TEAMS[1]],
				createdAt: "2025-09-25T10:25:00.000Z",
		}),
		compat({
				id: "m20",
				title: "분기 회고 (Retrospective)",
				start: "2025-10-03T15:00:00.000Z",
				end:   "2025-10-03T17:00:00.000Z",
				status: "진행",
				teams: [TEAMS[2], TEAMS[4]],
				createdAt: "2025-09-26T16:10:00.000Z",
		}),
];

export function listMeetings(params: { start: Date; end: Date; q?: string }): Meeting[] {
		const { start, end, q } = params;

		// 텍스트 필터 (제목)
		const byText = q?.trim()
				? mock.filter((m) => (m.title ?? "").toLowerCase().includes(q.toLowerCase()))
				: mock;

		// 기간 겹치면 포함 (s <= end && e >= start)
		const sMs = start.getTime();
		const eMs = end.getTime();
		const inRange = (m: Meeting) => {
				const s = new Date(m.start).getTime();
				const e = new Date(m.end).getTime();
				return s <= eMs && e >= sMs;
		};

		return byText.filter(inRange);
}

export function getMeetingById(id: string) {
		if (!id) return null;
		return mock?.find?.((m: any) => m?.id === id || m?.meetingId === id) ?? null;
}

// 새 미팅 생성: 기존 mock 배열에 바로 push하여 리스트/캘린더에 즉시 반영
export function createMeeting(payload: {
		title: string;
		start: Date | string;
		end: Date | string;
		allDay?: boolean;
		team?: string;
		teams?: string[];
		status?: "종일" | "진행" | "완료";
}) {
		const id = `m${Date.now().toString(36)}`;

		// 입력이 Date이든 string이든 ISO 문자열로 정규화
		const toIso = (v: Date | string) =>
				v instanceof Date ? v.toISOString() : new Date(v).toISOString();

		const item = {
				id,
				title: payload.title || "새 미팅",
				allDay: !!payload.allDay,
				start: toIso(payload.start),
				end: toIso(payload.end),
				status: payload.status ?? "진행",
				// 둘 다 받을 수 있어 프로젝트 기존 데이터와 호환
				team: payload.team,
				teams: payload.teams,
				createdAt: new Date().toISOString(),
		};

		// mock 배열에 추가
		// @ts-ignore - 런타임에서 존재하는 mock 배열 사용
		mock?.push?.(item);

		return item;
}

function ensureIso(v: Date | string): string {
		return v instanceof Date ? v.toISOString() : new Date(v).toISOString();
}

export function updateMeeting(
		id: string,
		patch: {
				title?: string;
				allDay?: boolean;
				start?: Date | string;
				end?: Date | string;
				status?: "종일" | "진행" | "완료";
				team?: string;
				teams?: string[];
		}
): Meeting | null {
		const idx = mock.findIndex((m) => m.id === id);
		if (idx === -1) return null;

		const prev = mock[idx];

		// 날짜 정규화 (패치에 들어온 경우에만)
		const nextStart = patch.start !== undefined ? ensureIso(patch.start) : prev.start;
		const nextEnd   = patch.end   !== undefined ? ensureIso(patch.end)   : prev.end;

		// 병합
		let merged = {
				...prev,
				...(patch.title  !== undefined ? { title:  patch.title }  : null),
				...(patch.allDay !== undefined ? { allDay: patch.allDay } : null),
				...(patch.status !== undefined ? { status: patch.status } : null),
				...(patch.team   !== undefined ? { team:   patch.team }   : null),
				...(patch.teams  !== undefined ? { teams:  patch.teams }  : null),
				start: nextStart,
				end:   nextEnd,
		};

		if (new Date(merged.start).getTime() > new Date(merged.end).getTime()) {
				merged.end = merged.start;
		}

		merged = compat(merged as any);

		mock[idx] = merged;

		try {
				window.dispatchEvent(new CustomEvent("meetings:changed"));
		} catch {}

		return merged as Meeting;
}

/* [백엔드 연동시]
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
