import Card from "./Card";
import {useLeaveSummary} from "../../hooks/useLeaveSummary";

type Props = { className?: string };

function SquaredIcon({
                         kind,
                         bg = "bg-blue-500",
                     }: {
    kind: "plus" | "minus" | "dot";
    bg?: string;
}) {
    return (
        <span className={`relative inline-block size-3.5 rounded-[4px] ${bg}`}>
      {(kind === "minus" || kind === "plus") && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 block w-2 h-[2px] bg-white"/>
      )}
            {kind === "plus" && (
                <span
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 block h-2 w-[2px] bg-white"/>
            )}
            {kind === "dot" && (
                <span
                    className="absolute left-1/2 top-1/2 block size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"/>
            )}
    </span>
    );
}

function Metric({ icon, label, value }: { icon: JSX.Element; label: string; value: string | number; }) {
    return (
        <div className="flex items-end gap-3 sm:flex-1 py-3">
            <div className="flex flex-col items-start gap-1">
                {icon}
                <span className="text-stone-500 text-xs">{label}</span>
            </div>
            <div className="flex items-end gap-1 whitespace-nowrap">
                <span className="text-neutral-900 text-2xl font-semibold leading-none">{String(value).replace(/일$/, "")}</span>
                <span className="pb-[2px] text-sm text-neutral-500 leading-none">일</span>
            </div>
        </div>
    );
}

export default function LeaveCard({className = ""}: Props) {
    const {isLoading, data, error} = useLeaveSummary();

    const total = data?.totalDays ?? 0;
    const used = data?.usedDays ?? 0;
    const remain = data?.remainDays ?? 0;

    return (
        <Card className={`min-h-[160px] w-full py-8 px-7 ${className}`}>
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-neutral-900 text-xl sm:text-2xl font-bold leading-7">잔여연차</h3>
            </div>

            <div
                className="
					mt-4 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between
					divide-y divide-gray-200 sm:divide-y-0 sm:divide-x
					sm:[&>div]:px-6 sm:[&>div:first-child]:pl-0 sm:[&>div:last-child]:pr-0
				  "
            >
                <Metric icon={<SquaredIcon kind="plus" bg="bg-blue-500"/>} label="총연차"
                        value={isLoading ? "—" : `${total}일`}/>
                <Metric icon={<SquaredIcon kind="minus" bg="bg-red-500"/>} label="사용연차"
                        value={isLoading ? "—" : `${used}일`}/>
                <Metric icon={<SquaredIcon kind="dot" bg="bg-green-600"/>} label="잔여연차"
                        value={isLoading ? "—" : `${remain}일`}/>
            </div>

            {error && <p className="mt-3 text-xs text-red-500">연차 정보를 불러오지 못했어요.</p>}
        </Card>
    );
}
