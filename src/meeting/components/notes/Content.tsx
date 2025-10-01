import TemplatePanel from "./TemplatePanel";
import {useEffect, useMemo, useRef, useState} from "react";
import MarkdownEditor from "./MarkdownEditor.tsx";
import Link from "./Link.tsx";
import BoardsPanel from "./BoardsPanel.tsx";

type Props = {
    title: string;
    setTitle: (v: string) => void;
    notes: string;
    setNotes: (v: string) => void;
    links: string[];
    setLinks: (v: string[]) => void;
    linkOpen: boolean;
    setLinkOpen: (v: boolean) => void;
    // linkInput: string;
    // setLinkInput: (v: string) => void;

    participants: string;
};

export default function Content({
                                    title, setTitle,
                                    notes, setNotes,
                                    links, setLinks,
                                    linkOpen, setLinkOpen,
                                    participants,
                                }: Props) {

    const [panelOpen, setPanelOpen] = useState(false);
    const [activeTpl, setActiveTpl] = useState<"standup" | "4ls" | "kpt" | null>(null);

    // 참가자 파싱(유지)
    const participantList = useMemo(
        () => participants.split(",").map(s => s.trim()).filter(Boolean),
        [participants]
    );

    // ===== 보드 더티/템플릿 표시 =====
    const [boardDirty, setBoardDirty] = useState(false);
    const currentTemplateRef = useRef<"standup" | "4ls" | "kpt" | null>(null);
    const [showTemplates, setShowTemplates] = useState(true); // [CHANGED] 초기에도 템플릿 보이도록 true

    // BoardsPanel 이벤트 수신
    useEffect(() => {
        const onEdited   = () => setBoardDirty(true);
        const onCleared  = () => setBoardDirty(false);
        const onNonEmpty = () => setShowTemplates(false);  // 보드 생기면 템플릿 숨김
        const onEmpty    = () => {
            setShowTemplates(true);
            setBoardDirty(false);
        };
        window.addEventListener("boards:edited" as any, onEdited);
        window.addEventListener("boards:cleared" as any, onCleared);
        window.addEventListener("boards:nonempty" as any, onNonEmpty);
        window.addEventListener("boards:empty" as any, onEmpty);
        return () => {
            window.removeEventListener("boards:edited" as any, onEdited);
            window.removeEventListener("boards:cleared" as any, onCleared);
            window.removeEventListener("boards:nonempty" as any, onNonEmpty);
            window.removeEventListener("boards:empty" as any, onEmpty);
        };
    }, []);

    // ===== 템플릿 적용 → 보드 초기화 =====
    function initBoardFromTemplate(tpl: "standup" | "4ls" | "kpt") {
        const defs = {
            standup: { title: "데일리 스크럼", columns: [
                    { key: "done", label: "완료한 일" },
                    { key: "todo", label: "해야 할 일" },
                    { key: "note", label: "특이사항" },
                ]},
            "4ls": { title: "4Ls 회고", columns: [
                    { key: "good",    label: "좋았던 점" },
                    { key: "learned", label: "배운 점" },
                    { key: "note",    label: "바라는 점" },
                ]},
            kpt: { title: "KPT 회고", columns: [
                    { key: "good", label: "유지할 점" },
                    { key: "todo", label: "시도할 점" },
                    { key: "note", label: "문제점" },
                ]},
        } as const;

        const payload = {
            template: tpl,
            title: defs[tpl].title,
            columns: defs[tpl].columns,
            // participants: participantList, // 초기 참석자 자동 생성 안 함(요청)
            ts: Date.now(),
        };

        try {
            window.dispatchEvent(new CustomEvent("boards:init", { detail: payload }) as any);
        } catch {}

        currentTemplateRef.current = tpl;
        setBoardDirty(false);
        setShowTemplates(false); // 보드 생기면 템플릿 숨김
    }

    function onTemplateClick(tpl: "standup" | "4ls" | "kpt") {
        if (currentTemplateRef.current && currentTemplateRef.current !== tpl && boardDirty) {
            const ok = window.confirm("현재 보드에 추가된 내용이 사라질 수 있어요. 템플릿을 변경할까요?");
            if (!ok) return;
        }
        initBoardFromTemplate(tpl);
        setPanelOpen(false);
        setActiveTpl(null);
    }

    const onApplyFromPanel = (text: string) => {
        setNotes(text);
        if (activeTpl) onTemplateClick(activeTpl);
    };

    const openPanel = (tpl: "standup" | "4ls" | "kpt") => {
        setActiveTpl(tpl);
        setPanelOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* 제목 */}
            <div className="flex items-start gap-2">
                <span className="mt-[10px] inline-block h-3 w-3 rounded-full" style={{ backgroundColor: "#BCE18D" }} />
                <textarea
                    id="title"
                    rows={1}
                    placeholder="제목을 입력해 주세요."
                    className="w-full resize-none bg-transparent outline-none text-[20px] font-semibold leading-[28px] scrollbar-hide"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* 링크 */}
            <Link
                links={links} setLinks={setLinks}
                linkOpen={linkOpen} setLinkOpen={setLinkOpen}
            />

            {/* 노트 */}
            <div>
                <MarkdownEditor
                    value={notes}
                    onChange={setNotes}
                    placeholder="빈 화면에 바로 작성하세요. (# 제목, - 목록, **굵게** 등)"
                />
            </div>

            {/* 보드 */}
            <BoardsPanel participantsStr={participants} />

            {/* 템플릿 — 보드 없을 때 항상 노출(초기 포함) */}
            {showTemplates && (
                <div className="rounded border border-[#E5E7EB] bg-white pb-2">
                    <div className="mb-1.5 border-b border-[#E5E7EB] px-3 py-2 text-sm text-[#6B7280]">템플릿</div>

                    <button type="button" className="relative flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-200/50" onClick={() => onTemplateClick("standup")}>
                        <div className="max-w-full truncate">스탠드업 미팅</div>
                        <div className="flex-shrink-0 rounded-lg bg-[#E5E7EB] px-1.5 py-[3px] text-[10px] text-[#6B7280]">기본</div>
                    </button>

                    <button type="button" className="relative flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-200/50" onClick={() => onTemplateClick("4ls")}>
                        <div className="max-w-full truncate">4Ls 회고</div>
                        <div className="flex-shrink-0 rounded-lg bg-[#E5E7EB] px-1.5 py-[3px] text-[10px] text-[#6B7280]">기본</div>
                    </button>

                    <button type="button" className="relative flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-200/50" onClick={() => onTemplateClick("kpt")}>
                        <div className="max-w-full truncate">KPT 회고</div>
                        <div className="flex-shrink-0 rounded-lg bg-[#E5E7EB] px-1.5 py-[3px] text-[10px] text-[#6B7280]">기본</div>
                    </button>

                    {/* 패널은 파일 유지용. 필요 시 미리보기 UX로 복귀 가능 */}
                    <TemplatePanel
                        open={panelOpen}
                        template={activeTpl}
                        participantsStr={participants}
                        onApply={onApplyFromPanel}
                        onClose={() => setPanelOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}
