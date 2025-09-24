import React from "react";

/* ===========================
   타입 & 유틸 (로컬 상태만, DB 無영향)
   =========================== */
type Tone = "green" | "blue" | "red";

type Note = {
		id: string;
		text: string;
		participantIds: string[];
		createdAt: number;
};

type Pill = {
		id: "done" | "todo" | "special";
		label: string;
		tone: Tone;
		notes: Note[]; // count = notes.length
};

// 참가자 문자열을 배열로 변환(TemplatePanel 과 동일한 기준)
const parseParticipants = (s: string) =>
		Array.from(
				new Set(
						(s || "")
								.split(/[,|\s]+/)
								.map((t) => t.trim())
								.filter(Boolean)
				)
		);

// 색 토큰
const toneBadge: Record<Tone, string> = {
		green: "bg-[#8BD878] text-white",
		blue: "bg-[#8EBBF7] text-white",
		red: "bg-[#F2A5A5] text-white",
};

type Props = {
		participantsStr: string; // ", " 문자열 그대로 받음 (Content 에서 넘겨줌)
		className?: string;
};

export default function TabletBoard({ participantsStr, className = "" }: Props) {
		// 기본 3개 태블릿
		const [pills, setPills] = React.useState<Pill[]>([
				{ id: "done", label: "완료한 일", tone: "green", notes: [] },
				{ id: "todo", label: "해야 할 일", tone: "blue", notes: [] },
				{ id: "special", label: "특이사항", tone: "red", notes: [] },
		]);

		const participants = React.useMemo(
				() => parseParticipants(participantsStr),
				[participantsStr]
		);

		const [activeId, setActiveId] = React.useState<Pill["id"] | null>(null);
		const [filter, setFilter] = React.useState("");
		const [selected, setSelected] = React.useState<string[]>([]);
		const [text, setText] = React.useState("");

		// 태블릿 클릭 → 카드 열기/닫기
		const toggleOpen = (id: Pill["id"]) => {
				if (activeId === id) {
						setActiveId(null);
						setSelected([]);
						setText("");
						setFilter("");
				} else {
						setActiveId(id);
						setSelected([]);
						setText("");
						setFilter("");
				}
		};

		// 참가자 선택 토글
		const togglePerson = (name: string) =>
				setSelected((arr) =>
						arr.includes(name) ? arr.filter((n) => n !== name) : [...arr, name]
				);

		// 추가
		const addNote = () => {
				const t = text.trim();
				if (!activeId || !t) return;
				setPills((list) =>
						list.map((p) =>
								p.id !== activeId
										? p
										: {
												...p,
												notes: [
														...p.notes,
														{
																id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
																text: t,
																participantIds: selected.slice(),
																createdAt: Date.now(),
														},
												],
										}
						)
				);
				setSelected([]);
				setText("");
		};

		// 항목 삭제
		const removeNote = (pid: Pill["id"], nid: string) =>
				setPills((list) =>
						list.map((p) =>
								p.id === pid ? { ...p, notes: p.notes.filter((n) => n.id !== nid) } : p
						)
				);

		const nameBadge = (name: string) => (
				<div
						key={name}
						className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-0.5"
				>
						<div className="h-4 w-4 rounded-full bg-[#E5E7EB]" />
						<div className="text-[12px] text-[#111827]">{name}</div>
				</div>
		);

		return (
				<div className={`flex flex-col gap-3 ${className}`}>
						{/* === 상단 태블릿(피Ill) 줄 === */}
						<div className="flex flex-wrap items-stretch gap-4">
								{pills.map((it) => (
										<button
												key={it.id}
												type="button"
												onClick={() => toggleOpen(it.id)}
												className={`min-w-[240px] rounded-xl border border-[#E6ECF4] bg-white px-3 py-2 text-left hover:bg-[#F7FAFF] ${
														activeId === it.id ? "ring-2 ring-[#E5EEF9]" : ""
												}`}
										>
												<div className="flex items-center justify-between gap-2">
														<div className="flex items-center gap-2 min-w-0">
																<div className={`rounded-md px-2 py-1 text-[12px] ${toneBadge[it.tone]}`}>
																		{it.label}
																</div>
														</div>
														<div className="pl-2 text-[14px] text-[#94A3B8]">{it.notes.length}</div>
												</div>
										</button>
								))}
						</div>

						{/* === 에디터 카드(선택된 태블릿 있을 때만) === */}
						{activeId && (
								<div className="rounded-2xl border border-[#E6ECF4] bg-white shadow-[0_8px_30px_rgba(16,24,40,0.06)]">
										{/* 헤더 */}
										<div className="flex items-center justify-between px-4 py-3 border-b border-[#EEF2F7]">
												<div className="text-sm font-medium">
														{pills.find((p) => p.id === activeId)?.label}
												</div>
												<button
														type="button"
														className="h-8 w-8 rounded-md text-[#677285] hover:bg-[#F4F6FA]"
														onClick={() => toggleOpen(activeId)}
														title="닫기"
												>
														×
												</button>
										</div>

										{/* 본문: 좌 참석자 / 우 입력 & 리스트 */}
										<div className="grid gap-4 p-4 md:grid-cols-[360px_1fr]">
												{/* 좌: 참석자 선택 */}
												<div className="rounded-xl border border-[#E6ECF4] bg-[#F8FAFF] p-3">
														<div className="mb-2 text-[13px] font-medium text-[#111827]">
																참석자
														</div>

														{participants.length === 0 ? (
																<div className="text-sm text-[#9CA3AF]">
																		참석자가 없습니다. 우측 <b>세부 정보</b>에서 참석자를 입력해 주세요.
																</div>
														) : (
																<>
																		<input
																				value={filter}
																				onChange={(e) => setFilter(e.target.value)}
																				placeholder="이름 검색"
																				className="mb-2 h-9 w-full rounded-lg border border-[#CFDAE8]
																									 px-3 outline-none placeholder:text-[#9CA3AF]
																									 focus:border-[#9DB8FF] focus:ring-2 focus:ring-[#E4EEFF]"
																		/>
																		<div className="max-h-[220px] overflow-auto pr-1">
																				{participants
																						.filter((n) =>
																								n.toLowerCase().includes(filter.toLowerCase())
																						)
																						.map((name) => {
																								const checked = selected.includes(name);
																								return (
																										<label
																												key={name}
																												className={`flex cursor-pointer items-center gap-2 
																																		rounded-md px-2 py-1.5 hover:bg-white ${
																																		checked ? "bg-white" : ""
																												}`}
																										>
																												<input
																														type="checkbox"
																														className="h-4 w-4 accent-[#7B91F8]"
																														checked={checked}
																														onChange={() => togglePerson(name)}
																												/>
																												{nameBadge(name)}
																										</label>
																								);
																						})}
																		</div>
																</>
														)}

														{/* 선택된 칩들 */}
														{selected.length > 0 && (
																<div className="mt-2 flex flex-wrap gap-2">
																		{selected.map((name) => (
																				<div
																						key={name}
																						className="flex items-center gap-2 rounded-full border border-[#E5E7EB]
																										   bg-white px-3 py-1"
																				>
																						<div className="text-[12px] text-[#111827]">{name}</div>
																						<button
																								type="button"
																								className="text-[#94A3B8] hover:text-[#475569]"
																								onClick={() => togglePerson(name)}
																								title="제거"
																						>
																								×
																						</button>
																				</div>
																		))}
																</div>
														)}
												</div>

												{/* 우: 입력 + 리스트 */}
												<div className="flex flex-col gap-4">
														{/* 입력 카드 */}
														<div className="rounded-xl border border-[#E6ECF4] p-3">
																<div className="mb-2 text-[13px] font-medium text-[#111827]">내용</div>
																<textarea
																		value={text}
																		onChange={(e) => setText(e.target.value)}
																		placeholder="무엇을 기록할까요?"
																		className="min-h-[90px] w-full rounded-lg border border-[#CFDAE8] p-3
																							 outline-none placeholder:text-[#9CA3AF] focus:border-[#9DB8FF]
																							 focus:ring-2 focus:ring-[#E4EEFF]"
																/>
																<div className="mt-2 flex items-center justify-end gap-2">
																		<button
																				type="button"
																				className="h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white
																								 text-[#374151] hover:bg-[#F8FAFC]"
																				onClick={() => {
																						setSelected([]);
																						setText("");
																				}}
																		>
																				초기화
																		</button>
																		<button
																				type="button"
																				className="h-9 px-4 rounded-lg bg-[#7B91F8] text-white disabled:opacity-40"
																				disabled={!text.trim()}
																				onClick={addNote}
																		>
																				추가
																		</button>
																</div>
														</div>

														{/* 현재까지 추가된 항목 */}
														{pills.find((p) => p.id === activeId)!.notes.length > 0 && (
																<div className="rounded-xl border border-[#E6ECF4]">
																		<div className="border-b border-[#EEF2F7] px-3 py-2 text-[13px] text-[#64748B]">
																				추가된 항목
																		</div>
																		<ul className="max-h-[260px] overflow-auto p-2 flex flex-col gap-2">
																				{pills
																						.find((p) => p.id === activeId)!
																						.notes.map((n) => (
																								<li
																										key={n.id}
																										className="rounded-lg border border-[#EDF2F7] bg-white p-3"
																								>
																										<div className="mb-1 flex flex-wrap gap-2">
																												{n.participantIds.length
																														? n.participantIds.map(nameBadge)
																														: (
																																<div className="rounded-full border border-[#E5E7EB]
																																							  bg-[#FAFAFA] px-3 py-0.5 text-[12px]
																																							  text-[#6B7280]">
																																		참석자 없음
																																</div>
																														)}
																										</div>
																										<div className="whitespace-pre-wrap text-[14px] text-[#111827]">
																												{n.text}
																										</div>
																										<div className="mt-2 flex items-center justify-end">
																												<button
																														type="button"
																														className="rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[12px] text-[#DC2626] hover:bg-[#FFF1F2]"
																														onClick={() => removeNote(activeId, n.id)}
																												>
																														삭제
																												</button>
																										</div>
																								</li>
																						))}
																		</ul>
																</div>
														)}
												</div>
										</div>
								</div>
						)}
				</div>
		);
}
