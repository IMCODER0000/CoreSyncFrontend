/**
 * useWorkTimer
 * - DEMO_MODE=true 에서는 로컬스토리지와 setInterval 로만 동작(목업)
 * - DEMO_MODE=false 로 바꾸고, attendance.service.ts 의 REAL API 주석을 해제하면
 *   실제 백엔드와 연동됨
 *
 * ★ 변경 요약
 *  - DEMO_MODE 스위치 추가 (백 전환 시 false 로만 바꾸면 됨)
 *  - 초기 로딩 시: DEMO면 localStorage, REAL이면 getTodaySummary() 호출해 복구
 *  - "칩" 텍스트(좌: 출근시간/출근, 우: 퇴근)와 퍼센트/시간 포맷을 훅에서 계산
 *  - toggle/clockIn/clockOut 액션 제공
 *
 * ★ 백 연결 시 해야 할 일
 *  1) 아래 DEMO_MODE 를 false 로 변경
 *  2) src/utils/attendance.service.ts 에서
 *     - /* ===== MOCK START ~ END ===== 블록 삭제
 *     - /* ===== REAL API 블록 주석 해제
 *  3) 지오펜스 좌표(GEOFENCE_POINTS)를 실제 회사 위치로 바꾸기
 */

/**
 * useWorkTimer
 * - 출근(Clock-in) 후에는 칩이 "HH:MM"으로 표기
 * - 퇴근(Clock-out)해도 당일에는 "HH:MM" 유지
 * - 다음 날 00:00 에 자동 초기화되어 칩이 "출근"으로 돌아감
 * - 8시간 기준 퍼센트(원형 링)
 *
 * 🔁 백 연결 시:
 *   1) DEMO_MODE=false
 *   2) ../utils/attendance.service 의 REAL API 블록 주석 해제, MOCK 삭제
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { startShift, stopShift, getTodaySummary } from "../utils/attendance.service";

// [ADDED] 데모 스위치: 지금은 목업, 백 붙이면 false
const DEMO_MODE = true;

// [ADDED] 로컬스토리지 키 (pause 분리)
const LS_WORKING = "demo:isWorking";
const LS_IN = "demo:clockInAt";
const LS_OUT = "demo:clockOutAt";
const LS_WORKED = "demo:workedSec";
const LS_PAUSED = "demo:isPaused";

const pad2 = (n: number) => String(n).padStart(2, "0");
const formatHMS = (sec: number) => {
		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = Math.floor(sec % 60);
		return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};
const formatKoreanDate = (d: Date) => {
		const yoil = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
		return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}(${yoil})`;
};
const sameDay = (a: Date, b: Date) =>
		a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export type UseWorkTimerReturn = {
		isWorking: boolean;
		isPaused: boolean; // [ADDED]
		view: { timeText: string; dateText: string; percent: number };
		leftChipText: string;  // 출근 HH:MM 또는 "출근"
		rightChipText: string; // 퇴근 HH:MM 또는 "퇴근"
		clockIn: () => Promise<void>;
		clockOut: () => Promise<void>;
		togglePause: () => void; // [ADDED]
		gpsError?: string | null;
};

export function useWorkTimer(): UseWorkTimerReturn {
		const [isWorking, setIsWorking] = useState(false);
		const [isPaused, setIsPaused] = useState(false); // [ADDED]
		const [clockInAt, setClockInAt] = useState<string | null>(null);
		const [clockOutAt, setClockOutAt] = useState<string | null>(null);
		const [elapsed, setElapsed] = useState(0);
		const [gpsError, setGpsError] = useState<string | null>(null);

		const tickRef = useRef<number | null>(null);
		const midnightRef = useRef<number | null>(null);
		const isWorkingRef = useRef(isWorking);
		const isPausedRef = useRef(isPaused); // [ADDED]
		useEffect(() => { isWorkingRef.current = isWorking; }, [isWorking]);
		useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

		// 초기 복구
		useEffect(() => {
				(async () => {
						if (DEMO_MODE) {
								const working = localStorage.getItem(LS_WORKING) === "1";
								const paused  = localStorage.getItem(LS_PAUSED) === "1";
								const inAt    = localStorage.getItem(LS_IN);
								const outAt   = localStorage.getItem(LS_OUT);
								const worked  = parseInt(localStorage.getItem(LS_WORKED) || "0", 10) || 0;

								// ⬇️ [중요: 변경] 근무 중이 아닐 땐 이전 시각을 칩에 미리 올리지 않음
								if (working && inAt) {
										// 근무 중: 출근 시각만 살리고 경과 계산
										setClockInAt(sameDay(new Date(inAt), new Date()) ? inAt : null);
										setClockOutAt(null);
										setIsWorking(true);
										setIsPaused(paused);

										const base = Math.max(0, Math.floor((Date.now() - new Date(inAt).getTime()) / 1000));
										setElapsed(base);
								} else {
										// 근무 중 아님: 칩은 "출근/퇴근" 그대로, 경과도 0
										setIsWorking(false);
										setIsPaused(false);
										setClockInAt(null);     // ★ 여기서 기존 inAt/outAt 무시
										setClockOutAt(null);    // ★
										setElapsed(0);
								}
						} else {
								// REAL: 서버 요약
								try {
										const s = await getTodaySummary();
										const cin  = s.clockInAt ? new Date(s.clockInAt) : null;
										const cout = s.clockOutAt ? new Date(s.clockOutAt) : null;

										const working = !!(cin && !cout);
										setIsWorking(working);
										setIsPaused(false);

										// ★ 근무 중이 아닌 경우엔 칩 미표시(라벨 유지)
										setClockInAt(working ? s.clockInAt ?? null : null);
										setClockOutAt(null);

										if (typeof s.presentSeconds === "number") setElapsed(s.presentSeconds);
										else if (working && cin) setElapsed(Math.max(0, Math.floor((Date.now() - cin.getTime()) / 1000)));
										else setElapsed(0);
								} catch {
										setIsWorking(false);
										setIsPaused(false);
										setClockInAt(null);
										setClockOutAt(null);
										setElapsed(0);
								}
						}

						scheduleMidnightReset();
				})();

				return () => {
						if (tickRef.current) clearInterval(tickRef.current);
						if (midnightRef.current) clearTimeout(midnightRef.current);
				};
				// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);


		// 1초 틱: 근무 중 & 일시정지 아님일 때만 증가 [CHANGED]
		useEffect(() => {
				if (isWorking && !isPaused) {
						tickRef.current = window.setInterval(() => setElapsed((v) => v + 1), 1000);
				} else if (tickRef.current) {
						clearInterval(tickRef.current);
						tickRef.current = null;
				}
				return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; } };
		}, [isWorking, isPaused]);

		// 화면값
		const view = {
				timeText: useMemo(() => formatHMS(elapsed), [elapsed]),
				dateText: useMemo(() => formatKoreanDate(new Date()), []),
				percent: useMemo(() => {
						const base = 8 * 60 * 60;
						return Math.max(0, Math.min(100, Math.round((elapsed / base) * 100)));
				}, [elapsed]),
		};

		const leftChipText = useMemo(() => {
				if (!clockInAt) return "출근";
				const t = new Date(clockInAt);
				return sameDay(t, new Date()) ? `${pad2(t.getHours())}:${pad2(t.getMinutes())}` : "출근";
		}, [clockInAt]);

		const rightChipText = useMemo(() => {
				if (!clockOutAt) return "퇴근";
				const t = new Date(clockOutAt);
				return sameDay(t, new Date()) ? `${pad2(t.getHours())}:${pad2(t.getMinutes())}` : "퇴근";
		}, [clockOutAt]);

		// 액션
		const clockIn = async () => {
				if (isWorking) return;
				if (DEMO_MODE) {
						const nowIso = new Date().toISOString();
						localStorage.setItem(LS_WORKING, "1");
						localStorage.setItem(LS_IN, nowIso);
						localStorage.removeItem(LS_OUT);
						localStorage.setItem(LS_WORKED, "0");
						localStorage.setItem(LS_PAUSED, "0"); // [ADDED]
						setClockInAt(nowIso);
						setClockOutAt(null);
						setElapsed(0);
						setIsPaused(false); // [ADDED]
						setIsWorking(true);
						return;
				}
				const res = await startShift({ at: new Date().toISOString() });
				const cin = res.clockInAt ?? new Date().toISOString();
				setClockInAt(cin);
				setClockOutAt(null);
				setElapsed(res.presentSeconds ?? 0);
				setIsPaused(false); // [ADDED]
				setIsWorking(true);
		};

		const clockOut = async () => {
				if (!isWorking) return;
				if (DEMO_MODE) {
						const nowIso = new Date().toISOString();
						localStorage.setItem(LS_WORKING, "0");
						localStorage.setItem(LS_OUT, nowIso);
						localStorage.setItem(LS_WORKED, String(elapsed));
						localStorage.setItem(LS_PAUSED, "0"); // [ADDED]
						setClockOutAt(nowIso);
						setIsPaused(false); // [ADDED]
						setIsWorking(false);
						return;
				}
				const res = await stopShift({ at: new Date().toISOString() });
				const outIso = res.clockOutAt ?? new Date().toISOString();
				setClockOutAt(outIso);
				setIsWorking(false);
				setIsPaused(false); // [ADDED]
				if (typeof res.presentSeconds === "number") setElapsed(res.presentSeconds);
				else if (clockInAt) {
						const diff = Math.max(0, Math.floor((new Date(outIso).getTime() - new Date(clockInAt).getTime()) / 1000));
						setElapsed(diff);
				}
		};

		// [ADDED] 외출/복귀 토글 (퇴근 아님!)
		const togglePause = () => {
				if (!isWorking) return; // 출근 전엔 동작 X
				setIsPaused((p) => {
						const next = !p;
						if (DEMO_MODE) localStorage.setItem(LS_PAUSED, next ? "1" : "0");
						return next;
				});
		};

		// 자정 리셋: 근무 중이 아닐 때만 초기화 (칩/시간)
		const scheduleMidnightReset = () => {
				if (midnightRef.current) clearTimeout(midnightRef.current);
				const now = new Date();
				const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
				const ms = tomorrow.getTime() - now.getTime();
				midnightRef.current = window.setTimeout(() => {
						if (!isWorkingRef.current) {
								setClockInAt(null);
								setClockOutAt(null);
								setElapsed(0);
								setIsPaused(false);
								if (DEMO_MODE) {
										localStorage.removeItem(LS_IN);
										localStorage.removeItem(LS_OUT);
										localStorage.removeItem(LS_WORKED);
										localStorage.setItem(LS_WORKING, "0");
										localStorage.setItem(LS_PAUSED, "0");
								}
						}
						scheduleMidnightReset();
				}, ms);
		};

		return {
				isWorking,
				isPaused,
				view,
				leftChipText,
				rightChipText,
				clockIn,
				clockOut,
				togglePause,
				gpsError,
		};
}
