// ---------------------------------------------------------
// MOCK(목업) 활성화 상태
//    - getCommunityFeed(): 커뮤니티 피드 목록
// 백엔드 연결 시
//    1) 아래 MOCK START ~ END 블록 "삭제"
//    2) REAL API 블록의 주석 "해제"
//    3) apiClient.ts 의 communityApi baseURL/인증만 맞추면 끝
// ---------------------------------------------------------

// (REAL 전환 시 사용) import { communityApi } from "./apiClient";

export type CommunityCategory = "ALL" | "LUNCH" | "ANON";
export type CommunitySort = "latest" | "oldest" | "popular";

export type CommunityPost = {
		id: string;
		title: string;
		contentPreview: string;
		tags: string[];
		category: CommunityCategory;
		createdAt: string; // ISO
		views: number;
		participants?: { joined: number; capacity: number }; // LUNCH 용
		likes?: number;    // 일반글
		comments?: number; // 일반글
};

export type FeedRequest = {
		category?: CommunityCategory;
		sort?: CommunitySort;
		limit?: number;
};
export type FeedResponse = { items: CommunityPost[] };

/* =========================================================
====================   MOCK  START   =======================
백엔드 붙일 때, 이 블록을 전부 "삭제"
아래 REAL API 블록의 주석을 "해제"
========================================================= */
const now = Date.now();
const __mock_items: CommunityPost[] = [
		{
				id: "p-001",
				title: "오늘 같이 밥 드실 분~~?",
				contentPreview: "메뉴는 모이면 다 같이 정하던가 해요!!!",
				tags: ["점심", "하하하", "하하하하"],
				category: "LUNCH",
				createdAt: new Date(now - 30 * 60 * 1000).toISOString(), // 30분 전
				views: 12,
				participants: { joined: 1, capacity: 4 },
		},
		{
				id: "p-002",
				title: "요즘 번아웃이 온거 같아요....",
				contentPreview: "번아웃이 세게 온 거 같은데 혹시 극복할 방법이 있을까요? 있...",
				tags: ["익명", "고민", "직무상담"],
				category: "ANON",
				createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
				views: 52,
				likes: 5,
				comments: 1,
		},
		{
				id: "p-003",
				title: "오늘 같이 밥 드실 분~~?",
				contentPreview: "메뉴는 모이면 다 같이 정하던가 해요!!!",
				tags: ["점심", "하하하", "하하하하"],
				category: "LUNCH",
				createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
				views: 12,
				participants: { joined: 1, capacity: 4 },
		},
		{
				id: "p-004",
				title: "점심 김밥 vs 샌드위치?",
				contentPreview: "둘 다 좋으면 반반으로 가죠 😆",
				tags: ["점심", "투표"],
				category: "LUNCH",
				createdAt: new Date(now - 90 * 60 * 1000).toISOString(), // 1시간 30분 전
				views: 23,
				participants: { joined: 2, capacity: 6 },
		},
		{
				id: "p-005",
				title: "프론트 스터디 모집합니다",
				contentPreview: "리액트 성능 최적화/테스팅 위주로 주 1회 예정입니다.",
				tags: ["익명", "스터디", "모집"],
				category: "ANON",
				createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(), // 3시간 전
				views: 74,
				likes: 8,
				comments: 3,
		},
		{
				id: "p-006",
				title: "내일 회사 근처 풋살 하실 분?",
				contentPreview: "퇴근 후 7시에 풋살 예약 가능하면 잡아볼게요!",
				tags: ["모임", "운동"],
				category: "LUNCH",
				createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(), // 6시간 전
				views: 41,
				participants: { joined: 5, capacity: 10 },
		},
		{
				id: "p-007",
				title: "노트북 추천 부탁드려요",
				contentPreview: "AI 모델은 안 돌리고, 개발/멀티태스킹 위주입니다. 가성비 뭐가 좋을까요?",
				tags: ["익명", "고민", "IT"],
				category: "ANON",
				createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
				views: 102,
				likes: 12,
				comments: 5,
		},
		{
				id: "p-008",
				title: "사무실 근처 맛집 지도 공유 🍜",
				contentPreview: "신규 입사자분들을 위해 점심 맛집 지도 만들어봤어요!",
				tags: ["점심", "맛집", "정보"],
				category: "LUNCH",
				createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4일 전
				views: 88,
				participants: { joined: 3, capacity: 8 },
		},
];

export async function getCommunityFeed(
		req: FeedRequest = {}
): Promise<FeedResponse> {
		await sleep(150);
		const category = req.category ?? "ALL";
		const sort = req.sort ?? "latest";
		const limit = req.limit ?? 15; // 게시글 15개로 제한

		let items = __mock_items.slice();
		if (category !== "ALL") items = items.filter((i) => i.category === category);

		if (sort === "latest") {
				items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
		} else if (sort === "oldest") {
				items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
		} else if (sort === "popular") {
				items.sort(
						(a, b) =>
								(b.likes ?? 0) + (b.comments ?? 0) + (b.views ?? 0) -
								((a.likes ?? 0) + (a.comments ?? 0) + (a.views ?? 0))
				);
		}

		return { items: items.slice(0, limit) };
}
/* ====================   MOCK  END   ====================== */


/* =========================================================
====================   REAL API (주석 해제)  ================
export async function getCommunityFeed(
  req: FeedRequest = {}
): Promise<FeedResponse> {
  const { category = "ALL", sort = "latest", limit = 6 } = req;
  const { data } = await communityApi.get<FeedResponse>("/community/feed", {
    params: { category, sort, limit },
    withCredentials: true,
  });
  return data;
}
========================================================= */

// 유틸
export function timeAgo(iso: string) {
		const diff = Math.max(0, Date.now() - +new Date(iso));
		const m = Math.floor(diff / 60000);
		if (m < 1) return "방금 전";
		if (m < 60) return `${m}분 전`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}시간 전`;
		const d = Math.floor(h / 24);
		return `${d}일 전`;
}
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
