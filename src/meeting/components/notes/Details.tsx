import React from "react";

// 실시간 동시편집(옵션)
const USE_REALTIME_PARTICIPANTS = false; // 필요 시 true로 바꾸고 서버 붙이면 동작

// 임시 유저 (생성자 가드용)
function getLocalUser() {
    const k = "app:user";
    try { const raw = localStorage.getItem(k); if (raw) return JSON.parse(raw); } catch {}
    const u = { id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) };
    localStorage.setItem(k, JSON.stringify(u));
    return u;
}

type Props = {
    meetingId: string;
    ownerId: string;

    allDay: boolean; setAllDay: (v: boolean) => void;
    start: Date; setStart: (d: Date) => void;
    end: Date; setEnd: (d: Date) => void;

    team: string; setTeam: (v: string) => void;
    teamOptions: readonly string[];

    location: string; setLocation: (v: string) => void;

    participants: string; setParticipants: (v: string) => void; // ", " 문자열
};

export default function Details({
                                    meetingId, ownerId,
                                    allDay, setAllDay,
                                    start, setStart,
                                    end, setEnd,
                                    team, setTeam, teamOptions,
                                    location, setLocation,
                                    participants, setParticipants,
                                }: Props) {

    // 날짜/시간 유틸
    const fmtDate = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const fmtTime = (d: Date) =>
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    const parseLocal = (date: string, time: string) => new Date(`${date}T${time || "00:00"}`);

    return (
        <div className="rounded-2xl bg-[#F7FAFE] border border-[#E6ECF4] p-4 w-[340px] max-w-full"> {/* [CHANGED] 고정 폭 */}
            {/* 종일 */}
            <label className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
                <span>종일</span>
            </label>

            {/* 시작 */}
            <div className="mt-4 space-y-2">
                <div className="text-[12px] text-[#6B7280]">시작</div>
                <div className="grid grid-cols-[48px_1fr] items-center gap-2">
                    <div className="text-[12px] text-[#9AA3AF]">날짜</div>
                    <input
                        type="date"
                        className="h-9 px-3 rounded-md border bg-white"
                        value={fmtDate(start)}
                        onChange={(e) => setStart(parseLocal(e.target.value, allDay ? "00:00" : fmtTime(start)))}
                    />
                    <div className="text-[12px] text-[#9AA3AF]">시간</div>
                    <input
                        type="time"
                        className="h-9 px-3 rounded-md border bg-white disabled:opacity-60"
                        value={fmtTime(start)}
                        onChange={(e) => setStart(parseLocal(fmtDate(start), e.target.value))}
                        disabled={allDay}
                    />
                </div>
            </div>

            {/* 종료 */}
            <div className="mt-4 space-y-2">
                <div className="text-[12px] text-[#6B7280]">종료</div>
                <div className="grid grid-cols-[48px_1fr] items-center gap-2">
                    <div className="text-[12px] text-[#9AA3AF]">날짜</div>
                    <input
                        type="date"
                        className="h-9 px-3 rounded-md border bg-white"
                        value={fmtDate(end)}
                        onChange={(e) => setEnd(parseLocal(e.target.value, allDay ? "23:59" : fmtTime(end)))}
                    />
                    <div className="text-[12px] text-[#9AA3AF]">시간</div>
                    <input
                        type="time"
                        className="h-9 px-3 rounded-md border bg-white disabled:opacity-60"
                        value={fmtTime(end)}
                        onChange={(e) => setEnd(parseLocal(fmtDate(end), e.target.value))}
                        disabled={allDay}
                    />
                </div>
            </div>

            {/* 팀 선택 */}
            <div className="mt-4">
                <div className="text-[12px] text-[#6B7280] mb-1">팀</div>
                <div className="flex flex-wrap gap-2">
                    {teamOptions.map((t) => {
                        const active = team === t;
                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTeam(t)}
                                className={[
                                    "h-8 px-3 rounded-full border text-[12px]",
                                    active ? "bg-[#EEF2FF] border-[#C7D2FE] text-[#4F46E5]" : "bg-white text-[#6B7280] hover:bg-[#F3F4F6]"
                                ].join(" ")}
                            >
                                {t}
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => setTeam("")}
                        className={[
                            "h-8 px-3 rounded-full border text-[12px]",
                            !team ? "bg-[#EEF2FF] border-[#C7D2FE] text-[#4F46E5]" : "bg-white text-[#6B7280] hover:bg-[#F3F4F6]"
                        ].join(" ")}
                        title="선택 해제"
                    >
                        없음
                    </button>
                </div>
            </div>

            {/* 위치 */}
            <div className="mt-4">
                <div className="text-[12px] text-[#6B7280] mb-1">위치</div>
                <input className="w-full h-9 px-3 rounded-md border bg-white"
                       value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            {/* 참석자 */}
            <div className="mt-4">
                <div className="text-[12px] text-[#6B7280] mb-1">참여자</div>
                <ParticipantsEditor
                    meetingId={meetingId}
                    ownerId={ownerId}
                    value={participants}
                    onChange={setParticipants}
                />
                {USE_REALTIME_PARTICIPANTS && (
                    <div className="mt-2 text-[11px] text-[#9CA3AF]">실시간 편집 활성화됨 · 삭제는 생성자만 가능</div>
                )}
            </div>
        </div>
    );
}

/* === 참가자 편집(간단) === */
function ParticipantsEditor({
                                ownerId, value, onChange,
                            }: {
    meetingId: string;
    ownerId: string;
    value: string;
    onChange: (v: string) => void;
}) {
    const me = React.useMemo(getLocalUser, []);
    const list = React.useMemo(
        () => value.split(",").map((s) => s.trim()).filter(Boolean),
        [value]
    );
    const [input, setInput] = React.useState("");

    const add = (name: string) => {
        const v = name.trim();
        if (!v || list.includes(v)) return;
        onChange([...list, v].join(", "));
        setInput("");
    };
    const remove = (name: string) => {
        if (me.id !== ownerId) return;       // 생성자만 삭제
        onChange(list.filter((x) => x !== name).join(", "));
    };

    return (
        <>
            <div className="w-full rounded-md border bg-white p-2">
                <div className="flex flex-wrap gap-1">
                    {list.map((n) => (
                        <span key={n}
                              className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] px-2 py-[2px] text-[12px]">
              {n}
                            {me.id === ownerId && (
                                <button className="text-[#6B7280]" onClick={() => remove(n)} type="button">×</button>
                            )}
            </span>
                    ))}
                    <input
                        className="flex-1 min-w-[120px] outline-none text-[12px] px-1 py-[2px]"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                add(input);
                            }
                        }}
                        placeholder="이름 입력 후 Enter"
                    />
                </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
                {["박조아", "김개발", "배진아", "이디자"].map((m) => (
                    <button key={m} type="button"
                            className="h-7 px-2 rounded-full border text-[12px] bg-white text-[#6B7280] hover:bg-[#F3F4F6]"
                            onClick={() => add(m)}>
                        {m}
                    </button>
                ))}
            </div>
        </>
    );
}