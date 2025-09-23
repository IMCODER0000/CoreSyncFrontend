import React from "react";

type TemplateId = "standup" | "4ls" | "kpt";

type Props = {
    open: boolean;
    template: TemplateId | null;
    participantsStr: string;
    onApply: (content: string) => void;
    onClose: () => void;
};

const T_LABEL: Record<TemplateId, string> = {
    standup: "스탠드업 미팅",
    "4ls": "4Ls 회고",
    kpt: "KPT 회고",
};

// 참가자별 템플릿 생성기
function buildContent(tpl: TemplateId, names: string[]) {
    const safe = (s: string) => s.trim();
    const people = names.map(safe).filter(Boolean);
    const header = T_LABEL[tpl];

    const blocks = people.length ? people : ["(참석자 미지정)"];

    const sections = blocks.map((name) => {
        switch (tpl) {
            case "standup":
                return `## ${name}
                        - 어제 한 일:
                        - 오늘 할 일:
                        - 이슈/블로커:
                        `;
            case "4ls":
                return `## ${name}
                        - Liked:
                        - Learned:
                        - Lacked:
                        - Longed for:
                        `;
            case "kpt":
            default:
                return `## ${name}
                        - Keep:
                        - Problem:
                        - Try:
                        `;
        }
    });

    return `${header}\n\n${sections.join("\n")}`.trim();
}

export default function TemplatePanel({
                                          open,
                                          template,
                                          participantsStr,
                                          onApply,
                                          onClose,
                                      }: Props) {
    const [selected, setSelected] = React.useState<string[]>([]);
    const [preview, setPreview] = React.useState("");

    const participants = React.useMemo(() => {
        // 쉼표(,) 또는 공백 기반 대충 분리 + 중복 제거
        const raw = participantsStr || "";
        const toks = raw
            .split(/[,|\s]+/)
            .map((s) => s.trim())
            .filter(Boolean);
        return Array.from(new Set(toks));
    }, [participantsStr]);

    // [NEW] 템플릿/선택 변경 시 미리보기 갱신
    React.useEffect(() => {
        if (!template) return;
        setPreview(buildContent(template, selected.length ? selected : participants));
    }, [template, selected, participants]);

    if (!open || !template) return null;

    const allChecked = selected.length && selected.length === participants.length;

    return (
        <div className="mt-4">
            <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium">{T_LABEL[template]}</div>
                    <div className="flex gap-2">
                        <button
                            className="h-8 px-3 rounded-md border"
                            onClick={onClose}
                            type="button"
                            aria-label="닫기"
                        >
                            닫기
                        </button>
                        <button
                            className="h-8 px-3 rounded-md bg-[#6D6CF8] text-white"
                            onClick={() => onApply(preview)}
                            type="button"
                        >
                            적용
                        </button>
                    </div>
                </div>

                {/* 참석자 선택 */}
                <div className="mb-3">
                    <div className="text-xs text-[#6B7280] mb-1">참석자 선택</div>
                    {participants.length ? (
                        <div className="flex flex-wrap gap-2">
                            {participants.map((name) => {
                                const checked = selected.includes(name);
                                return (
                                    <label
                                        key={name}
                                        className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 cursor-pointer ${
                                            checked ? "bg-[#EEF2FF] border-[#C7D2FE]" : "bg-white"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="accent-[#6D6CF8]"
                                            checked={checked}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelected((arr) => [...arr, name]);
                                                else setSelected((arr) => arr.filter((n) => n !== name));
                                            }}
                                        />
                                        <div className="text-sm">{name}</div>
                                    </label>
                                );
                            })}
                            <button
                                type="button"
                                className="text-xs underline text-[#6B7280]"
                                onClick={() =>
                                    setSelected(allChecked ? [] : [...participants])
                                }
                            >
                                {allChecked ? "전체 해제" : "전체 선택"}
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm text-[#9CA3AF]">
                            참석자가 없습니다. 우측 <b>세부 정보</b>에서 참석자를 입력해 주세요.
                        </div>
                    )}
                </div>

                {/* 미리보기 */}
                <div>
                    <div className="text-xs text-[#6B7280] mb-1">미리보기</div>
                    <textarea
                        className="w-full min-h-[180px] rounded-md border p-3 outline-none"
                        value={preview}
                        onChange={(e) => setPreview(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}