import {useEffect, useMemo, useState} from "react";
import ProfileCard from "../components/dashbord/ProfileCard";
import WorkTimerCard from "../components/dashbord/WorkTimerCard";
import LeaveCard from "../components/dashbord/LeaveCard";
import CommunityCard from "../components/dashbord/CommunityCard.tsx";
import ApprovalDocsCard from "../components/dashbord/ApprovalDocsCard.tsx";
import WorkStatusCard from "../components/dashbord/WorkStatusCard";

import type {UserProfile, MonthSummary} from "../utils/profile.service";
import * as profileService from "../utils/profile.service";

import {useWorkTimer} from "../hooks/useWorkTimer";
import FortuneCard from "../components/dashbord/FortuneCard.tsx";
import LuckyDrawCard from "../components/dashbord/LuckyDrawCard.tsx";


export default function DashboardPreview() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [month, setMonth] = useState<MonthSummary | null>(null);

    const {
        view, isWorking, isPaused,
        clockIn, clockOut, togglePause,
        leftChipText, rightChipText,
    } = useWorkTimer();

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const getUser = profileService.getUserProfile;
                const [u, m] = await Promise.all([
                    getUser() as Promise<UserProfile>,
                    profileService.getMonthSummary() as Promise<MonthSummary>,
                ]);
                if (!alive) return;
                setUser(u);
                setMonth(m);
            } catch (e) {
                console.error("load dashboard data failed:", e);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const attendanceForCard = useMemo(() => {
        if (!month) return undefined;
        const {presentDays, totalDays} = month;
        const percent = totalDays ? Math.round((presentDays / totalDays) * 100) : 0;
        return {presentDays, totalDays, percent};
    }, [month]);

    return (
        <div className="relative">
            <div className="fixed inset-0 -z-10 bg-slate-50" />
            <div className="mx-auto max-w-[1440px] px-6 py-6">
                {/* 1행 */}
                <div className="grid grid-cols-12 gap-6 items-stretch">
                    {/* 프로필 카드 */}
                    <div className="col-span-12 lg:col-span-7">
                        <ProfileCard className="h-[250px]" user={user ?? undefined} attendance={attendanceForCard}/>
                    </div>

                    {/* 근태 타이머 카드 */}
                    <div className="col-span-6 lg:col-span-3">
                        <WorkTimerCard
                            timeText={view.timeText}
                            dateText={view.dateText}
                            percent={view.percent}
                            leftChipText={leftChipText}
                            rightChipText={rightChipText}
                            isWorking={isWorking}
                            isPaused={isPaused}
                            onTogglePause={togglePause}
                            onLeftAction={clockIn}
                            onRightAction={clockOut}
                            className="h-[250px]"
                            size="sm"
                        />
                    </div>

                    {/* 오늘의 운세 */}
                    <div className="col-span-6 lg:col-span-2 flex flex-col gap-6 h-full justify-between">
                        <FortuneCard className="w-full" />
                        <LuckyDrawCard />
                    </div>
                </div>
                {/* 2행 */}
                <div className="mt-6 grid grid-cols-12 gap-6 items-stretch">
                    {/* 커뮤니티 */}
                    <div className="col-span-12 xl:col-span-5">
                        <CommunityCard className="h-[475px]"/>
                    </div>

                    {/* 잔여연차, 결제문서 */}
                    <div className="col-span-12 xl:col-span-4 flex flex-col h-[475px]">
                        <LeaveCard className="shrink-0"/>
                        <ApprovalDocsCard className="mt-5 flex-1 min-h-0"/>
                    </div>

                    {/* 근무형황 */}
                    <div className="col-span-12 xl:col-span-3">
                        <WorkStatusCard className="h-[475px]"/>
                    </div>
                </div>
            </div>
        </div>
    );
}

