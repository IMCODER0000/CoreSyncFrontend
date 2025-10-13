// meeting/components/MeetingEditorBody.tsx
import React from "react";
import Content from "./notes/Content.tsx";
import Details from "./notes/Details.tsx";

// ===== 외부 노출 타입(유지) =====
export type MeetingCore = {
	id?: string;
	title: string;
	start: Date;
	end: Date;
	allDay: boolean;
	team?: string;
};

export type MeetingMeta = {
	location?: string;
	participants?: string; // ", " 문자열 유지
	links: string[];
	files: string[];       // 현재 미사용(타입만 유지)
	notes: string;
};

type Props = {
	mode: "new" | "detail";
	initial: { meeting: MeetingCore; meta: MeetingMeta };
	onSave: (data: { meeting: MeetingCore; meta: MeetingMeta }) => Promise<void> | void;
	onCancel?: () => void;
};

// ----- 데모 프리셋 (백엔드 붙이면 교체 가능) -----
const TEAM_OPTIONS = ["플랫폼팀", "AI팀", "프론트팀", "백엔드팀", "PM팀"] as const; // [KEEP]

// 임시 유저 (백엔드 붙이면 삭제 가능)
function getLocalUser() {
	const k = "app:user";
	try {
		const raw = localStorage.getItem(k);
		if (raw) return JSON.parse(raw);
	} catch {}
	const u = {
		id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
		name: `사용자-${Math.random().toString(36).slice(2, 5)}`,
	};
	localStorage.setItem(k, JSON.stringify(u));
	return u;
}

export default function MeetingEditorBody({ mode, initial, onSave, onCancel }: Props) {
	const me = React.useMemo(getLocalUser, []);
	const ownerId = React.useMemo(() => (initial.meta as any)?.createdBy ?? me.id, [initial.meta, me.id]);

	// ===== 좌측(콘텐츠) 상태 =====
	const [title, setTitle] = React.useState(initial.meeting.title || "");
	const [notes, setNotes] = React.useState(initial.meta.notes || "");
	const [links, setLinks] = React.useState<string[]>(initial.meta.links ?? []);
	const [linkOpen, setLinkOpen] = React.useState<boolean>(true);
	// const [linkInput, setLinkInput] = React.useState<string>("");

	// ===== 우측(세부 정보) 상태 =====
	const [allDay, setAllDay] = React.useState(!!initial.meeting.allDay);
	const [start, setStart] = React.useState<Date>(new Date(initial.meeting.start));
	const [end, setEnd] = React.useState<Date>(new Date(initial.meeting.end));
	const [team, setTeam] = React.useState<string>(initial.meeting.team || "");
	const [location, setLocation] = React.useState(initial.meta.location || "");
	const [participants, setParticipants] = React.useState(initial.meta.participants || ""); // ", " 문자열

	// === 수동 저장 (버튼용) ===
	const handleSave = React.useCallback(() => {
		const metaToSave: any = { notes, location, participants, links, files: [] };
		metaToSave.createdBy = ownerId; // [KEEP] 데모. 백엔드에서 기록하면 제거.

		onSave({
			meeting: {
				// [CHANGED] 초기값 스프레드 제거 → 현재 state만 사용해서 덮어쓰기 이슈 방지
				id: initial.meeting.id,                               // [CHANGED]
				title: title || "제목 없음",
				start,
				end,
				allDay,
				team,
			},
			meta: metaToSave,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [title, notes, links, location, participants, start, end, allDay, team, ownerId, onSave]);

	// === 자동 저장 (0.6초 디바운스) — 타이핑/선택이 멈추면 저장 ===
	const AUTOSAVE_MS = 600; // [NEW] 600ms = 0.6초
	React.useEffect(() => {
		const timer = window.setTimeout(() => {
			// 버튼 저장과 동일한 payload로 호출
			const metaToSave: any = { notes, location, participants, links, files: [] };
			metaToSave.createdBy = ownerId;

			onSave({
				meeting: {
					// [CHANGED] 초기값 스프레드 제거 — 최신 state 보존
					id: initial.meeting.id,                           // [CHANGED]
					title: title || "제목 없음",
					start,
					end,
					allDay,
					team,
				},
				meta: metaToSave,
			});
		}, AUTOSAVE_MS);

		return () => window.clearTimeout(timer); // [NEW] 입력이 이어지면 이전 타이머 취소
		// 저장에 반영해야 하는 모든 편집 필드 의존성
	}, [title, notes, links, location, participants, start, end, allDay, team, ownerId, onSave, initial.meeting.id]); // [NEW]

	return (
		<div className="flex-1 min-h-0 px-6 pb-8">
			{/* 상단 우측 버튼 */}
			<div className="pt-5 pb-3 flex items-center justify-end">
				{onCancel && (
					<button className="h-8 px-3 rounded-md border mr-2" onClick={onCancel}>
						{mode === "new" ? "뒤로" : "뒤로"}
					</button>
				)}
				<button
					className="h-8 px-4 rounded-md bg-[#6D6CF8] text-white"
					onClick={handleSave}
					disabled={!title.trim()}
					title={!title.trim() ? "제목을 입력해 주세요." : "저장"}
				>
					저장
				</button>
			</div>

			{/* === 2열 레이아웃 === */}
			<div
				className="
          grid gap-6 items-start
          grid-cols-1
          lg:grid-cols-[minmax(0,1fr)_340px]
        "
			>
				{/* 왼쪽: 콘텐츠 */}
				<div className="min-w-0">
					<Content
						title={title} setTitle={setTitle}
						notes={notes} setNotes={setNotes}
						links={links} setLinks={setLinks}
						linkOpen={linkOpen} setLinkOpen={setLinkOpen}
						// linkInput={linkInput} setLinkInput={setLinkInput}
						participants={participants}
					/>
				</div>

				{/* 오른쪽: 세부 정보 (sticky) */}
				<div className="lg:sticky lg:top-16">
					<Details
						meetingId={String(initial.meeting.id ?? "new")}
						ownerId={ownerId}
						allDay={allDay} setAllDay={setAllDay}
						start={start} setStart={setStart}
						end={end} setEnd={setEnd}
						team={team} setTeam={setTeam}
						teamOptions={TEAM_OPTIONS}
						location={location} setLocation={setLocation}
						participants={participants} setParticipants={setParticipants}
					/>
				</div>
			</div>
		</div>
	);
}
