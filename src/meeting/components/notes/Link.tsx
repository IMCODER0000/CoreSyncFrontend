import React from "react";

type Props = {
		links: string[];
		setLinks: (v: string[]) => void;
		linkOpen: boolean;
		setLinkOpen: (v: boolean) => void;
};

/* ============== 유틸 ============== */
// URL 정규화/검증
const normalizeUrl = (raw: string): string | null => {
		const s = (raw || "").trim();
		if (!s) return null;
		try {
				const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
				const u = new URL(withProto);
				if (!u.hostname.includes(".")) return null;
				if (u.pathname === "/") u.pathname = "";
				return u.toString();
		} catch { return null; }
};
// 표시용(도메인/경로)
const displayOf = (url: string): string => {
		try {
				const u = new URL(url);
				const host = u.hostname;
				const path = u.pathname.replace(/\/$/, "");
				return path ? `${host}${path}` : host;
		} catch { return url; }
};
// 파비콘
const faviconOf = (url: string): string =>
		`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`;
// 날짜 표기 (09월 24일)
const formatKDate = (ts: number) => {
		const d = new Date(ts);
		const mm = String(d.getMonth() + 1).padStart(2, "0");
		const dd = String(d.getDate()).padStart(2, "0");
		return `${mm}월 ${dd}일`;
};

export default function Link({
																				links, setLinks, linkOpen, setLinkOpen
																		}: Props) {
		// ===== 로컬 메타(로고/이름/설명/생성일)  =====
		const [meta, setMeta] = React.useState<Record<string, {
				name?: string; desc?: string; logoData?: string; createdAt: number;
		}>>({});

		// ===== 모달 상태 =====
		const [openModal, setOpenModal] = React.useState(false);
		const [isEdit, setIsEdit] = React.useState(false);
		const [editIndex, setEditIndex] = React.useState<number | null>(null);
		const formNameRef = React.useRef<HTMLInputElement | null>(null);
		const [form, setForm] = React.useState({ name: "", url: "", desc: "", logoData: "" });

		// ===== 메뉴 상태 =====
		const [menuFor, setMenuFor] = React.useState<number | null>(null);

		const [toast, setToast] = React.useState("");
		const say = (t: string) => { setToast(t); window.clearTimeout((say as any)._t); (say as any)._t = setTimeout(() => setToast(""), 1400); };

		// + 버튼 → 추가 모달
		const onOpenAdd = () => {
				setIsEdit(false); setEditIndex(null);
				setForm({ name: "", url: "", desc: "", logoData: "" });
				setOpenModal(true);
				setTimeout(() => formNameRef.current?.focus(), 0);
		};
		const onCloseModal = () => { setOpenModal(false); setForm({ name: "", url: "", desc: "", logoData: "" }); };

		// 로고 선택(미리보기만, 업로드X)
		const onLogoChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
				const f = e.target.files?.[0]; if (!f) return;
				if (!/^image\//.test(f.type)) { say("이미지 파일만 가능해요"); return; }
				const reader = new FileReader();
				reader.onload = () => setForm((s) => ({ ...s, logoData: String(reader.result || "") }));
				reader.readAsDataURL(f);
		};

		// 메뉴 열기
		const toggleMenu = (idx: number) => setMenuFor(menuFor === idx ? null : idx);

		// 수정 시작
		const startEdit = (idx: number) => {
				const url = links[idx];
				const m = meta[url];
				setIsEdit(true); setEditIndex(idx);
				setForm({
						name: m?.name || "",
						url,
						desc: m?.desc || "",
						logoData: m?.logoData || ""
				});
				setMenuFor(null);
				setOpenModal(true);
				setTimeout(() => formNameRef.current?.focus(), 0);
		};

		// 삭제
		const removeAt = (idx: number) => {
				const url = links[idx];
				const next = links.slice(); next.splice(idx, 1);
				setLinks(next);
				setMeta((m) => { const { [url]: _omit, ...rest } = m; return rest; });
				setMenuFor(null);
		};

		// 추가/수정 저장
		const onSubmit = () => {
				const normalized = normalizeUrl(form.url);
				if (!normalized) { say("URL 형식을 확인해 주세요"); return; }

				if (!isEdit) {
						// ===== 추가 =====
						const dup = links.some((x) => x.toLowerCase() === normalized.toLowerCase());
						if (dup) { say("이미 추가된 링크예요"); return; }
						setLinks([...links, normalized]);
						setMeta((m) => ({ ...m, [normalized]: { name: form.name || undefined, desc: form.desc || undefined, logoData: form.logoData || undefined, createdAt: Date.now() } }));
						say("링크가 추가됐어요");
						onCloseModal();
				} else if (editIndex !== null) {
						// ===== 수정 =====
						const prevUrl = links[editIndex];
						const isSame = prevUrl.toLowerCase() === normalized.toLowerCase();
						if (!isSame) {
								const dup = links.some((x, i) => i !== editIndex && x.toLowerCase() === normalized.toLowerCase());
								if (dup) { say("같은 URL이 이미 있어요"); return; }
						}
						const next = links.slice();
						next[editIndex] = normalized;
						setLinks(next);

						setMeta((m) => {
								const prevMeta = m[prevUrl];
								const createdAt = prevMeta?.createdAt ?? Date.now();
								const { [prevUrl]: _omit, ...rest } = m;
								return {
										...rest,
										[normalized]: {
												name: form.name || undefined,
												desc: form.desc || undefined,
												logoData: form.logoData || prevMeta?.logoData || undefined,
												createdAt
										}
								};
						});

						say("수정 완료");
						onCloseModal();
				}
		};

		return (
				<div className="rounded-xl p-3">
						{/* 헤더 */}
						<div className="flex items-center gap-8">
								<button
										type="button"
										className="flex items-center gap-3 text-[#334155]"
										onClick={() => setLinkOpen(!linkOpen)}
										title={linkOpen ? "접기" : "펼치기"}
								>
										<div className={["text-[16px] leading-none transition-transform", linkOpen ? "rotate-0" : "-rotate-90"].join(" ")} aria-hidden>▾</div>
										<div className="text-[18px] font-semibold">링크 </div>
										<div className="text-[12px] font-medium">{links.length}</div>
								</button>

								<div className="flex items-center gap-2">
										<button
												type="button"
												onClick={() => { setLinkOpen(true); onOpenAdd(); }}
												title="링크 추가"
												className="h-6 w-6 inline-flex items-center justify-center rounded-md border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F3F6FA] active:bg-[#EEF2F7]"
										>
												+
										</button>
								</div>
						</div>

						{/* 본문 */}
						{linkOpen && (
								<div className="mt-3">
										{links.length > 0 ? (
												<ul className="flex flex-col gap-2">
														{links.map((u, i) => {
																const m = meta[u];
																const title = m?.name || displayOf(u);
																const when = m?.createdAt ? formatKDate(m.createdAt) : "";
																const logo = m?.logoData || faviconOf(u);
																return (
																		<li key={u + i}>
																				<div
																						className="relative flex items-center gap-2 rounded-lg border border-[#E6ECF4] bg-white p-2 hover:bg-[#F7FAFF]"
																				>

																						{/* 파비콘 */}
																						<img className="w-4 h-4 rounded" src={logo} alt="" loading="lazy" />

																						{/* 링크 타이틀 */}
																						<a
																								href={u}
																								target="_blank"
																								rel="noreferrer"
																								title={u}
																								className="flex-1 truncate text-[14px] text-[#1F2937] underline-offset-2 hover:underline"
																						>
																								{title}
																						</a>

																						{/* 날짜 (보라톤) */}
																						{when && <div className="text-[12px] text-[#7B91F8]">{when}</div>}

																						{/* 메뉴 */}
																						<div className="relative">
																								<button
																										type="button"
																										className="px-2 text-[#94A3B8] hover:text-[#475569]"
																										onClick={() => toggleMenu(i)}
																										title="메뉴"
																								>⋯</button>

																								{menuFor === i && (
																										<>
																												{/* 밖 클릭 닫기 */}
																												<div className="fixed inset-0 z-40" onClick={() => setMenuFor(null)} />
																												<div className="absolute right-0 top-6 z-50 w-28 rounded-md border border-[#E5E7EB] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
																														<button
																																className="block w-full text-left px-3 py-2 text-[13px] hover:bg-[#F8FAFC]"
																																onClick={() => startEdit(i)}
																														>
																																수정
																														</button>
																														<div className="h-px bg-[#EEF2F7]" />
																														<button
																																className="block w-full text-left px-3 py-2 text-[13px] text-[#DC2626] hover:bg-[#FFF1F2]"
																																onClick={() => removeAt(i)}
																														>
																																삭제
																														</button>
																												</div>
																										</>
																								)}
																						</div>
																				</div>
																		</li>
																);
														})}
												</ul>
										) : (
												// <div className="text-[12px] text-[#98A2B3]">추가된 링크가 없어요.</div>
												<div></div>
										)}

										{/* 토스트 */}
										{toast && <div className="mt-2 text-[12px] text-[#6B7280]">{toast}</div>}
								</div>
						)}

						{/* ===== 모달: 추가/수정 공용 ===== */}
						{openModal && (
								<div className="fixed inset-0 z-50">
										{/* 백드랍 */}
										<div className="absolute inset-0 bg-black/30" onClick={onCloseModal} />
										{/* 다이얼로그 */}
										<div className="absolute left-1/2 top-1/2 w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E6ECF4] bg-white shadow-[0_8px_40px_rgba(16,24,40,0.12)]">
												{/* 헤더 */}
												<div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF2F7]">
														<div className="text-[16px] font-semibold text-[#111827]">{isEdit ? "링크 수정" : "링크 추가"}</div>
														<button className="h-8 w-8 rounded-md text-[#677285] hover:bg-[#F4F6FA]" onClick={onCloseModal}>×</button>
												</div>

												{/* 콘텐츠 */}
												<div className="px-5 py-5 flex flex-col gap-5">
														{/* 로고 이미지 */}
														<div>
																<div className="text-[13px] font-medium text-[#111827]">로고 이미지</div>
																<div className="mt-2">
																		<label className="inline-flex h-10 w-10 items-center justify-center rounded border border-dashed border-[#CBD5E1] hover:bg-[#F8FAFC] cursor-pointer">
																				<input type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
																				{form.logoData ? (
																						<img src={form.logoData} className="w-8 h-8 object-cover rounded" alt="" />
																				) : (
																						<div className="text-[#6B7280] text-[18px]">+</div>
																				)}
																		</label>
																</div>
														</div>

														{/* 링크 이름 */}
														<div>
																<div className="text-[13px] font-medium text-[#111827]">링크 이름</div>
																<input
																		ref={formNameRef}
																		value={form.name}
																		onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
																		placeholder="링크 이름을 입력해 주세요."
																		className="mt-2 h-10 w-full rounded-lg border border-[#CFDAE8] px-3 outline-none placeholder:text-[#9CA3AF] focus:border-[#9DB8FF] focus:ring-2 focus:ring-[#E4EEFF]"
																/>
														</div>

														{/* URL */}
														<div>
																<div className="text-[13px] font-medium text-[#111827]">URL <div className="ml-1 inline-block text-[#6B7280]">*</div></div>
																<input
																		value={form.url}
																		onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))}
																		placeholder="https://example.com"
																		className="mt-2 h-10 w-full rounded-lg border border-[#CFDAE8] px-3 outline-none placeholder:text-[#9CA3AF] focus:border-[#9DB8FF] focus:ring-2 focus:ring-[#E4EEFF]"
																/>
														</div>

														{/* 상세 내용 */}
														<div>
																<div className="text-[13px] font-medium text-[#111827]">상세 내용</div>
																<textarea
																		value={form.desc}
																		onChange={(e) => setForm((s) => ({ ...s, desc: e.target.value }))}
																		placeholder="URL에 대한 상세 내용을 입력해 주세요."
																		className="mt-2 min-h-[96px] w-full rounded-lg border border-[#CFDAE8] p-3 outline-none placeholder:text-[#9CA3AF] focus:border-[#9DB8FF] focus:ring-2 focus:ring-[#E4EEFF]"
																/>
														</div>
												</div>

												{/* 풋터 */}
												<div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#EEF2F7] rounded-b-2xl">
														<button onClick={onCloseModal} className="h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F8FAFC]">취소</button>
														<button
																onClick={onSubmit}
																disabled={!normalizeUrl(form.url)}
																className="h-9 px-4 rounded-lg bg-[#7B91F8] text-white disabled:opacity-40"
														>{isEdit ? "수정" : "추가"}</button>
												</div>
										</div>
								</div>
						)}
				</div>
		);
}