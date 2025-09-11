import { useEffect, useState } from "react";
import { getApprovalDocs, type ApprovalListRequest, type ApprovalListResponse } from "../utils/approval.service";

type S =
    | { isLoading: true; data: null; error: null }
    | { isLoading: false; data: ApprovalListResponse | null; error: Error | null };

const TTL = 60_000;
const cache = new Map<string, { at: number; data: ApprovalListResponse }>();
const inflight = new Map<string, Promise<ApprovalListResponse>>();
const keyOf = (r: ApprovalListRequest) => `limit:${r.limit ?? 10}`;

async function fetchOnce(req: ApprovalListRequest) {
    const key = keyOf(req);
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL) return hit.data;
    if (inflight.has(key)) return inflight.get(key)!;

    const p = getApprovalDocs(req).finally(() => inflight.delete(key));
    inflight.set(key, p);
    const data = await p;
    cache.set(key, { at: Date.now(), data });
    return data;
}

export function useApprovalDocs(req: ApprovalListRequest) {
    const [state, set] = useState<S>({ isLoading: true, data: null, error: null });

    useEffect(() => {
        let alive = true;
        set({ isLoading: true, data: null, error: null });
        fetchOnce(req)
            .then((d) => alive && set({ isLoading: false, data: d, error: null }))
            .catch((e: any) => alive && set({ isLoading: false, data: null, error: e ?? new Error("load failed") }));
        return () => { alive = false; };
    }, [req.limit]); // [LEAVE-STYLE]

    const refetch = async () => {
        cache.delete(keyOf(req));
        const d = await fetchOnce(req);
        set({ isLoading: false, data: d, error: null });
    };

    return { ...state, refetch };
}
