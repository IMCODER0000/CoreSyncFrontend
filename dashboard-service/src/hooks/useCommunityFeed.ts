import {useEffect, useState} from "react";
import {getCommunityFeed, type FeedRequest, type FeedResponse} from "../utils/community.service.ts";

type State =
		| { isLoading: true; data: null; error: null; }
		| { isLoading: false; data: FeedResponse | null; error: Error | null; };

// 간단 캐시, 인플라이트(key: category|sort|limit)
const CACHE_MS = 60_000;
const cache = new  Map<string, { at: number; data: FeedResponse }>();
const inflight = new Map<string, Promise<FeedResponse>>();

const keyOf = (r: FeedRequest) =>
		`${r.category ?? "ALL"} | ${r.sort ?? "latest"} | ${r.limit ?? "6"}`;

async function fetchOnce(req: FeedRequest) {
		const key = keyOf(req);
		const fresh = cache.get(key);
		if (fresh && Date.now() - fresh.at < CACHE_MS) return fresh.data;
		if (inflight.has(key)) return inflight.get(key)!;

		const p = getCommunityFeed(req).finally(() => inflight.delete(key));
		inflight.set(key, p);
		const data = await p;
		cache.set(key, {at: Date.now(), data});
		return data;
}

export function useCommunityFeed(req: FeedRequest) {
		const [state, set] = useState<State>({ isLoading: true, data: null, error: null });

		useEffect(() => {
				let alive = true;
				set({ isLoading: true, data: null, error: null });
				fetchOnce(req)
						.then((d) => alive && set({ isLoading: false, data: d, error: null }))
						.catch((e: any) => alive && set({ isLoading: false, data: null, error: e ?? new Error("load failed") }));
				return () => { alive = false; };
		}, [req.category, req.sort, req.limit]);

		const refetch = async () => {
				cache.delete(keyOf(req));
				const d = await fetchOnce(req);
				set({ isLoading: false, data: d, error: null });
		};

		return { ...state, refetch };
}