import React from "react";
import CalendarHeader from "../components/calendar/CalendarHeader";
import MonthGrid from "../components/calendar/MonthGrid";
import DayPanel from "../components/calendar/DayPanel";
import WeekGrid from "../components/calendar/WeekGrid";
import { useCalendar } from "../hooks/useCalendar";
import { LayoutGroup, motion } from "framer-motion";

export default function CalendarPage() {
		const {
				cursor, setCursor,
				selectedDate, setSelectedDate,
				monthWeeks, meetings, meetingsOfDay,
		} = useCalendar();

		const panelW = 360;
		const [mode, setMode] = React.useState<"week" | "month">("month");

		// 가로 반응형: 1280px 미만이면 DayPanel을 모달로 전환
		const [overlay, setOverlay] = React.useState(false);
		const [panelOpen, setPanelOpen] = React.useState(true);
		React.useEffect(() => {
				const onResize = () => {
						const isOverlay = window.innerWidth < 1280;
						setOverlay(isOverlay);
						setPanelOpen(isOverlay ? true : true); // 넓어지면 자동으로 열림(우측 고정)
				};
				onResize();
				window.addEventListener("resize", onResize);
				return () => window.removeEventListener("resize", onResize);
		}, []);

		const handleSelectDate = (d: Date) => {
				setSelectedDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
				if (overlay) setPanelOpen(true); // [CHANGED] 좁을 때 날짜 클릭하면 모달 열림
		};


		const goToDay = (offset: number) => {
				const base = selectedDate ?? cursor;
				const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
				setSelectedDate(next);
				if (next.getFullYear() !== cursor.getFullYear() || next.getMonth() !== cursor.getMonth()) {
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

		return (
				<LayoutGroup>
						<div className="min-h-screen w-full bg-[#F5F6F8] pb-8">
								{/* 상단 타이틀 */}
								<div className="mx-auto w-full max-w-[1600px] 2xl:max-w-[1920px] px-6 pt-6 pb-3">
										<div className="flex items-end justify-between">
												<div>
														<h1 className="text-[18px] font-bold text-[#1F2937] leading-none">나의 미팅 일정</h1>
														<p className="mt-1 text-[12px] text-[#98A2B3] leading-none">현재 미팅 일정을 확인해보세요</p>
												</div>
										</div>
								</div>

								{/* 본문 */}
								<div className="mx-auto w-full max-w-[1600px] 2xl:max-w-[1920px] px-6 pb-6">
										<motion.div
												layout
												className="meeting flex h-[calc(100vh-150px)] gap-4"
												style={{ ["--panelW" as any]: overlay ? 0 : panelW, willChange: "width" }}
												transition={{ layout: { duration: 0.3 }, duration: 0.3 }}
										>
												{/* 좌측: 달력 */}
												<motion.section
														layout
														className="relative z-0 flex min-w-0 flex-1 flex-col"
														style={{ width: overlay ? "100%" : "calc(100% - var(--panelW))" }}
												>
														<motion.div
																layout
																className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(31,41,55,0.06)]"
														>
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
														</motion.div>
												</motion.section>

												{/* 우측: DayPanel */}
												{!overlay && (
														// [CHANGED] 넓은 화면: 기존처럼 우측 고정
														<motion.aside
																layout
																className="relative z-10 shrink-0 overflow-hidden"
																style={{ width: "var(--panelW)", willChange: "width", scrollbarGutter: "stable both-edges" }}
														>
																<div className="box-border flex h-full w-[360px] flex-col rounded-2xl bg-white shadow-[0_4px_24px_rgba(31,41,55,0.06)]">
																		<DayPanel
																				date={selectedDate ?? new Date()}
																				items={selectedDate ? meetingsOfDay(selectedDate) : []}
																				onPrevDay={goPrevDay}
																				onNextDay={goNextDay}
																		/>
																</div>
														</motion.aside>
												)}
										</motion.div>
								</div>
								{/* [NEW] 좁은 화면: 모달(센터 정렬 + 어두운 배경 + 닫기 버튼) */}
								{overlay && panelOpen && (
										<>
												<div
														className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[1px]"
														onClick={() => setPanelOpen(false)}
												/>
												<div className="fixed inset-0 z-[70] flex items-start justify-center pt-24 px-6">
														<div className="relative w-[min(420px,100%)] rounded-2xl bg-white shadow-[0_12px_40px_rgba(31,41,55,0.18)]">
																<button
																		aria-label="close"
																		onClick={() => setPanelOpen(false)}
																		className="absolute right-3 top-3 h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50"
																>
																		<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
																				<path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
						</div>
				</LayoutGroup>
		);
}