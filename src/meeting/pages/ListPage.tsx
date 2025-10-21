import React from "react";
import { LayoutGroup } from "framer-motion";
import { MeetingSubnav } from "./MeetingLayout";
import { useCalendar } from "../hooks/useCalendar";
import { useNavigate } from "react-router-dom";
import { meetingApi } from "../../api/meetingApi";

const PAGE_SIZE = 10;

export default function MeetingListPage() {
    const { meetings } = useCalendar();
    const navigate = useNavigate();

    const [page, setPage] = React.useState(1);
    const [deleting, setDeleting] = React.useState<string | null>(null);

    const sorted = React.useMemo(() => {
        return [...(meetings ?? [])].sort((a: any, b: any) => {
            const ta = new Date(a?.start ?? 0).getTime();
            const tb = new Date(b?.start ?? 0).getTime();
            return tb - ta;
        });
    }, [meetings]);

    const total = sorted.length;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const startIndex = (page - 1) * PAGE_SIZE;
    const pageItems = sorted.slice(startIndex, startIndex + PAGE_SIZE);

    const goPrev = () => setPage((p) => Math.max(1, p - 1));
    const goNext = () => setPage((p) => Math.min(pageCount, p + 1));

    const fmtDate = (iso?: string | Date) => {
        if (!iso) return "-";
        const d = typeof iso === "string" ? new Date(iso) : iso;
        if (isNaN(d.getTime())) return "-";
        return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    };

    const getStatus = (m: any): "before" | "done" => {
        // 상태: 회의 전 / 회의 완료 (동일)
        if (m?.status === "DONE") return "done";
        if (m?.status === "SCHEDULED") return "before";
        const end = new Date(m?.end ?? m?.start ?? 0).getTime();
        return end && end < Date.now() ? "done" : "before";
    };

    const pad2 = (n: number) => String(n).padStart(2, "0");

    const handleDelete = async (meetingId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("이 회의를 삭제하시겠습니까?")) return;
        
        try {
            setDeleting(meetingId);
            await meetingApi.deleteMeeting(meetingId);
            window.location.reload(); // 간단하게 새로고침
        } catch (error: any) {
            console.error("삭제 실패:", error);
            if (error?.response?.status === 403) {
                alert("삭제 권한이 없습니다.");
            } else if (error?.response?.status === 404) {
                alert("이미 삭제된 회의입니다.");
                window.location.reload();
            } else {
                alert("삭제 중 오류가 발생했습니다.");
            }
        } finally {
            setDeleting(null);
        }
    };

    const handleRowClick = (meetingId: string) => {
        navigate(`/meeting/${meetingId}`);
    };

    return (
        <LayoutGroup>
            <div className="min-h-[100dvh] w-full bg-[#F5F6F8] px-8 py-6 flex flex-col">
                {/* 페이지 타이틀 */}
                <div className="mx-auto w-full max-w-[1600px] 2xl:max-w-[1920px] px-6 mb-6 flex items-center min-h-0">
                    <div className="flex items-baseline gap-2 shrink-0">
                        <h1 className="text-[18px] font-bold text-[#1F2937] leading-none">
                            나의 미팅 일정
                        </h1>
                        <p className="text-[12px] text-[#98A2B3] leading-none">
                            현재 미팅 일정을 확인해보세요
                        </p>
                    </div>

                    {/* 구분선 */}
                    <div className="ml-3 flex-1 h-px bg-gradient-to-r from-[#E5E7EB] via-[#E5E7EB] to-transparent rounded-full" />
                </div>

                {/* 카드 래퍼 */}
                <div className="mx-auto w-full max-w-[1600px] 2xl:max-w-[1920px] px-6 pb-4 flex-1 flex">
                    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(31,41,55,0.06)] min-h-0">
                        {/* 상단 서브 네브 */}
                        <div className="shrink-0">
                            <MeetingSubnav />
                        </div>

                        {/* 본문 */}
                        <div className="flex-1 min-h-0 px-8 py-6 flex flex-col">
                            {/* 테이블 */}
                            <div className="flex-1 min-h-0 overflow-auto rounded-xl">
                                <div className="min-w-[980px]">
                                    {/* 헤더 */}
                                    <div className="grid grid-cols-[88px_1fr_1fr_1fr_180px_100px] items-center px-6 h-12 border-b border-[#EEF2F6] text-[12px] text-[#6B7280] font-semibold">
                                        <div className="tracking-wide">번호</div>
                                        <div className="tracking-wide">제목</div>
                                        <div className="tracking-wide">참여팀</div>
                                        <div className="tracking-wide">회의 날짜</div>
                                        <div className="tracking-wide justify-self-end pr-2">상태</div>
                                        <div className="tracking-wide text-center">작업</div>
                                    </div>

                                    {/* 로우 */}
                                    {pageItems.map((m: any, i: number) => {
                                        const num = startIndex + i + 1;
                                        const team =
                                            Array.isArray(m?.teams) && m.teams.length
                                                ? m.teams.join(", ")
                                                : (m.team ?? m.teamName ?? "-");
                                        const status = getStatus(m);

                                        return (
                                            <div
                                                key={m.id ?? num}
                                                //행 높이/간격/hover 색상
                                                className="grid grid-cols-[88px_1fr_1fr_1fr_180px_100px] items-center px-6 min-h-16 border-b border-[#EEF2F6] hover:bg-[#FAFBFF] cursor-pointer"
                                                onClick={() => handleRowClick(m.id)}
                                            >
                                                {/* 번호 */}
                                                <div className="text-[14px]">
                                                  <span className="inline-flex h-6 min-w-8 items-center justify-center text-[#6B7280] font-medium px-2">
                                                    {pad2(num)}
                                                  </span>
                                                </div>

                                                {/* 제목 */}
                                                <div className="text-[14px] text-[#6B7280] font-medium line-clamp-1">
                                                    {m.title ?? "-"}
                                                </div>

                                                {/* 참여팀 */}
                                                <div className="text-[14px] text-[#6B7280]">{team}</div>

                                                {/* 회의 날짜 */}
                                                <div className="text-[14px] text-[#6B7280]">{fmtDate(m.start)}</div>

                                                {/* 상태 */}
                                                <div className="justify-self-end pr-2">
                                                    <StatusPill kind={status} />
                                                </div>

                                                {/* 작업 버튼 */}
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={(e) => handleDelete(m.id, e)}
                                                        disabled={deleting === m.id}
                                                        className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                                    >
                                                        {deleting === m.id ? "삭제중..." : "삭제"}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* 비어있을 때 */}
                                    {!pageItems.length && (
                                        <div className="flex items-center justify-center h-40 text-[#6B7280]">
                                            데이터가 없습니다.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 페이지네이션 */}
                            <div className="mt-4 flex items-center justify-center">
                                <div className="inline-flex items-center gap-2">
                                    <button
                                        className="px-3 h-9 rounded-md text-[#6B7280] disabled:opacity-40"
                                        onClick={goPrev}
                                        disabled={page <= 1}
                                    >
                                        이전
                                    </button>

                                    {/* 숫자 페이지 (최대 7개 윈도우) */}
                                    <div className="inline-flex items-center gap-1">
                                        {Array.from({ length: pageCount }, (_, i) => i + 1)
                                            .filter((n) => {
                                                const w = 3;
                                                return n === 1 || n === pageCount || (n >= page - w && n <= page + w);
                                            })
                                            .map((n, i, arr) => {
                                                const prev = arr[i - 1];
                                                const needDots = prev && n - prev > 1;
                                                return (
                                                    <React.Fragment key={n}>
                                                        {needDots && <div className="px-2 text-[#6B7280]">…</div>}
                                                        <button
                                                            className={[
                                                                "h-9 min-w-9 px-2 rounded-md border",
                                                                n === page
                                                                    ? "bg-[#6D6CF8] text-white font-medium"
                                                                    : "border-white text-[#6B7280] hover:bg-gray-50",
                                                            ].join(" ")}
                                                            onClick={() => setPage(n)}
                                                        >
                                                            {n}
                                                        </button>
                                                    </React.Fragment>
                                                );
                                            })}
                                    </div>

                                    <button
                                        className="px-3 h-9 rounded-md text-[#6B7280] disabled:opacity-40"
                                        onClick={goNext}
                                        disabled={page >= pageCount}
                                    >
                                        다음
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutGroup>
    );
}

function StatusPill({ kind }: { kind: "before" | "done" }) {
    const isBefore = kind === "before";
    const label = isBefore ? "회의 전" : "회의 완료";

    return (
        <span
            className={[
                "inline-flex items-center h-8 px-3 rounded-xl text-[12px] font-medium whitespace-nowrap border",
                isBefore
                    ? "bg-white text-[#6B7280] border-[#C9CEDA] shadow-[0_1px_0_rgba(0,0,0,0.02)]"
                    : "bg-[#E9F6EE] text-[#2F7D32] border-[#CBE6D3]"
            ].join(" ")}
        >
      {label}
    </span>
    );
}