import { useEffect } from "react";
import type { FortuneData } from "../../utils/fortune.service";
import { formatDateKOR } from "../../utils/fortune.service";

type Props = { open: boolean; onClose: () => void; data: FortuneData };

export default function FortuneModal({ open, onClose, data }: Props) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const Bar = ({ value = 0 }: { value?: number }) => (
        <div className="h-2 w-full rounded-full bg-zinc-200/70 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
        </div>
    );

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

            <div className="relative mx-4 w-full max-w-[680px] rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="relative px-6 pt-6 pb-4 bg-gradient-to-l from-blue-600 to-blue-500 rounded-t-2xl text-white">
                    <div className="flex items-center justify-between">
                        <div className="text-[13px] opacity-95">{formatDateKOR(data.date)}</div>
                        <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 transition" aria-label="닫기">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>

                    <div className="mt-1 flex items-end gap-2">
                        <span className="text-4xl font-bold leading-tight">{data.score}</span>
                        <span className="text-base">점</span>
                    </div>
                    <p className="mt-2 text-sm/5">{data.short}</p>
                </div>

                {/* 본문 */}
                <div className="px-6 py-5 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <InfoChip label="행운색" value={data.luckyColor ?? "-"} colorDot={data.luckyColor}/>
                        <InfoChip label="행운템" value={data.luckyItem ?? "-"} />
                        <InfoChip label="행운번호" value={data.luckyNumber ? String(data.luckyNumber) : "-"} />
                        <InfoChip label="별자리" value={data.zodiac ?? "-"} />
                    </div>

                    {data.categories && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700">카테고리별 운세</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {"work"  in data.categories && <div><div className="mb-1 text-xs text-slate-500">일/커리어</div><Bar value={data.categories.work} /></div>}
                                {"love"  in data.categories && <div><div className="mb-1 text-xs text-slate-500">연애</div><Bar value={data.categories.love} /></div>}
                                {"money" in data.categories && <div><div className="mb-1 text-xs text-slate-500">금전</div><Bar value={data.categories.money} /></div>}
                                {"health"in data.categories && <div><div className="mb-1 text-xs text-slate-500">건강</div><Bar value={data.categories.health}/></div>}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="text-sm font-semibold text-slate-700">오늘의 해석</h4>
                        <p className="mt-1 text-[13px] leading-6 text-slate-600 whitespace-pre-wrap">{data.detail}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoChip({ label, value, colorDot }: { label: string; value: string; colorDot?: string }) {
    return (
        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] text-slate-500">{label}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium text-slate-800">
                {colorDot && <span className="inline-block w-3 h-3 rounded-full ring-2 ring-white shadow" style={{ backgroundColor: colorDot }} />}
                {value}
            </div>
        </div>
    );
}
