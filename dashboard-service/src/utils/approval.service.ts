// ---------------------------------------------------------
//  MOCK(목업)
//    - getApprovalDocs(): 결제문서 리스트(최대 limit개)
//  백엔드 연결 시
//    1) 아래 MOCK START ~ END 블록 "삭제"
//    2) REAL API 블록의 주석 "해제"
//    3) apiClient.ts 의 approvalApi baseURL/인증만 맞추면 끝
// ---------------------------------------------------------

// (REAL 전환 시 사용) import { approvalApi } from "./apiClient";

export type ApprovalStatus = "APPROVED" | "PENDING" | "REJECTED";

export type ApprovalDoc = {
    id: string;
    title: string;       //
    status: ApprovalStatus;
    docType: string;     // 서류 종류
    createdAt: string;
};

export type ApprovalListRequest = { limit?: number };
export type ApprovalListResponse = { items: ApprovalDoc[] };

/* =========================================================
====================   MOCK  START   =======================
백엔드 붙일 때, 삭제
REAL API 블록의 주석을 해제
========================================================= */
const now = Date.now();
const __mock_docs: ApprovalDoc[] = [
    { id: "a-001", title: "2025.08.30 연차 신청 건", status: "APPROVED", docType: "휴가신청", createdAt: new Date(now - 3_600_000).toISOString() },
    { id: "a-002", title: "재직증명서 발급 건",     status: "PENDING",   docType: "서류",     createdAt: new Date(now - 6_600_000).toISOString() },
    { id: "a-003", title: "경조사비 신청 건",         status: "APPROVED", docType: "지급신청", createdAt: new Date(now - 26_600_000).toISOString() },
    { id: "a-004", title: "지각 사유서 제출",         status: "PENDING",   docType: "사유서",   createdAt: new Date(now - 50_000_000).toISOString() },
    { id: "a-005", title: "연말 정산 추가서류",       status: "REJECTED",  docType: "정산",     createdAt: new Date(now - 82_000_000).toISOString() },
    { id: "a-006", title: "재택 근무 신청 건",       status: "APPROVED", docType: "근무",     createdAt: new Date(now - 120_000_000).toISOString() },
    { id: "a-007", title: "경비 정산서",             status: "PENDING",   docType: "정산",     createdAt: new Date(now - 140_000_000).toISOString() },
    { id: "a-008", title: "사내 교육 신청",           status: "APPROVED", docType: "교육",     createdAt: new Date(now - 160_000_000).toISOString() },
    { id: "a-009", title: "특근 수당 신청",           status: "PENDING",   docType: "수당",     createdAt: new Date(now - 180_000_000).toISOString() },
    { id: "a-010", title: "출장 보고서 결재",         status: "APPROVED", docType: "보고서",   createdAt: new Date(now - 200_000_000).toISOString() },
    { id: "a-011", title: "장비 구매 요청",           status: "PENDING",   docType: "구매",     createdAt: new Date(now - 230_000_000).toISOString() },
];

export async function getApprovalDocs(
    req: ApprovalListRequest = {}
): Promise<ApprovalListResponse> {
    await new Promise((r) => setTimeout(r, 150));
    const limit = req.limit ?? 10;
    const items = __mock_docs
        .slice()
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, limit);
    return { items };
}
/* ====================   MOCK  END   ====================== */


/* =========================================================
====================   REAL API (주석 해제)  ================
export async function getApprovalDocs(
  req: ApprovalListRequest = {}
): Promise<ApprovalListResponse> {
  const { limit = 10 } = req;
  const { data } = await approvalApi.get<ApprovalListResponse>("/approvals", {
    params: { limit },
    withCredentials: true,
  });
  return data;
}
========================================================= */
