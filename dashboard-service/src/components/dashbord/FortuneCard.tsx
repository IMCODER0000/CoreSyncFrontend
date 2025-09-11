import {useEffect, useState} from "react";
import {getTodayFortune, FortuneData, FortuneResponse} from "../../utils/fortune.service";
import FortuneModal from "./FortuneModal";

type Props = { className?: string; date?: string };

export default function FortuneCard({className = "", date}: Props) {
    const [data, setData] = useState<FortuneData | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setErr(null);
        getTodayFortune({date})
            .then((res: FortuneResponse) => {
                if (alive) setData(res.item);
            })
            .catch((e) => {
                if (alive) setErr(e?.message ?? "fortune error");
            })
            .finally(() => {
                if (alive) setLoading(false);
            });
        return () => {
            alive = false;
        };
    }, [date]);

    return (
        <>
            <div
                role="button"
                aria-label="오늘의 운세 자세히 보기"
                onClick={() => data && setOpen(true)}
                className={[
                    "relative overflow-hidden select-none cursor-pointer",
                    "p-6 rounded-[30px] shadow-[1px_1px_20px_0px_rgba(112,124,154,0.10)]",
                    "bg-gradient-to-l from-blue-600 to-blue-500 text-white",
                    "transition-transform active:scale-[0.99]",
                    "w-full min-w-0",
                    className,
                ].join(" ")}
            >

                {data?.decoRightUrl && (
                    <img
                        src={data.decoRightUrl}
                        alt=""
                        aria-hidden
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                        className={
                            [
                                "pointer-events-none absolute",
                                "-right-4 -bottom-2",
                                "w-24 h-24 object-contain",
                                "rotate-[18deg] opacity-60",
                                "z-0",
                            ].join(" ")
                        }
                    />
                )}
                {data?.decoLeftUrl && (
                    <img
                        src={data.decoLeftUrl}
                        alt=""
                        aria-hidden
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                        className={
                            [
                                "pointer-events-none absolute",
                                "left-1 top-10",
                                "w-8 h-8 object-contain",
                                "opacity-70",
                                "z-0",
                            ].join(" ")
                        }
                    />
                )}

                {/* 내용 */}
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-medium leading-none">오늘의 운세</h3>
                        <svg className="w-3.5 h-3.5 opacity-95" viewBox="0 0 20 20" fill="none">
                            <path d="M7.5 5l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </div>

                    <div className="mt-3 flex items-end gap-2">
                        {loading ? (
                            <div className="h-12 w-16 rounded-md bg-white/30 animate-pulse"/>
                        ) : (
                            <>
                                <div className="text-5xl font-bold leading-[56px]">{data?.score ?? 0}</div>
                                <div className="text-base leading-normal">점</div>
                            </>
                        )}
                    </div>

                    <p className="mt-2 text-xs leading-snug text-white/95">
                        {err ? "데이터를 불러오지 못했어요." : (data?.short ?? "\u00A0")}
                    </p>
                </div>
            </div>

            {data && <FortuneModal open={open} onClose={() => setOpen(false)} data={data}/>}
        </>
    );
}
