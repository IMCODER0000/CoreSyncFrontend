import { useEffect, useMemo, useState } from "react";
import { getLeaveSummary, type LeaveSummary } from "../utils/leave.service";

type State =
    | { isLoading: true; data: null; error: null }
    | { isLoading: false; data: LeaveSummary | null; error: Error | null };

// --- 모듈 전역 캐시 & 인플라이트 공유 ---
let _cache: LeaveSummary | null = null;
let _cacheAt = 0;
let _inflight: Promise<LeaveSummary> | null = null;
const CACHE_MS = 60_000; // 1분

async function fetchOnce(): Promise<LeaveSummary> {
    if (_inflight) return _inflight;
    _inflight = getLeaveSummary().finally(() => {
        // cleanup inflight after resolution
        setTimeout(() => {
            _inflight = null;
        }, 0);
    });
    const data = await _inflight;
    _cache = data;
    _cacheAt = Date.now();
    return data;
}

export function useLeaveSummary() {
    const [state, setState] = useState<State>({ isLoading: true, data: null, error: null });

    useEffect(() => {
        let alive = true;

        const fresh = _cache && Date.now() - _cacheAt < CACHE_MS;
        if (fresh) {
            setState({ isLoading: false, data: _cache, error: null });
            return;
        }

        setState({ isLoading: true, data: null, error: null });
        fetchOnce()
            .then((d) => alive && setState({ isLoading: false, data: d, error: null }))
            .catch((e: any) => alive && setState({ isLoading: false, data: null, error: e ?? new Error("load failed") }));

        return () => {
            alive = false;
        };
    }, []);

    const derived = useMemo(() => {
        if (!state.data) return { usageRate: 0, availableDays: 0 };
        const { totalDays, usedDays, remainDays } = state.data;
        const usageRate = totalDays > 0 ? Math.round((usedDays / totalDays) * 100) : 0;
        return { usageRate, availableDays: remainDays };
    }, [state.data]);

    const refetch = async () => {
        const data = await fetchOnce();
        setState({ isLoading: false, data, error: null });
    };

    return { ...state, ...derived, refetch };
}
