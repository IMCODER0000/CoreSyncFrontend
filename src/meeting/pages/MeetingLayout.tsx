import {NavLink, Outlet, useNavigate} from "react-router-dom";

// 탭 아이콘
function TabIcon({label}: { label: string }) {
    if (label.toLowerCase() === "calendar") {
        return (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="3" y="4" width="7" height="7" rx="2"/>
                <rect x="14" y="4" width="7" height="7" rx="2"/>
                <rect x="3" y="13" width="7" height="7" rx="2"/>
                <rect x="14" y="13" width="7" height="7" rx="2"/>
            </svg>
        );
    }
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="5" cy="6" r="2"/>
            <rect x="9" y="5" width="11" height="2" rx="1"/>
            <circle cx="5" cy="12" r="2"/>
            <rect x="9" y="11" width="11" height="2" rx="1"/>
            <circle cx="5" cy="18" r="2"/>
            <rect x="9" y="17" width="11" height="2" rx="1"/>
        </svg>
    );
}

// 탭 동작
function Tab({to, label}: { to: string; label: string }) {
    return (
        <NavLink
            to={to}
            end
            relative="path"
            className="relative h-10 px-2 text-[14px] flex items-center transition-colors"
        >
            {({isActive}) => (
                <div
                    className={[
                        "relative inline-flex items-center gap-2 px-2 leading-none",
                        isActive ? "text-[#6D6CF8]" : "text-[#8A94A7] hover:text-[#4B5563]",
                    ].join(" ")}
                >
                    <TabIcon label={label}/>
                    <div className="font-medium">{label}</div>

                    <div
                        className={`absolute left-0 right-0 bottom-[-18.4px] h-[2px] rounded-full pointer-events-none ${
                            isActive ? "bg-[#6D6CF8]" : "bg-transparent"
                        }`}
                    />
                </div>
            )}
        </NavLink>
    );
}

export function MeetingSubnav({ onNewMeeting }: { onNewMeeting?: () => void }) {

    const navigate = useNavigate();
    const handleNew = () => {
        if (onNewMeeting) return onNewMeeting();
        navigate("/meeting/new");
    };

    return (
        <div className="px-6 pt-3 pb-1 border-b border-[#EEF1F5] bg-white">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-end gap-3">
                    <Tab to="../calendar" label="Calendar" />
                    <Tab to="../list" label="List" />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="h-8 px-3 rounded-lg border border-[#EDF1F6] bg-white text-[12px] text-[#5E6776] hover:bg-[#FAFBFF] flex items-center gap-2"
                        aria-label="Filter"
                    >
                        <div className="text-[#9AA3AF]">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                <path d="M4 6h16v2H4V6zm3 5h10v2H7v-2zm-2 5h14v2H5v-2z"/>
                            </svg>
                        </div>
                        <div>Filter</div>
                    </button>
                    <button
                        type="button"
                        className="h-8 px-3 rounded-lg bg-[#6D6CF8] text-white text-[12px] hover:brightness-105 flex items-center gap-2"
                        aria-label="New Meeting"
                        onClick={handleNew}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                            <circle cx="12" cy="12" r="8" fill="white" opacity="0.95"/>
                            <rect x="11" y="7" width="2" height="10" rx="1" fill="#6D6CF8"/>
                            <rect x="7" y="11" width="10" height="2" rx="1" fill="#6D6CF8"/>
                        </svg>
                        <div>새&nbsp;미팅</div>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MeetingLayout() {
    return (
        <div className="w-full ">
            <div className="px-6 pt-3 pb-1 border-b border-[#EEF1F5] bg-white">
                <div className="flex items-center justify-between gap-4">
                    {/* 탭 그룹 */}
                    <div className="flex items-end gap-3">
                        <Tab to="../calendar" label="calendar"/>
                        <Tab to="../list" label="List"/>
                        {/* <Tab to="timeline" label="Timeline" /> */}
                    </div>

                    {/* 검색 + 필터 + 새로 만들기 */}
                    <div className="flex items-center gap-2">
                        {/* 검색 */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search…"
                                className="h-8 pl-9 pr-3 rounded-lg bg-[#F7F8FA] border border-[#E2E6EA] text-[12px] text-[#333D4B] placeholder-[#9AA3AF] focus:outline-none focus:ring-1 focus:ring-[#6D6CF8]/25"
                                aria-label="Search"
                            />
                            {/* 검색 아이콘 */}
                            <div
                                className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#9AA3AF]">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path
                                        d="M11 2a9 9 0 016.32 15.32l3.19 3.19-1.41 1.41-3.19-3.19A9 9 0 1111 2zm0 2a7 7 0 100 14 7 7 0 000-14z"/>
                                </svg>
                            </div>
                        </div>

                        {/* Filter 버튼 */}
                        <button
                            type="button"
                            className="h-8 px-3 rounded-lg border border-[#EDF1F6] bg-white text-[12px] text-[#5E6776] hover:bg-[#FAFBFF] flex items-center gap-2"
                            aria-label="Filter"
                        >
                            <div className="text-[#9AA3AF]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M4 6h16v2H4V6zm3 5h10v2H7v-2zm-2 5h14v2H5v-2z"/>
                                </svg>
                            </div>
                            <div>Filter</div>
                        </button>

                        {/* 새 미팅 버튼 */}
                        <button
                            type="button"
                            className="h-8 px-3 rounded-lg bg-[#6D6CF8] text-white text-[12px] hover:brightness-105 flex items-center gap-2"
                            aria-label="New Meeting"
                        >
                            {/* 아이콘 */}
                            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                                <circle cx="12" cy="12" r="8" fill="white" opacity="0.95"/>
                                <rect x="11" y="7" width="2" height="10" rx="1" fill="#6D6CF8"/>
                                <rect x="7" y="11" width="10" height="2" rx="1" fill="#6D6CF8"/>
                            </svg>
                            <div>새&nbsp;미팅</div>
                        </button>
                    </div>
                </div>
            </div>

            {/* 컨텐츠 */}
            <div className="pt-8">
                <Outlet/>
            </div>
        </div>
    );
}