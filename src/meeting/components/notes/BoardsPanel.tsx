import { useMemo, useState } from "react";

// 유틸
function genId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function parseParticipants(input: string): string[] {
    return Array.from(
        new Set(
            (input || "")
                .split(/[,\s]+/g)
                .map((s) => s.trim())
                .filter(Boolean),
        ),
    );
}

// 타입
type ColumnKey = "done" | "todo" | "note" | "good" | "learned";

type Item = {
    id: string;
    content: string;
    createdAt: number;
};

type ColumnUser = {
    id: string;
    name: string;
    items: Item[];
    open?: boolean;
};

type Column = {
    id: string;
    key: ColumnKey;
    label: string;
    users: ColumnUser[];
};

// 항목 선택지
const COLUMN_OPTIONS: Array<{ key: ColumnKey; label: string; badgeClass: string }> = [
    { key: "done", label: "완료한 일",  badgeClass: "bg-[#FDEFC8] text-[#7A5B17]" },
    { key: "todo", label: "해야 할 일", badgeClass: "bg-[#DDEBFF] text-[#2E5AAC]" },
    { key: "note", label: "특이사항",   badgeClass: "bg-[#FAD7D8] text-[#9B1C1F]" },
    { key: "good", label: "좋았던 점",  badgeClass: "bg-[#E3F7D3] text-[#3A6B1E]" },
    { key: "learned", label: "배운 점",  badgeClass: "bg-[#EAE7FF] text-[#4B3DB8]" },
];

const findOption = (k: ColumnKey) => COLUMN_OPTIONS.find((o) => o.key === k)!;

export default function BoardsPanel({ participantsStr }: { participantsStr: string }) {
    // 보드 배열 제거 → 단일 패널이 가진 열 목록만 관리
    const [columns, setColumns] = useState<Column[]>([]);
    const participants = useMemo(() => parseParticipants(participantsStr), [participantsStr]);

    // [NEW] 현재 패널에 "이미 추가된 사용자" 이름 목록(중복 제거)
    const globalUserNames = useMemo(
        () => Array.from(new Set(columns.flatMap((c) => c.users.map((u) => u.name)))),
        [columns],
    );

    // [CHANGED] 새 열 추가 시, "기존에 추가된 사용자들"을 모두 기본 탑재
    function handleAddColumn(key: ColumnKey) {
        if (columns.some((c) => c.key === key)) return; // 동일 항목 중복 생성 방지 (원하면 제거 가능)
        const opt = findOption(key);

        // [NEW] 기존 사용자 목록을 기반으로 초기 users 구성
        const initialUsers: ColumnUser[] = globalUserNames.map((name) => ({
            id: genId(),
            name,
            items: [],
            open: true,
        }));

        const col: Column = { id: genId(), key, label: opt.label, users: initialUsers };
        setColumns((prev) => [...prev, col]);
    }

    function handleRemoveColumn(colId: string) {
        setColumns((prev) => prev.filter((c) => c.id !== colId));
    }

    function handleUpdateColumn(colId: string, patch: Partial<Column>) {
        setColumns((prev) => prev.map((c) => (c.id === colId ? { ...c, ...patch } : c)));
    }

    // [NEW] 글로벌 사용자 추가: 한 번 추가하면 모든 열에 자동 반영
    function handleAddUserGlobal(name: string) {
        const userName = (name || "").trim();
        if (!userName) return;

        setColumns((prev) =>
            prev.map((col) => {
                if (col.users.some((u) => u.name === userName)) return col; // 열에 이미 있으면 스킵
                const u: ColumnUser = { id: genId(), name: userName, items: [], open: true };
                return { ...col, users: [...col.users, u] };
            }),
        );
    }

    return (
        <div className="mt-6">
            <ColumnsRow
                columns={columns}
                onAddColumn={handleAddColumn}
                onRemoveColumn={handleRemoveColumn}
                onUpdateColumn={handleUpdateColumn}
                participants={participants}
            />

            {/* [NEW] 열 바깥(패널 공통)에서 사용자 추가 → 모든 열에 일괄 적용 */}
            <div className="mt-3">
                <AddUserRow
                    participants={participants}
                    onSelect={handleAddUserGlobal}
                />
            </div>
        </div>
    );
}

// 열(항목) 행
function ColumnsRow({
                        columns,
                        onAddColumn,
                        onRemoveColumn,
                        onUpdateColumn,
                        participants,
                    }: {
    columns: Column[];
    onAddColumn: (key: ColumnKey) => void;
    onRemoveColumn: (colId: string) => void;
    onUpdateColumn: (colId: string, patch: Partial<Column>) => void;
    participants: string[];
}) {
    return (
        <div className="flex gap-3 overflow-x-auto rounded-xl bg-[#F7FAFF] p-3">
            {columns.map((col) => (
                <ColumnCard
                    key={col.id}
                    data={col}
                    onRemove={() => onRemoveColumn(col.id)}
                    onUpdate={(patch) => onUpdateColumn(col.id, patch)}
                    participants={participants}
                />
            ))}

            {/* '+ 항목 추가' 카드 */}
            <AddColumnCard onSelect={onAddColumn} />
        </div>
    );
}

// '+ 항목 추가' 카드 (드롭다운)
function AddColumnCard({ onSelect }: { onSelect: (k: ColumnKey) => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="min-w-[220px] rounded-xl border-2 border-dashed border-[#D9E2F2] bg-white p-3">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full text-left text-[13px] text-[#6482C0]"
            >
                + 항목 추가
            </button>

            {open && (
                <div className="mt-2 max-h-60 overflow-auto rounded-md border border-[#E5E7EB] bg-white p-2 shadow">
                    <div className="mb-2 text-[12px] text-[#6B7280]">옵션 선택 또는 생성</div>
                    <div className="space-y-2">
                        {COLUMN_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                type="button"
                                onClick={() => {
                                    onSelect(opt.key);
                                    setOpen(false);
                                }}
                                className="flex w-full items-center justify-between rounded-md px-2 py-1 hover:bg-[#F8FAFC]"
                            >
                                <div className={`rounded px-2 py-[2px] text-[12px] ${opt.badgeClass}`}>{opt.label}</div>
                                <div className="text-[12px] text-[#9CA3AF]">추가</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// 단일 열 카드
function ColumnCard({
                        data,
                        onRemove,
                        onUpdate,
                        // participants, // (그대로 유지) 제안 목록 표시용으로만 사용
                    }: {
    data: Column;
    onRemove: () => void;
    onUpdate: (patch: Partial<Column>) => void;
    participants: string[];
}) {
    const opt = findOption(data.key);

    // 총 아이템 수
    const total = data.users.reduce((acc, u) => acc + u.items.length, 0);

    // [CHANGED] 사용자 추가/삭제/업데이트 로직은 유지하지만,
    //           "추가 UI"는 열 바깥으로 이동했으므로 여기선 호출하지 않음.
    const removeUser = (id: string) => onUpdate({ users: data.users.filter((u) => u.id !== id) });
    const updateUser = (id: string, patch: Partial<ColumnUser>) =>
        onUpdate({ users: data.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) });

    return (
        <div className="min-w-[320px] flex-1 rounded-xl border border-[#E6ECF4] bg-white p-3">
            {/* 열 헤더 */}
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`rounded px-2 py-[2px] text-[12px] ${opt.badgeClass}`}>{opt.label}</div>
                    <div className="text-[12px] text-[#6B7280]">{total}</div>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[12px] hover:bg-[#F8FAFC]"
                >
                    삭제
                </button>
            </div>

            {/* 사용자 섹션들 */}
            <div className="space-y-3">
                {data.users.map((u) => (
                    <UserSection
                        key={u.id}
                        data={u}
                        onRemove={() => removeUser(u.id)}          // [UNCHANGED] 열 단위로 제거
                        onToggle={() => updateUser(u.id, { open: !u.open })}
                        onAddItem={(content) =>
                            updateUser(u.id, {
                                items: [...u.items, { id: genId(), content, createdAt: Date.now() }],
                            })
                        }
                        onRemoveItem={(itemId) => updateUser(u.id, { items: u.items.filter((it) => it.id !== itemId) })}
                    />
                ))}
            </div>

            {/* [REMOVED] 열 내부의 '+ 사용자 추가' UI (요청: 전체 패널 단일로 이동) */}
        </div>
    );
}

// '+ 사용자 추가' Row (그대로 재사용, 위치만 상위로 이동)
function AddUserRow({
                        participants,
                        onSelect,
                    }: {
    participants: string[];
    onSelect: (name: string) => void;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="mt-2">
            <button type="button" onClick={() => setOpen((v) => !v)} className="text-[13px] text-[#7B91F8]">
                + 사용자 추가
            </button>
            {open && (
                <div className="mt-2 w-full max-w-[240px] rounded-md border border-[#E5E7EB] bg-white p-2 shadow">
                    {participants.length === 0 && (
                        <div className="p-2 text-[12px] text-[#94A3B8]">참석자를 먼저 입력하세요.</div>
                    )}
                    {participants.map((name) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => {
                                onSelect(name); // [CHANGED] 이제 전체 열에 일괄 반영
                                setOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-[#F8FAFC]"
                            title={name}
                        >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[12px] text-[#6B7280]">
                                {name[0]}
                            </div>
                            <div className="text-[13px] text-[#111827]">{name}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// 사용자 섹션(접기/펼치기 + 내용 추가)
function UserSection({
                         data,
                         onRemove,
                         onToggle,
                         onAddItem,
                         onRemoveItem,
                     }: {
    data: ColumnUser;
    onRemove: () => void;
    onToggle: () => void;
    onAddItem: (content: string) => void;
    onRemoveItem: (itemId: string) => void;
}) {
    const [adding, setAdding] = useState(false);
    const [text, setText] = useState("");

    const count = data.items.length;

    const add = () => {
        const v = text.trim();
        if (!v) return;
        onAddItem(v);
        setText("");
        // 계속 추가할 수 있도록 adding 유지
    };

    return (
        <div className="rounded-lg border border-[#EEF2F7]">
            {/* 섹션 헤더 */}
            <div className="flex items-center justify-between rounded-t-lg bg-[#F8FAFC] px-3 py-2">
                <button type="button" onClick={onToggle} className="flex items-center gap-2">
                    <div className="text-[12px] text-[#64748B]">{data.open ? "▾" : "▸"}</div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[12px] text-[#6B7280]">
                            {data.name[0]}
                        </div>
                        <div className="text-[13px] text-[#111827]">{data.name}</div>
                        <div className="text-[12px] text-[#9CA3AF]">{count}</div>
                    </div>
                </button>
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[12px] text-[#DC2626] hover:bg-[#FFF1F2]"
                >
                    삭제
                </button>
            </div>

            {/* 내용 리스트 + 추가 */}
            {data.open && (
                <div className="space-y-2 p-3">
                    {data.items.map((it) => (
                        <div key={it.id} className="rounded-md border border-[#E5E7EB] bg-white p-2">
                            <div className="whitespace-pre-wrap text-[13px] text-[#111827]">{it.content}</div>
                            <div className="mt-1 flex items-center justify-between">
                                <div className="text-[11px] text-[#94A3B8]">{new Date(it.createdAt).toLocaleString()}</div>
                                <button
                                    type="button"
                                    onClick={() => onRemoveItem(it.id)}
                                    className="rounded-md border border-[#F3F4F6] bg-white px-2 py-1 text-[11px] text-[#DC2626] hover:bg-[#FFF1F2]"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* '+ 내용 추가' → 입력 박스 열기 */}
                    {!adding && (
                        <button
                            type="button"
                            onClick={() => setAdding(true)}
                            className="rounded-md border-2 border-dashed border-[#D9E2F2] px-3 py-2 text-left text-[13px] text-[#7B91F8]"
                        >
                            + 내용 추가
                        </button>
                    )}
                    {adding && (
                        <div className="space-y-2">
                            <div className="rounded-lg bg-[#F3F6FB] p-2 text-[13px] text-[#94A3B8]">내용을 입력해 주세요.</div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-[#CFDAE8] px-3 py-2 text-[13px] outline-none placeholder:text-[#9CA3AF] focus:border-[#9DB8FF] focus:ring-2 focus:ring-[#E4EEFF]"
                                placeholder="내용 입력"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        add();
                                    }
                                }}
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={add}
                                    className="rounded-md bg-[#7B91F8] px-3 py-2 text-[13px] text-white"
                                >
                                    추가
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAdding(false);
                                        setText("");
                                    }}
                                    className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] hover:bg-[#F8FAFC]"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
