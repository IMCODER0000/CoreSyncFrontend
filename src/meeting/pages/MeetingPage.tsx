// meeting/pages/MeetingPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import MeetingEditorBody, { type MeetingCore, type MeetingMeta } from "../components/MeetingEditorBody";
import { useCalendar } from "../hooks/useCalendar";
import { updateMeeting } from "../api/meetings";

// 로컬 저장 키
const notesKey = (id: string) => `meeting:notes:${id}`;
const metaKey  = (id: string) => `meeting:meta:${id}`;
const titleKey = (id: string) => `meeting:title:${id}`;

export default function MeetingPage() {
    const navigate = useNavigate();
    const { id = "" } = useParams();             // 단일 라우트: 반드시 id 있음
    const { meetings } = useCalendar();

    // 캘린더에서 대상 미팅 찾기(방금 생성한 초안도 fetch 후 여기에 들어오게)
    const meeting = React.useMemo(
        () => (meetings ?? []).find((m: any) => String(m?.id) === String(id)) || null,
        [meetings, id]
    );

    // 기본 meta/notes 로드(없으면 빈값)
    const baseMeta: MeetingMeta = { location: "", participants: "", links: [], files: [], notes: "" };
    let loadedMeta = baseMeta;
    let loadedTitle = "";
    try {
        const raw = localStorage.getItem(metaKey(id));
        if (raw) loadedMeta = { ...loadedMeta, ...JSON.parse(raw) };
        const n = localStorage.getItem(notesKey(id));
        if (n) loadedMeta.notes = n;
        const t = localStorage.getItem(titleKey(String(id)));
        if (t) loadedTitle = t;
    } catch {}

    // 초기값 구성
    const now = React.useMemo(() => new Date(), []);
    const initial = React.useMemo(() => ({
        meeting: meeting ? ({
            id: meeting.id,
            title: loadedTitle || (meeting.title ?? ""), // 로컬 우선
            start: new Date(meeting.start),
            end: new Date(meeting.end),
            allDay: !!meeting.allDay,
            team: meeting.team,
        }) : ({
            id,
            title: loadedTitle || "",
            start: now,
            end: new Date(now.getTime() + 60 * 60 * 1000),
            allDay: false,
        } as MeetingCore),
        meta: loadedMeta,
    }), [meeting, id, loadedMeta, loadedTitle, now]);

    // 저장(자동 저장이 이 함수를 호출)
    const handleSave = React.useCallback(async ({ meeting: next, meta: nextMeta }: { meeting: MeetingCore; meta: MeetingMeta }) => {
        if (next.id) {
            updateMeeting(next.id, {
                title: next.title,
                start: next.start,
                end: next.end,
                allDay: next.allDay,
                team: next.team,
            });
        }
        // [NEW] 제목도 로컬 백업 (서버 실패/지연 시 대비)
        localStorage.setItem(titleKey(String(id)), next.title ?? ""); // [NEW]

        if (nextMeta.notes != null) localStorage.setItem(notesKey(String(id)), nextMeta.notes);
        localStorage.setItem(metaKey(String(id)), JSON.stringify(nextMeta));
    }, [id]);

    // 존재하지 않는 ID로 직접 들어왔을 때 UX (선택)
    const noData = !meeting && !loadedMeta.notes && !loadedMeta.location && !loadedMeta.participants && !(loadedMeta.links?.length);
    if (noData) {
        // 안내 UI가 필요하면 여기에, 현재는 본문만 렌더
    }

    return (
        <div className="min-h-[100dvh] w-full bg-[#F5F6F8] px-8 py-6 flex flex-col">
            <div className="mx-auto w-full max-w-[1600px] 2xl:max-w-[1920px] px-6 pb-4 flex-1 flex">
                <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(31,41,55,0.06)] min-h-0">
                    <MeetingEditorBody
                        mode="detail"                // 항상 detail 모드
                        initial={initial}
                        onCancel={() => navigate(-1)}
                        onSave={handleSave}          // 자동 저장이 600ms 디바운스로 호출됨
                    />
                </div>
            </div>
        </div>
    );
}
