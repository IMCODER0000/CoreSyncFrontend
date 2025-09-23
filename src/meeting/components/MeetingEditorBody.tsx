import React from "react";

// 공용 타입
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
		participants?: string;
		links: string[];
		files: string[];
		notes: string;
};

type Props = {
		mode: "new" | "detail";
		initial: { meeting: MeetingCore; meta: MeetingMeta };
		onSave: (data: { meeting: MeetingCore; meta: MeetingMeta }) => Promise<void> | void;
		onCancel?: () => void;
};

// 토글 아이콘
function ChevronDown({ open }: { open: boolean }) {
		return (
				<svg width="16" height="16" viewBox="0 0 20 20"
						 className={`transition-transform ${open ? "rotate-180" : ""}`}
						 fill="currentColor" aria-hidden>
						<path fillRule="evenodd"
									d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
									clipRule="evenodd" />
				</svg>
		);
}

// 템플릿 행
function TemplateRow({ label, onClick }: { label: string; onClick: () => void }) {
		return (
				<button
						type="button"
						className="relative flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-200/50"
						onClick={onClick}
				>
						<div className="max-w-full truncate">{label}</div>
						<span className="flex-shrink-0 rounded-lg bg-[#E5E7EB] px-1.5 py-[3px] text-[10px] text-[#6B7280]">기본</span>
				</button>
		);
}

export default function MeetingEditorBody({ mode, initial, onSave, onCancel }: Props) {
		// ===== 상태: initial 로드 =====
		const [title, setTitle] = React.useState(initial.meeting.title || "");
		const [allDay, setAllDay] = React.useState(!!initial.meeting.allDay);
		const [start, setStart] = React.useState<Date>(new Date(initial.meeting.start));
		const [end, setEnd] = React.useState<Date>(new Date(initial.meeting.end));

		const [notes, setNotes] = React.useState(initial.meta.notes || "");
		const [location, setLocation] = React.useState(initial.meta.location || "");
		const [participants, setParticipants] = React.useState(initial.meta.participants || "");
		const [links, setLinks] = React.useState<string[]>(initial.meta.links || []);
		const [files, setFiles] = React.useState<string[]>(initial.meta.files || []);

		// 섹션 토글
		const [linkOpen, setLinkOpen] = React.useState(true);
		const [fileOpen, setFileOpen] = React.useState(true);
		const [linkInput, setLinkInput] = React.useState("");

		// 날짜/시간 포맷 헬퍼
		const fmtDate = (d: Date) =>
				`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
		const fmtTime = (d: Date) =>
				`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
		const parseLocal = (date: string, time: string) => new Date(`${date}T${time || "00:00"}`);

		// 템플릿 프리필
		const applyTemplate = (kind: "standup" | "4ls" | "kpt") => {
				if (kind === "standup") {
						setNotes(`🟢 스탠드업 미팅
- 어제 한 일:
- 오늘 할 일:
- 이슈/블로커:`);
				} else if (kind === "4ls") {
						setNotes(`4Ls 회고
- Liked:
- Learned:
- Lacked:
- Longed for:`);
				} else {
						setNotes(`KPT 회고
- Keep:
- Problem:
- Try:`);
				}
		};

		// 저장
		const handleSave = () => {
				onSave({
						meeting: {
								...initial.meeting,
								title: title || "제목 없음",
								start,
								end,
								allDay,
						},
						meta: { notes, location, participants, links, files },
				});
		};

		return (
				<div className="flex-1 min-h-0 px-6 pb-8">
						{/* 상단 우측 버튼 */}
						<div className="pt-5 pb-3 flex items-center justify-end">
								{onCancel && (
										<button className="h-8 px-3 rounded-md border mr-2" onClick={onCancel}>
												{mode === "new" ? "취소" : "뒤로"}
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

						{/* 2열 레이아웃 */}
						<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
								{/* ===== 좌측: 본문 에디터 ===== */}
								<div className="w-full">
										{/* 제목: 녹색 점 + textarea */}
										<div className="flex items-start gap-2">
            <span className="mt-[10px] inline-block h-3 w-3 rounded-full"
									style={{ backgroundColor: "#BCE18D" }} aria-hidden />
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
										<div className="pt-5">
												<div className="flex h-5 items-center gap-2 text-sm">
														<button
																type="button"
																className="flex items-center gap-2 rounded-sm px-1.5 py-1 hover:bg-slate-300/30"
																onClick={() => setLinkOpen((v) => !v)}
														>
																<ChevronDown open={linkOpen} />
																<div className="font-medium text-[#6B7280]">링크</div>
																<div className="text-xs text-[#9CA3AF]">{links.length}</div>
														</button>
														{/* + 버튼 */}
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
																		/>
																		<button
																				className="h-10 px-3 rounded-md border"
																				onClick={() => {
																						const v = linkInput.trim();
																						if (v) {
																								setLinks([v, ...links]);
																								setLinkInput("");
																						}
																				}}
																		>
																				추가
																		</button>
																</div>
																{!!links.length && (
																		<ul className="mt-2 space-y-1 text-sm">
																				{links.map((u, i) => (
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

										<hr className="my-7 border-[#E5E7EB]" />

										{/* 파일 섹션 */}
										<div>
												<div className="flex h-5 items-center gap-2 text-sm">
														<button
																type="button"
																className="flex items-center gap-2 rounded-sm px-1.5 py-1 hover:bg-slate-300/30"
																onClick={() => setFileOpen((v) => !v)}
														>
																<ChevronDown open={fileOpen} />
																<div className="font-medium text-[#6B7280]">파일</div>
																<div className="text-xs text-[#9CA3AF]">{files.length}</div>
														</button>
														{/* + 버튼 */}
														<button
																type="button"
																className="h-5 w-5 inline-flex items-center justify-center rounded-sm border border-[#E5E7EB] bg-[#F3F4F6] hover:bg-[#E5E7EB]"
																title="파일 추가"
																onClick={() => setFileOpen(true)}
														>
																<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
																		<path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
																</svg>
														</button>
												</div>

												{fileOpen && (
														<div className="mt-3">
																{/* 파일 선택 → 파일명만 목록에 저장 */}
																<label className="block w-full rounded-lg border border-dashed p-8 text-center text-sm text-[#6B7280] cursor-pointer">
																		<input
																				type="file"
																				multiple
																				className="hidden"
																				onChange={(e) => {
																						const list = Array.from(e.target.files || []);
																						if (list.length) setFiles([...list.map((f) => f.name), ...files]);
																				}}
																		/>
																		여기에 파일을 드래그하거나 클릭하여 업로드
																</label>
																{!!files.length && (
																		<ul className="mt-2 space-y-1 text-sm">
																				{files.map((name, i) => (
																						<li key={`${name}-${i}`} className="flex items-center justify-between">
																								<div className="truncate max-w-[80%]">{name}</div>
																								<button
																										className="text-xs underline text-[#6B7280]"
																										onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
																								>
																										제거
																								</button>
																						</li>
																				))}
																		</ul>
																)}
														</div>
												)}
										</div>

										<hr className="mt-7 mb-6 border-[#E5E7EB]" />

										{/* 템플릿 리스트 */}
										<div className="rounded border border-[#E5E7EB] bg-white pb-2">
												<div className="mb-1.5 border-b border-[#E5E7EB] px-3 py-2 text-sm text-[#6B7280]">템플릿</div>
												<TemplateRow label="스탠드업 미팅" onClick={() => applyTemplate("standup")} />
												<TemplateRow label="4Ls 회고" onClick={() => applyTemplate("4ls")} />
												<TemplateRow label="KPT 회고" onClick={() => applyTemplate("kpt")} />
										</div>

										{/* 노트 */}
										<div className="mt-6 space-y-2">
												<div className="text-sm text-[#6B7280]">노트</div>
												<div className="rounded border border-[#D1D5DB]">
              <textarea
									className="w-full min-h-[220px] p-3 outline-none"
									placeholder="내용을 입력해 주세요."
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
							/>
												</div>
										</div>

										{/* 댓글(목업) */}
										<div className="mt-8">
												<div className="flex items-center gap-2 text-xs">
														<button className="h-6 px-3 rounded-full border bg-[#EEF2FF] text-[#4F46E5]">댓글</button>
														<button className="h-6 px-3 rounded-full border bg-white text-[#6B7280] hover:bg-[#F3F4F6]">활동</button>
												</div>
												<div className="mt-4">
														<div className="relative">
																<div className="min-h-[96px] rounded border border-[#E5E7EB] bg-white">
																		<textarea className="w-full min-h-[96px] p-3 outline-none" placeholder="댓글을 작성해 주세요." />
																</div>
																<button
																		disabled
																		className="absolute bottom-2 right-3 rounded-sm border px-2 py-1 bg-[#F3F4F6] text-[#6B7280] cursor-not-allowed"
																		title="추후 연동"
																>
																		<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
																				<path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" stroke="currentColor" strokeWidth="1.5" />
																		</svg>
																</button>
														</div>
												</div>
										</div>
								</div>

								{/* ===== 우측: 세부 정보 패널 ===== */}
								<aside className="h-fit rounded-2xl bg-[#F7FAFE] border border-[#E6ECF4] p-4 lg:sticky lg:top-6">
										{/* 탭 텍스트/밑줄 */}
										<div className="flex items-center gap-4 text-sm mb-3">
												<button className="text-[#9AA3AF] hover:underline" type="button">작업 관리</button>
												<div className="relative">
														<span className="font-semibold text-[#111827]">세부 정보</span>
														<span className="absolute left-0 -bottom-1 h-[2px] w-full bg-[#6D6CF8] rounded-full" />
												</div>
										</div>

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

										{/* 위치/참여자 */}
										<div className="mt-4">
												<div className="text-[12px] text-[#6B7280] mb-1">위치</div>
												<input className="w-full h-9 px-3 rounded-md border bg-white"
															 value={location} onChange={(e) => setLocation(e.target.value)} />
										</div>
										<div className="mt-4">
												<div className="text-[12px] text-[#6B7280] mb-1">참여자</div>
												<input className="w-full h-9 px-3 rounded-md border bg-white"
															 value={participants} onChange={(e) => setParticipants(e.target.value)}
															 placeholder="예) 배진아, 김개발" />
										</div>

										{/* 편집/생성 정보 섹션은 필요 시 각 페이지에서 추가 */}
								</aside>
						</div>
				</div>
		);
}
