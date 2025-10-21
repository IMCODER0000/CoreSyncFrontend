import React from "react";
import CalendarHeader from "../components/calendar/CalendarHeader";
import MonthGrid from "../components/calendar/MonthGrid";
import DayPanel from "../components/calendar/DayPanel";
import WeekGrid from "../components/calendar/WeekGrid";
import { useCalendar } from "../hooks/useCalendar";
import { LayoutGroup } from "framer-motion";
import { MeetingSubnav } from "./MeetingLayout";
import { meetingApi } from "../../api/meetingApi";

export default function CalendarPage() {
    const {
        cursor,
        setCursor,
        selectedDate,
        setSelectedDate,
        monthWeeks,
        meetings,
        meetingsOfDay,
    } = useCalendar();

    const panelW = 360;
    const [mode, setMode] = React.useState<"week" | "month">("month");
    
    // 미팅 생성 모달 상태
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);
    const [newMeetingTitle, setNewMeetingTitle] = React.useState("");
    const [newMeetingDate, setNewMeetingDate] = React.useState("");
    const [newMeetingStartTime, setNewMeetingStartTime] = React.useState("10:00");
    const [newMeetingEndTime, setNewMeetingEndTime] = React.useState("11:00");
    const [isAllDay, setIsAllDay] = React.useState(false);
    const [creating, setCreating] = React.useState(false);

    const OVERLAY_BREAKPOINT = 1100;

    // 1100px 미만이면 DayPanel을 모달(overlay)로 전환
    const [overlay, setOverlay] = React.useState(false);
    const [panelOpen, setPanelOpen] = React.useState(false);

    React.useEffect(() => {
        const onResize = () => {
            const isOverlay = window.innerWidth < OVERLAY_BREAKPOINT;
            setOverlay(isOverlay);
            setPanelOpen(false); // 폭 바뀔 때 자동 오픈 금지
        };
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const handleSelectDate = (d: Date) => {
        setSelectedDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
        if (overlay) {
            setPanelOpen(true); // 좁은 화면에서만: 날짜 클릭 시 모달 오픈
        }
    };

    // 닫기 시 선택도 해제(overlay일 때만)
    const handleClosePanel = () => {
        setPanelOpen(false);
        if (overlay) {
            setSelectedDate(null as unknown as Date); // 선택 라인 제거
        }
    };

    const goToDay = (offset: number) => {
        const base = selectedDate ?? cursor;
        const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
        setSelectedDate(next);
        if (
            next.getFullYear() !== cursor.getFullYear() ||
            next.getMonth() !== cursor.getMonth()
        ) {
            setCursor(new Date(next.getFullYear(), next.getMonth(), 1));
        }
    };
    const goPrevDay = () => goToDay(-1);
    const goNextDay = () => goToDay(1);

    const handleToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setCursor(today);
        setSelectedDate(today);
    };
    
    // 미팅 생성 모달 열기
    const handleOpenCreateModal = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        setNewMeetingDate(`${year}-${month}-${day}`);
        setNewMeetingTitle("");
        setNewMeetingStartTime("10:00");
        setNewMeetingEndTime("11:00");
        setIsAllDay(false);
        setShowCreateModal(true);
    };
    
    // 미팅 생성
    const handleCreateMeeting = async () => {
        if (!newMeetingTitle.trim() || !newMeetingDate) {
            alert("제목과 날짜를 입력해주세요.");
            return;
        }
        
        try {
            setCreating(true);
            
            const startDateTime = isAllDay 
                ? `${newMeetingDate}T00:00:00`
                : `${newMeetingDate}T${newMeetingStartTime}:00`;
            const endDateTime = isAllDay
                ? `${newMeetingDate}T23:59:59`
                : `${newMeetingDate}T${newMeetingEndTime}:00`;
            
            await meetingApi.createMeeting({
                title: newMeetingTitle,
                start: startDateTime,
                end: endDateTime,
                allDay: isAllDay,
            });
            
            setShowCreateModal(false);
            setShowSuccessModal(true);
            
            // 3초 후 성공 모달 자동 닫기
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 3000);
        } catch (error) {
            console.error("미팅 생성 실패:", error);
            alert("미팅 생성에 실패했습니다.");
        } finally {
            setCreating(false);
        }
    };

    // Week 모드에서 좁은 폭일 때만 고정 높이로 눌림 방지
    const containerHeightClass = overlay
        ? (mode === "week" ? "h-[640px]" : "h-auto")
        : "h-auto xl:h-[720px] 2xl:h-[800px]";

    return (
        <LayoutGroup>
            <div className="min-h-[100dvh] w-full bg-[#f8f9fa] px-8 py-6 flex flex-col">
                {/* 페이지 타이틀 */}
                <div className="mx-auto w-full max-w-[1600px] 2xl:max-w-[1920px] px-6 mb-5 flex items-center min-h-0">
                    <div className="flex items-baseline gap-2.5 shrink-0">
                        <h1 className="text-xl font-bold text-gray-800 leading-none">
                            나의 미팅 일정
                        </h1>
                        <p className="text-xs text-gray-500 leading-none">
                            현재 미팅 일정을 확인해보세요
                        </p>
                    </div>

                    {/* 구분선 */}
                    <div className="ml-4 flex-1 h-px bg-gray-200 rounded-full" />
                    
                    {/* 새 미팅 버튼 */}
                    <button
                        onClick={handleOpenCreateModal}
                        className="ml-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 font-semibold text-sm"
                    >
                        <span className="text-lg">+</span>
                        새 미팅
                    </button>
                </div>

                {/* 전체: Subnav + (달력/일정) 한 카드 */}
                <div className="mx-auto w-full max-w-[1600px] 2xl:max-w-[1920px] px-6 pb-5 flex-1 flex">
                    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 min-h-0">
                        {/* MeetingSubnav */}
                        <div className="shrink-0">
                            <MeetingSubnav />
                        </div>

                        {/* 카드 본문 */}
                        <div className="flex-1 min-h-0 px-5 py-4">
                            <div
                                className={`grid min-h-0 gap-4 ${containerHeightClass}`}
                                style={{
                                    gridTemplateColumns: overlay ? "1fr" : `1fr ${panelW}px`,
                                }}
                            >
                                {/* 좌측: 달력 */}
                                <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white">
                                    <CalendarHeader
                                        cursor={cursor}
                                        setCursor={setCursor}
                                        variant="inside"
                                        mode={mode}
                                        onModeChange={setMode}
                                        onToday={handleToday}
                                    />
                                    <div className="flex-1 min-h-0">
                                        {mode === "month" ? (
                                            <MonthGrid
                                                cursor={cursor}
                                                weeks={monthWeeks}
                                                meetings={meetings}
                                                onSelectDate={handleSelectDate}
                                                selectedDate={selectedDate}
                                            />
                                        ) : (
                                            <WeekGrid
                                                cursor={cursor}
                                                meetings={meetings}
                                                onSelectDate={handleSelectDate}
                                                selectedDate={selectedDate}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* 우측: DayPanel (데스크탑) */}
                                {!overlay && (
                                    <div className="h-full min-h-0 overflow-auto rounded-lg shadow-sm border border-gray-200 bg-white">
                                        <DayPanel
                                            date={selectedDate ?? new Date()}
                                            items={selectedDate ? meetingsOfDay(selectedDate) : []}
                                            onPrevDay={goPrevDay}
                                            onNextDay={goNextDay}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 좁은 화면: DayPanel 모달 (날짜 클릭 시에만 열림) */}
                {overlay && panelOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                            onClick={handleClosePanel}
                        />
                        <div className="fixed inset-0 z-[70] flex items-start justify-center px-8 sm:px-10 pt-28">
                            <div className="relative w-[min(540px,100%)] overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(99,102,241,0.25)] border border-gray-100">
                                <button
                                    aria-label="close"
                                    onClick={handleClosePanel}
                                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                                <DayPanel
                                    date={selectedDate ?? new Date()}
                                    items={selectedDate ? meetingsOfDay(selectedDate) : []}
                                    onPrevDay={goPrevDay}
                                    onNextDay={goNextDay}
                                />
                            </div>
                        </div>
                    </>
                )}
                
                {/* 미팅 생성 모달 */}
                {showCreateModal && (
                    <>
                        <div
                            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowCreateModal(false)}
                        />
                        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
                            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                                
                                <h2 className="text-xl font-bold text-gray-900 mb-6">새 미팅 생성</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">제목</label>
                                        <input
                                            type="text"
                                            value={newMeetingTitle}
                                            onChange={(e) => setNewMeetingTitle(e.target.value)}
                                            placeholder="미팅 제목을 입력하세요"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">날짜</label>
                                        <input
                                            type="date"
                                            value={newMeetingDate}
                                            onChange={(e) => setNewMeetingDate(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="allDay"
                                            checked={isAllDay}
                                            onChange={(e) => setIsAllDay(e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <label htmlFor="allDay" className="text-sm text-gray-700">종일</label>
                                    </div>
                                    
                                    {!isAllDay && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">시작 시간</label>
                                                <input
                                                    type="time"
                                                    value={newMeetingStartTime}
                                                    onChange={(e) => setNewMeetingStartTime(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">종료 시간</label>
                                                <input
                                                    type="time"
                                                    value={newMeetingEndTime}
                                                    onChange={(e) => setNewMeetingEndTime(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleCreateMeeting}
                                        disabled={creating}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                                    >
                                        {creating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                생성 중...
                                            </>
                                        ) : (
                                            '저장'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                
                {/* 성공 모달 */}
                {showSuccessModal && (
                    <>
                        <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm" />
                        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
                            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">미팅이 생성되었습니다!</h3>
                                <p className="text-sm text-gray-600">새로운 미팅이 성공적으로 등록되었습니다.</p>
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold"
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </LayoutGroup>
    );
}
