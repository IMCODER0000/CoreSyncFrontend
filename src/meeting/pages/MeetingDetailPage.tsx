import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import MeetingEditorBody, {type MeetingCore, type MeetingMeta } from "../components/MeetingEditorBody"; // [NEW]
import { useCalendar } from "../hooks/useCalendar";
import { updateMeeting } from "../api/meetings.ts";

// 로컬 저장 키
const notesKey = (id: string) => `meeting:notes:${id}`;
const metaKey  = (id: string) => `meeting:meta:${id}`;

export default function MeetingDetailPage() {
		const { id = "" } = useParams();
		const navigate = useNavigate();
		const { meetings } = useCalendar();

		// 대상 미팅 찾기
		const meeting = React.useMemo(
				() => (meetings ?? []).find((m: any) => String(m?.id) === String(id)),
				[meetings, id]
		);

		// 메타/노트 로드
		const baseMeta: MeetingMeta = { location: "", participants: "", links: [], files: [], notes: "" };
		let loadedMeta = baseMeta;
		try {
				const raw = localStorage.getItem(metaKey(id));
				if (raw) loadedMeta = { ...loadedMeta, ...JSON.parse(raw) };
				const n = localStorage.getItem(notesKey(id));
				if (n) loadedMeta.notes = n;
		} catch {}

		if (!meeting) {
				return (
						<div className="p-8">
								<div className="mx-auto max-w-[720px]">
										<div className="rounded-xl border bg-white p-6 shadow-sm">
												존재하지 않는 회의입니다.
												<div className="mt-4">
														<button className="h-9 px-4 rounded-md border" onClick={() => navigate(-1)}>뒤로</button>
												</div>
										</div>
								</div>
						</div>
				);
		}

		// 초기값 구성
		const initial = {
				meeting: {
						id: meeting.id,
						title: meeting.title ?? "제목 없음",
						start: new Date(meeting.start),
						end: new Date(meeting.end),
						allDay: !!meeting.allDay,
						team: meeting.team,
				} as MeetingCore,
				meta: loadedMeta,
		};

		return (
				<div className="min-h-[100dvh] w-full bg-[#F5F6F8] px-8 py-6 flex flex-col">
						<div className="mx-auto w-full max-w-[1600px] 2xl:max-w-[1920px] px-6 pb-4 flex-1 flex">
								<div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(31,41,55,0.06)] min-h-0">
										{/* 본문 공용 */}
										<MeetingEditorBody
												mode="detail"
												initial={initial}
												onCancel={() => navigate(-1)}
												onSave={({ meeting: next, meta: nextMeta }) => {
														if (next.id) {
																// 핵심: 상세에서 바꾼 값 patch 저장
																updateMeeting(next.id, {
																		title: next.title,
																		start: next.start,
																		end: next.end,
																		allDay: next.allDay,
																		team: next.team,
																		// teams: next.teams
																		// status: "완료"
																});
														}

														// 메타/노트는 로컬 저장 유지
														if (nextMeta.notes != null) {
																localStorage.setItem(notesKey(String(id)), nextMeta.notes);
														}
														localStorage.setItem(metaKey(String(id)), JSON.stringify(nextMeta));
												}}
										/>
								</div>
						</div>
				</div>
		);
}
