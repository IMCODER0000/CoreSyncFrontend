import { useMemo, useRef, useState } from "react";
import Card from "./Card";
import { useApprovalDocs } from "../../hooks/useApprovalDocs";
import type { ApprovalDoc, ApprovalStatus } from "../../utils/approval.service";
import ArrowSvg from "../../assets/Icons/결제문서 화살표.svg"

// 스크롤
const SB_WIDTH = 10;
const CONTENT_RIGHT_INSET = 12;
const HEADER_RIGHT_PADDING = SB_WIDTH + CONTENT_RIGHT_INSET;
const SCROLL_SHOW_MS = 800;

type Props = { className?: string };

export default function ApprovalDocsCard({ className = "" }: Props) {
    const { isLoading, data, error } = useApprovalDocs({ limit: 10 });
    const items = useMemo(() => data?.items ?? [], [data]);

    // 스크롤 중에만 바 보이기
    const [scrolling, setScrolling] = useState(false);
    const timerRef = useRef<number | null>(null);
    const onScroll = () => {
        if (!scrolling) setScrolling(true);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setScrolling(false), SCROLL_SHOW_MS);
    };

    return (
        <Card className={`py-8 px-1.5 h-full max-h-[310px] flex flex-col overflow-hidden ${className}`}>
            <h3
                className="text-neutral-900 text-xl sm:text-2xl font-bold leading-7"
                style={{ paddingLeft: HEADER_RIGHT_PADDING }}
            >
                결제문서
            </h3>

            {/* 헤더 */}
            <div
                className="mt-2"
                style={{
                    paddingRight: HEADER_RIGHT_PADDING,
                    paddingLeft: HEADER_RIGHT_PADDING,
                }}
            />

            {/* 리스트 */}
            <div
                onScroll={onScroll}
                className={`mt-2 flex-1 min-h-0 overflow-y-auto pr-3 sb-ghost ${scrolling ? "sb-ghost-active" : "sb-ghost-idle"}`}
                style={{ paddingLeft: HEADER_RIGHT_PADDING }}
            >
                <div className="space-y-3">
                    {isLoading && Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100/60 rounded-2xl animate-pulse" />
                    ))}

                    {error && <p className="text-sm text-red-500">문서를 불러오지 못했어요.</p>}

                    {!isLoading && !error && items.map((d) => (
                        <DocRow key={d.id} doc={d} />
                    ))}
                </div>
            </div>
        </Card>
    );
}

function DocRow({ doc }: { doc: ApprovalDoc }) {
    return (
        <article
            className="
            px-5 py-5 bg-white rounded-2xl
            border border-neutral-200/80
            shadow-[1px_1px_10px_-1px_rgba(125,125,125,0.10)]
          "
        >
            <div className="flex items-start justify-between gap-3">
                {/* 좌측 텍스트 */}
                <div className="min-w-0 opacity-90">                                                     {/* [CHANGED] opacity */}
                    <h4 className="text-neutral-900 text-[18px] font-medium leading-6 truncate">            {/* [CHANGED] 폰트/크기 */}
                        {doc.title}
                    </h4>

                    <div className="mt-2 flex items-center gap-9 text-xs">
                        <div className="flex items-center gap-3">
                            <span className="text-neutral-400">진행상태</span>
                            <StatusChip status={doc.status} />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-neutral-400">문서유형</span>
                            <span className="text-stone-500">{doc.docType}</span>
                        </div>
                    </div>
                </div>

                {/* 우측 아이콘 */}
                <ArrowSlim />                                                                            {/* [CHANGED] 아이콘 교체 */}
            </div>
        </article>
    );
}

function StatusChip({ status }: { status: ApprovalStatus }) {
    const color: Record<ApprovalStatus, string> = {
        APPROVED: "text-emerald-600",
        PENDING: "text-amber-500",
        REJECTED: "text-rose-500",
    };
    const label: Record<ApprovalStatus, string> = {
        APPROVED: "완료",
        PENDING: "대기",
        REJECTED: "반려",
    };
    return <b className={color[status]}>{label[status]}</b>;
}

function ArrowSlim({
                       className = "w-7 h-3 text-slate-300",
                       strokeWidth = 1.6,
                   }: {
    className?: string;
    strokeWidth?: number;
}) {
    return (
        <ArrowSvg
            className={[
                className,
                "[&_path]:stroke-current",
                "[&_path]:fill-none",
            ].join(" ")}
            style={{ strokeWidth }}
            aria-hidden
        />
    );
}
