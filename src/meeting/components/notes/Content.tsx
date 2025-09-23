import TemplatePanel from "./TemplatePanel";
import {useState} from "react";
import MarkdownEditor from "./MarkdownEditor.tsx";
import NotionEditor from "./NotionEditor";

function ChevronDown({ open }: { open: boolean }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
            fill="currentColor"
            aria-hidden
        >
            <path
                fillRule="evenodd"
                d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
            />
        </svg>
    );
}

type Props = {
    title: string;
    setTitle: (v: string) => void;

    notes: string;
    setNotes: (v: string) => void;

    links: string[];
    setLinks: (v: string[]) => void;
    linkOpen: boolean;
    setLinkOpen: (v: boolean) => void;
    linkInput: string;
    setLinkInput: (v: string) => void;

    participants: string;
};

export default function Content({
                                    title, setTitle,
                                    notes, setNotes,
                                    links, setLinks,
                                    linkOpen, setLinkOpen,
                                    linkInput, setLinkInput,
                                    participants,
                                }: Props) {

    const [panelOpen, setPanelOpen] = useState(false);
    const [activeTpl, setActiveTpl] = useState<"standup" | "4ls" | "kpt" | null>(null);

    const openPanel = (tpl: "standup" | "4ls" | "kpt") => {
        setActiveTpl(tpl);
        setPanelOpen(true);
    }

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

            {/* 링크 섹션 */}
            <div className="pt-1">
                <div className="flex h-5 items-center gap-2 text-sm">
                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-sm px-1.5 py-1 hover:bg-slate-300/30"
                        onClick={() => setLinkOpen(!linkOpen)}
                    >
                        <ChevronDown open={linkOpen} />
                        <div className="font-medium text-[#6B7280]">링크</div>
                        <div className="text-xs text-[#9CA3AF]">{links.length}</div>
                    </button>
                    <button
                        type="button"
                        className="h-5 w-5 inline-flex items-center justify-center rounded-sm border border-[#E5E7EB] bg-[#F3F4F6] hover:bg-[#E5E7EB]"
                        onClick={() => setLinkOpen(true)}
                        title="링크 추가"
                    >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                        </svg>
                    </button>
                </div>

                {linkOpen && (
                    <div className="mt-3">
                        <div className="flex items-center gap-2">
                            <input
                                className="flex-1 h-10 px-3 rounded-md border"
                                placeholder="URL 붙여넣기"
                                value={linkInput}
                                onChange={(e) => setLinkInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && linkInput.trim()) {
                                        setLinks([linkInput.trim(), ...links]);
                                        setLinkInput("");
                                    }
                                }}
                            />
                            <button
                                className="h-10 px-3 rounded-md border"
                                onClick={() => {
                                    const v = linkInput.trim();
                                    if (!v) return;
                                    setLinks([v, ...links]);
                                    setLinkInput("");
                                }}
                            >
                                추가
                            </button>
                        </div>

                        {!!links.length && (
                            <ul className="mt-2 space-y-1 text-sm">
                                {links.map((u: string, i: number) => (
                                    <li key={`${u}-${i}`} className="flex items-center justify-between gap-2">
                                        <a href={u} target="_blank" rel="noreferrer" className="underline truncate">
                                            {u}
                                        </a>
                                        <button
                                            className="text-xs underline text-[#6B7280]"
                                            onClick={() => setLinks(links.filter((_, idx) => idx !== i))}
                                        >
                                            삭제
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* 노트(노션 느낌) */}
            <NotionEditor
                value={notes}
                onChange={setNotes}
                placeholder="빈 화면에 바로 작성하세요.  / 로 명령을 열 수 있어요"
            />


            {/*/!* 노트 (마크다운) *!/*/}
            {/*<div>*/}
            {/*    <MarkdownEditor*/}
            {/*        value={notes}*/}
            {/*        onChange={setNotes}*/}
            {/*        placeholder="빈 화면에 바로 작성하세요. (# 제목, - 목록, **굵게** 등)"*/}
            {/*    />*/}
            {/*</div>*/}

            {/* 템플릿 */}
            <div className="rounded border border-[#E5E7EB] bg-white pb-2">
                <div className="mb-1.5 border-b border-[#E5E7EB] px-3 py-2 text-sm text-[#6B7280]">템플릿</div>

                {/* [CHANGED] 클릭 시 패널 오픈 */}
                <button type="button" className="relative flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-200/50" onClick={() => openPanel("standup")}>
                    <div className="max-w-full truncate">스탠드업 미팅</div>
                    <div className="flex-shrink-0 rounded-lg bg-[#E5E7EB] px-1.5 py-[3px] text-[10px] text-[#6B7280]">기본</div>
                </button>

                <button type="button" className="relative flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-200/50" onClick={() => openPanel("4ls")}>
                    <div className="max-w-full truncate">4Ls 회고</div>
                    <div className="flex-shrink-0 rounded-lg bg-[#E5E7EB] px-1.5 py-[3px] text-[10px] text-[#6B7280]">기본</div>
                </button>

                <button type="button" className="relative flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-200/50" onClick={() => openPanel("kpt")}>
                    <div className="max-w-full truncate">KPT 회고</div>
                    <div className="flex-shrink-0 rounded-lg bg-[#E5E7EB] px-1.5 py-[3px] text-[10px] text-[#6B7280]">기본</div>
                </button>

                <TemplatePanel
                    open={panelOpen}
                    template={activeTpl}
                    participantsStr={participants}
                    onApply={(text) => {
                        setNotes(text);
                        setPanelOpen(false);
                    }}
                    onClose={() => setPanelOpen(false)}
                />
            </div>
        </div>
    );
}