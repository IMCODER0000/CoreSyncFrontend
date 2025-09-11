/**
 * ProfileCard
 * - props 로 user/attendance 를 받을 수 있고(실서버/부모 주입),
 * - 비어 있으면 내부에서 profile.service 의 "목업 API"를 호출해
 *   사용자 정보와 월간 출근 요약을 자동 렌더링합니다.
 *
 * 🔁 백엔드 전환 시 ProfileCard 자체는 수정할 필요 없음.
 *    profile.service.ts 의 MOCK → REAL 전환만 하면 동일 코드로 실제 데이터 표시.
 */

import { useEffect, useState } from "react";
import Card from "./Card";
import type { UserProfile, MonthSummary } from "../../utils/profile.service";
import { getMonthSummary } from "../../utils/profile.service";

type AttendanceForCard = { presentDays: number; totalDays: number; percent?: number };

type Props = {
		user?: UserProfile | null;
		attendance?: AttendanceForCard | null;
		onEditProfile?: () => void;
		className?: string;            // ★ 추가: 외부에서 h-full 지정 가능
};

export default function ProfileCard({ user, attendance, onEditProfile, className = "" }: Props) {
		const name = user?.name ?? "—";
		const team = user?.team ?? "";
		const status = user?.statusMessage ?? "";
		const avatarUrl = user?.avatarUrl;

		const [month, setMonth] = useState<MonthSummary | null>(null);
		useEffect(() => { if (!attendance) getMonthSummary().then(setMonth); }, [attendance]);

		const present = attendance?.presentDays ?? month?.presentDays ?? 0;
		const total = attendance?.totalDays ?? month?.totalDays ?? 0;
		const percent = attendance?.percent ?? (total ? Math.round((present / total) * 100) : 0);

		return (
				<Card className={`h-full w-full px-7 py-7 ${className}`}>
					<div className="h-full flex flex-col justify-center">
						{/* 상단 */}
						<div className="flex items-start justify-between gap-3">
								<div className="flex items-center gap-6 min-w-0">
										<div className="size-16 sm:size-24 rounded-full overflow-hidden shrink-0 bg-zinc-200">
												{avatarUrl ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" /> : null}
										</div>
										<div className="min-w-0">
												<div className="flex items-end gap-2">
														<p className="text-slate-800 text-xl sm:text-2xl font-semibold truncate">{name}</p>
														{team && <p className="text-neutral-400 text-xs sm:text-sm truncate">{team}</p>}
												</div>
												<p className="text-zinc-500 text-base sm:text-lg truncate">{status}</p>
										</div>
								</div>
								<button type="button" onClick={onEditProfile} className="h-8 px-4 bg-zinc-100 rounded-[60px] text-stone-500 text-xs shrink-0">
										프로필 수정
								</button>
						</div>

						{/* 하단 */}
						<div className="mt-9 sm:mt-8">
								<div className="flex items-center justify-between px-1">
										<div>
												<div className="text-indigo-500 text-xs sm:text-sm font-semibold">출근현황</div>
												<div className="mt-1 text-neutral-700 text-lg sm:text-xl font-semibold leading-loose">
														{total ? `${total}일 중 ${present}일 출근 했어요~` : "\u00A0"}
												</div>
										</div>
										<span className="hidden sm:block text-5xl select-none" aria-hidden="true">🥳</span>
								</div>

								<div className="mt-2 px-1">
										<div className="relative h-2.5 sm:h-5 rounded-full bg-neutral-200 overflow-hidden">
												<div className="absolute inset-y-0 left-0 rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
										</div>
										<div className="mt-1.5 text-neutral-300 text-xs font-medium text-right">{percent}%</div>
								</div>
						</div>
					</div>
				</Card>
		);
}

