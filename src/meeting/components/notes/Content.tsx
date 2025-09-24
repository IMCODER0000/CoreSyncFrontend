import TemplatePanel from "./TemplatePanel";
import {useState} from "react";
import MarkdownEditor from "./MarkdownEditor.tsx";
import Link from "./Link.tsx";
import TabletBoard from "./TabletBoard.tsx";

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

            {/* 링크 */}
            <Link
                links={links} setLinks={setLinks}
                linkOpen={linkOpen} setLinkOpen={setLinkOpen}
                linkInput={linkInput} setLinkInput={setLinkInput}
            />

            {/*/!* 노트(노션 느낌) *!/*/}
            {/*<NotionLikeEditor*/}
            {/*    value={notes}*/}
            {/*    onChange={setNotes}*/}
            {/*    placeholder="빈 화면에 바로 작성하세요.  / 로 명령을 열 수 있어요"*/}
            {/*/>*/}


            {/* 노트 (마크다운) */}
            <div>
                <MarkdownEditor
                    value={notes}
                    onChange={setNotes}
                    placeholder="빈 화면에 바로 작성하세요. (# 제목, - 목록, **굵게** 등)"
                />
            </div>

            <TabletBoard participantsStr={participants} />

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