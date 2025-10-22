import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { hrApi, type TeamResponse } from '../../api/hrApi';
import { attendanceApi, type AttendanceRecord as ApiAttendanceRecord, type AnnualLeave as ApiAnnualLeave } from '../../api/attendanceApi';

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'leave' | 'holiday';
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
}

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastCheckedTeam = useRef<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [, setSelectedDate] = useState<Date | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showLeaveListModal, setShowLeaveListModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveType, setLeaveType] = useState<'ANNUAL' | 'HALF_AM' | 'HALF_PM'>('ANNUAL');
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [, setLoading] = useState(true);
  const [leaveStats, setLeaveStats] = useState({ totalDays: 15, usedDays: 0, remainingDays: 15 });
  const [leaveHistory, setLeaveHistory] = useState<ApiAnnualLeave[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<ApiAttendanceRecord | null>(null);
  const [attendanceList, setAttendanceList] = useState<ApiAttendanceRecord[]>([]);
  const [monthStats, setMonthStats] = useState({ presentDays: 0, leaveDays: 0, avgWorkHours: 0 });
  const [currentWorkTime, setCurrentWorkTime] = useState<string>('0:00:00');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // 팀 목록 로드
  useEffect(() => {
    loadTeams();
  }, []);
  
  // 선택한 팀이 변경되면 팀장 여부 확인 후 데이터 로드
  useEffect(() => {
    if (selectedTeam) {
      checkLeaderAndLoadData();
    }
  }, [selectedTeam]);
  
  // 월이 변경되면 근태 목록 다시 로드
  useEffect(() => {
    if (selectedTeam) {
      loadAttendanceList();
    }
  }, [selectedTeam, currentDate]);
  
  // 데이터 로드 시 초기화
  useEffect(() => {
    if (!todayAttendance) {
      setCurrentWorkTime('0:00:00');
      setSessionStartTime(null);
      return;
    }
    
    // 이미 로컬 타이머가 실행 중이면 서버 데이터로 덮어쓰지 않음
    if (sessionStartTime) {
      console.log('로컬 타이머 실행 중, 서버 데이터 무시');
      return;
    }
    
    // 서버에서 받은 누적 시간으로 초기 표시 시간 설정
    const baseWorkHours = todayAttendance.workHours || 0;
    const hours = Math.floor(baseWorkHours);
    const minutes = Math.floor((baseWorkHours % 1) * 60);
    const seconds = Math.floor(((baseWorkHours % 1) * 60 % 1) * 60);
    const initialTime = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    console.log('서버에서 받은 누적 시간:', baseWorkHours, '→', initialTime);
    setCurrentWorkTime(initialTime);
    
    // 서버에서 작업 중이라고 하면 세션 시작 시간 복원
    if (todayAttendance.isWorking && todayAttendance.currentSessionStart) {
      const today = new Date();
      const parts = todayAttendance.currentSessionStart.split(':');
      const sessionStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        parseInt(parts[0]),
        parseInt(parts[1]),
        parseInt(parts[2] || '0')
      );
      console.log('서버에서 세션 시작 시간 복원:', sessionStart);
      setSessionStartTime(sessionStart);
    }
  }, [todayAttendance]);
  
  // 실시간 작업 시간 계산 (프론트엔드에서만 처리)
  useEffect(() => {
    console.log('타이머 useEffect 실행:', { sessionStartTime, todayAttendance });
    
    const calculateWorkTime = () => {
      if (!todayAttendance) {
        setCurrentWorkTime('0:00:00');
        return;
      }
      
      // 세션이 활성화되어 있을 때만 계산
      if (!sessionStartTime) {
        console.log('세션 시작 시간 없음, 계산 중단');
        return;
      }
      
      // 기본 누적 시간 (이미 완료된 세션들의 합)
      const baseWorkHours = todayAttendance.workHours || 0;
      let totalSeconds = Math.floor(baseWorkHours * 3600);
      
      console.log('기본 누적 시간:', baseWorkHours, '시간 =', totalSeconds, '초');
      
      // 현재 세션 시간 추가
      const now = new Date();
      const currentSessionSeconds = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      console.log('현재 세션 시간:', currentSessionSeconds, '초');
      totalSeconds += currentSessionSeconds;
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      console.log('총 시간:', hours, ':', minutes, ':', seconds);
      setCurrentWorkTime(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    
    // 세션이 활성화되어 있을 때만 interval 설정
    if (sessionStartTime) {
      console.log('타이머 interval 시작');
      calculateWorkTime();
      const interval = setInterval(calculateWorkTime, 1000);
      return () => {
        console.log('타이머 interval 정리');
        clearInterval(interval);
      };
    }
  }, [todayAttendance, sessionStartTime]);
  
  const loadTeams = async () => {
    try {
      setLoading(true);
      const teamList = await hrApi.getTeamList();
      setTeams(teamList);
      
      // 리다이렉트 시 전달된 팀이 있으면 해당 팀 선택
      const state = location.state as { selectedTeam?: number } | null;
      if (state?.selectedTeam) {
        setSelectedTeam(state.selectedTeam);
      } else if (teamList.length > 0) {
        setSelectedTeam(teamList[0].id);
      }
    } catch (error) {
      console.error('팀 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 팀 선택 변경 핸들러
  const handleTeamChange = (teamId: number) => {
    console.log('팀 변경:', teamId);
    // 이미 선택된 팀이면 무시
    if (teamId === selectedTeam) {
      console.log('이미 선택된 팀입니다.');
      return;
    }
    // 팀 변경 시 권한 체크를 다시 수행하도록 초기화
    lastCheckedTeam.current = null;
    setSelectedTeam(teamId);
  };
  
  const checkLeaderAndLoadData = async () => {
    if (!selectedTeam || selectedTeam === lastCheckedTeam.current) return;
    
    lastCheckedTeam.current = selectedTeam;
    
    try {
      // 팀장 여부 확인
      const isLeader = await hrApi.isTeamLeader(selectedTeam);
      console.log('팀장 여부:', isLeader);
      
      if (isLeader) {
        // 팀장이면 팀장 페이지로 리다이렉트
        console.log('팀장입니다. 팀장 페이지로 이동합니다.');
        navigate('/attendance/leader', { replace: true, state: { selectedTeam } });
        return;
      }
      
      // 팀원이면 데이터 로드
      loadTeamMemberData();
    } catch (error) {
      console.error('팀장 여부 확인 실패:', error);
      // 오류 발생 시 데이터 로드
      loadTeamMemberData();
    }
  };
  
  // 팀원용 데이터 로드
  const loadTeamMemberData = async () => {
    if (!selectedTeam) return;
    
    try {
      // 연차 통계 로드
      const stats = await attendanceApi.getLeaveStats(selectedTeam);
      setLeaveStats(stats);
      
      // 연차 내역 로드
      const leaves = await attendanceApi.getLeaveList(selectedTeam);
      setLeaveHistory(leaves);
      
      // 오늘의 근태 로드
      const today = await attendanceApi.getTodayAttendance(selectedTeam);
      console.log('서버에서 받은 오늘의 근태:', today);
      setTodayAttendance(today);
    } catch (error) {
      console.error('팀 데이터 로드 실패:', error);
    }
  };
  
  const loadAttendanceList = async () => {
    if (!selectedTeam) return;
    
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const list = await attendanceApi.getAttendanceList(selectedTeam, year, month);
      setAttendanceList(list);
      
      // 이번 달 통계 계산
      const presentDays = list.filter(a => a.status === 'PRESENT').length;
      const leaveDays = list.filter(a => a.status === 'LEAVE').length;
      const totalWorkHours = list.reduce((sum, a) => sum + (a.workHours || 0), 0);
      const avgWorkHours = presentDays > 0 ? totalWorkHours / presentDays : 0;
      
      setMonthStats({
        presentDays,
        leaveDays,
        avgWorkHours: Math.round(avgWorkHours * 10) / 10
      });
    } catch (error) {
      console.error('근태 목록 로드 실패:', error);
    }
  };
  
  // 시간 포맷 함수 (HH:MM:SS -> HH:MM)
  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return undefined;
    const parts = timeStr.split(':');
    return `${parts[0]}:${parts[1]}`;
  };
  
  // API 데이터를 달력용 형식으로 변환
  const attendanceData: Record<string, AttendanceRecord> = {};
  attendanceList.forEach(record => {
    const statusMap: Record<string, 'present' | 'absent' | 'leave' | 'holiday'> = {
      'PRESENT': 'present',
      'ABSENT': 'absent',
      'LEAVE': 'leave',
      'HOLIDAY': 'holiday'
    };
    
    attendanceData[record.date] = {
      date: record.date,
      status: statusMap[record.status] || 'present',
      checkIn: formatTime(record.checkIn),
      checkOut: formatTime(record.checkOut),
      workHours: record.workHours
    };
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 border-green-300';
      case 'absent':
        return 'bg-red-100 border-red-300';
      case 'leave':
        return 'bg-blue-100 border-blue-300';
      case 'holiday':
        return 'bg-gray-100 border-gray-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <span className="text-green-600">✓</span>;
      case 'absent':
        return <span className="text-red-600">✗</span>;
      case 'leave':
        return <span className="text-blue-600">✈️</span>;
      case 'holiday':
        return <span className="text-gray-600">☕</span>;
      default:
        return null;
    }
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const renderCalendar = () => {
    const days = [];
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    // 요일 헤더
    weekDays.forEach((day, index) => {
      days.push(
        <div key={`weekday-${index}`} className="text-center font-semibold text-gray-700 py-3">
          {day}
        </div>
      );
    });

    // 빈 칸 (이전 달)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // 날짜
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      const record = attendanceData[dateStr];
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.05 }}
          className={`p-2 min-h-[80px] border-2 rounded-lg cursor-pointer transition-all ${
            record ? getStatusColor(record.status) : 'bg-white border-gray-200'
          } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedDate(new Date(year, month, day))}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
              {day}
            </span>
            {record && getStatusIcon(record.status)}
          </div>
          {record && record.checkIn && (
            <div className="text-xs text-gray-600 space-y-0.5">
              <div className="flex items-center gap-1">
                <span>🕐</span>
                <span>{record.checkIn}</span>
              </div>
              {record.workHours && (
                <div className="text-xs font-medium text-gray-700">
                  {record.workHours}h
                </div>
              )}
            </div>
          )}
        </motion.div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-indigo-100 p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                    📅
                  </div>
                  근태 관리
                </h1>
                <p className="text-gray-600 text-sm">출퇴근 기록과 연차 관리를 한눈에 확인하세요 ✨</p>
              </div>
            </div>
            
            {/* 팀 선택 탭 */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamChange(team.id)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                    selectedTeam === team.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white/80 text-gray-700 hover:bg-white border border-indigo-100'
                  }`}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {!selectedTeam ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-indigo-100 p-16 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
              👥
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">팀을 선택해주세요</h2>
            <p className="text-gray-500 text-sm">근태 관리를 시작하려면 위에서 팀을 선택하세요</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 달력 영역 */}
            <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-6"
            >
              {/* 달력 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={previousMonth}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all text-xl font-bold text-gray-700 hover:text-indigo-600"
                >
                  ‹
                </button>
                <h2 className="text-xl font-bold text-gray-900">
                  {year}년 {month + 1}월
                </h2>
                <button
                  onClick={nextMonth}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all text-xl font-bold text-gray-700 hover:text-indigo-600"
                >
                  ›
                </button>
              </div>

              {/* 달력 그리드 */}
              <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
              </div>

              {/* 범례 */}
              <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm text-gray-600">출근</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">✗</span>
                  <span className="text-sm text-gray-600">결근</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✈️</span>
                  <span className="text-sm text-gray-600">연차</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>☕</span>
                  <span className="text-sm text-gray-600">휴일</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 사이드바 - 통계 및 연차 정보 */}
          <div className="space-y-6">
            {/* 연차 관리 버튼 */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setShowLeaveListModal(true)}
              className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✈️</span>
                  <h3 className="text-xl font-bold">연차 관리</h3>
                </div>
                <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  {leaveStats.remainingDays}일 남음
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm opacity-90 mb-1">사용 {leaveStats.usedDays}일 / 총 {leaveStats.totalDays}일</p>
                  <div className="w-48 bg-white bg-opacity-30 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${(leaveStats.usedDays / leaveStats.totalDays) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-3xl opacity-80">→</span>
              </div>
            </motion.button>

            {/* 이번 달 통계 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                이번 달 통계
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-gray-700 font-medium text-sm">출근일</span>
                  <span className="text-2xl font-bold text-green-600">{monthStats.presentDays}일</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-gray-700 font-medium text-sm">연차</span>
                  <span className="text-2xl font-bold text-blue-600">{monthStats.leaveDays}일</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <span className="text-gray-700 font-medium text-sm">평균 근무시간</span>
                  <span className="text-2xl font-bold text-indigo-600">{monthStats.avgWorkHours}h</span>
                </div>
              </div>
            </motion.div>

            {/* 오늘의 근무 시간 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                오늘의 근무
              </h3>
              <div className="space-y-3">
                {todayAttendance ? (
                  <>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100">
                      <span className="text-gray-700 font-medium text-sm">첫 시작 시간</span>
                      <span className="text-lg font-bold text-green-700">{formatTime(todayAttendance.checkIn) || '-'}</span>
                    </div>
                    <div className={`flex justify-between items-center p-4 rounded-lg border ${
                      todayAttendance.isWorking ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-50 border-indigo-100'
                    }`}>
                      <span className="text-gray-700 font-medium text-sm flex items-center gap-2">
                        <span>총 작업 시간</span>
                        {todayAttendance.isWorking && (
                          <span className="text-xs bg-green-600 text-white px-2.5 py-0.5 rounded-full font-medium">
                            진행중
                          </span>
                        )}
                      </span>
                      <span className="text-xl font-bold text-indigo-600">
                        {currentWorkTime}
                      </span>
                    </div>
                    {todayAttendance.isWorking ? (
                      <button 
                        onClick={async () => {
                          if (selectedTeam) {
                            try {
                              // 현재 표시 중인 시간 저장
                              const currentDisplayTime = currentWorkTime;
                              console.log('일 종료 클릭 - 현재 표시 시간:', currentDisplayTime);
                              
                              setSessionStartTime(null); // 타이머 정지
                              console.log('타이머 정지');
                              
                              const result = await attendanceApi.checkOut(selectedTeam);
                              console.log('서버 응답:', result);
                              console.log('서버 workHours:', result.workHours);
                              
                              // 서버 응답의 workHours를 사용하여 표시 시간 업데이트
                              if (result.workHours !== undefined && result.workHours !== null) {
                                const hours = Math.floor(result.workHours);
                                const minutes = Math.floor((result.workHours % 1) * 60);
                                const seconds = Math.floor(((result.workHours % 1) * 60 % 1) * 60);
                                const newTime = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                                console.log('새 시간 설정:', newTime, '(workHours:', result.workHours, ')');
                                setCurrentWorkTime(newTime);
                              } else {
                                console.log('workHours 없음, 현재 시간 유지:', currentDisplayTime);
                                setCurrentWorkTime(currentDisplayTime);
                              }
                              
                              // todayAttendance 업데이트 (isWorking을 false로)
                              console.log('todayAttendance 업데이트 전:', todayAttendance);
                              setTodayAttendance(prev => {
                                const updated = prev ? { ...prev, isWorking: false, workHours: result.workHours } : null;
                                console.log('todayAttendance 업데이트 후:', updated);
                                return updated;
                              });
                              
                              await loadAttendanceList();
                              
                              // Sidebar에 누적 시간 데이터와 함께 이벤트 발생
                              const totalSeconds = Math.floor((result.workHours || 0) * 3600);
                              console.log('Sidebar에 전달할 totalSeconds:', totalSeconds);
                              
                              const event = new CustomEvent('workStatusChanged', {
                                detail: {
                                  totalSeconds: totalSeconds,
                                  isWorking: false
                                }
                              });
                              window.dispatchEvent(event);
                              
                              // localStorage 정리 (약간의 지연 후)
                              setTimeout(() => {
                                localStorage.removeItem('currentWorkingTeam');
                                localStorage.removeItem('sessionStartTime');
                              }, 500);
                            } catch (error) {
                              console.error('일 종료 실패:', error);
                              alert('일 종료에 실패했습니다.');
                            }
                          }
                        }}
                        className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="text-xl">⏹</span>
                        <span>일 종료</span>
                      </button>
                    ) : (
                      <button 
                        onClick={async () => {
                          if (selectedTeam) {
                            try {
                              // 현재 누적 시간 저장
                              const previousWorkHours = todayAttendance.workHours || 0;
                              console.log('일 재시작 클릭 - 이전 누적 시간:', previousWorkHours);
                              
                              // 즉시 타이머 시작 (서버 응답 전)
                              const startTime = new Date();
                              console.log('타이머 시작:', startTime);
                              setSessionStartTime(startTime);
                              
                              // localStorage에 저장
                              localStorage.setItem('currentWorkingTeam', selectedTeam.toString());
                              localStorage.setItem('sessionStartTime', startTime.toISOString());
                              
                              const result = await attendanceApi.checkIn(selectedTeam);
                              console.log('서버 응답:', result);
                              
                              // todayAttendance 업데이트 (이전 workHours 유지)
                              setTodayAttendance(prev => {
                                const updated = prev ? { 
                                  ...prev, 
                                  isWorking: true,
                                  workHours: previousWorkHours, // 이전 누적 시간 유지
                                  currentSessionStart: result.currentSessionStart
                                } : result;
                                console.log('todayAttendance 업데이트:', updated);
                                return updated;
                              });
                              
                              await loadAttendanceList();
                              
                              // Sidebar에 작업 시작 알림 (누적 시간 포함)
                              const totalSeconds = Math.floor(previousWorkHours * 3600);
                              const event = new CustomEvent('workStatusChanged', {
                                detail: {
                                  totalSeconds: totalSeconds,
                                  isWorking: true
                                }
                              });
                              window.dispatchEvent(event);
                            } catch (error) {
                              console.error('일 시작 실패:', error);
                              setSessionStartTime(null); // 실패 시 타이머 정지
                              alert('일 시작에 실패했습니다.');
                            }
                          }
                        }}
                        className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="text-xl">▶</span>
                        <span>{todayAttendance.checkOut ? '일 재시작' : '일 시작'}</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">일 시작</span>
                      <span className="text-lg font-bold text-gray-400">-</span>
                    </div>
                    <button 
                      onClick={async () => {
                        if (selectedTeam) {
                          try {
                            // 즉시 타이머 시작 (서버 응늵 전)
                            const startTime = new Date();
                            console.log('첫 일 시작 버튼 클릭, 타이머 시작:', startTime);
                            setSessionStartTime(startTime);
                            
                            // localStorage에 저장
                            localStorage.setItem('currentWorkingTeam', selectedTeam.toString());
                            localStorage.setItem('sessionStartTime', startTime.toISOString());
                            
                            const result = await attendanceApi.checkIn(selectedTeam);
                            
                            // todayAttendance 설정
                            setTodayAttendance(result);
                            
                            await loadAttendanceList();
                            
                            // Sidebar에 작업 시작 알림
                            const event = new CustomEvent('workStatusChanged', {
                              detail: {
                                totalSeconds: 0, // 첫 시작이므로 0
                                isWorking: true
                              }
                            });
                            window.dispatchEvent(event);
                          } catch (error) {
                            console.error('일 시작 실패:', error);
                            setSessionStartTime(null); // 실패 시 타이머 정지
                            alert('일 시작에 실패했습니다.');
                          }
                        }
                      }}
                      className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">▶</span>
                      <span>일 시작</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
        )}
      </div>

      {/* 연차 관리 모달 */}
      {showLeaveListModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-indigo-100"
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-4xl">✈️</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-1">연차 관리</h3>
                      <p className="text-indigo-100 text-sm">나의 휴가 현황과 신청 내역을 확인하세요</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLeaveListModal(false)}
                    className="text-white hover:bg-white/20 rounded-xl p-2 transition-all hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* 통계 카드 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                    <p className="text-indigo-100 text-sm font-medium mb-1">총 연차</p>
                    <p className="text-3xl font-bold text-white">{leaveStats.totalDays}<span className="text-lg ml-1">일</span></p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                    <p className="text-indigo-100 text-sm font-medium mb-1">사용</p>
                    <p className="text-3xl font-bold text-white">{leaveStats.usedDays}<span className="text-lg ml-1">일</span></p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                    <p className="text-indigo-100 text-sm font-medium mb-1">잔여</p>
                    <p className="text-3xl font-bold text-white">{leaveStats.remainingDays}<span className="text-lg ml-1">일</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* 연차 신청 버튼 */}
            <div className="p-6 border-b border-indigo-100">
              <button
                onClick={() => {
                  setShowLeaveListModal(false);
                  setShowLeaveModal(true);
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform">
                  <span className="text-xl">+</span>
                </div>
                <span className="text-lg">새 연차 신청하기</span>
              </button>
            </div>

            {/* 연차 내역 리스트 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  연차 신청 내역
                </h4>
                <span className="text-sm text-gray-500 font-medium">{leaveHistory.length}건</span>
              </div>
              
              {leaveHistory.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-500 text-sm">아직 신청한 연차가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaveHistory.map((leave, index) => (
                    <motion.div
                      key={leave.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
                        leave.status === 'APPROVED'
                          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-300'
                          : leave.status === 'PENDING'
                          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300'
                          : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              leave.status === 'APPROVED'
                                ? 'bg-emerald-100'
                                : leave.status === 'PENDING'
                                ? 'bg-amber-100'
                                : 'bg-red-100'
                            }`}>
                              <span className="text-xl">
                                {leave.status === 'APPROVED' ? '✅' : leave.status === 'PENDING' ? '⏳' : '❌'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-lg">
                                  {leave.startDate} ~ {leave.endDate}
                                </span>
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  leave.status === 'APPROVED'
                                    ? 'bg-emerald-200 text-emerald-800'
                                    : leave.status === 'PENDING'
                                    ? 'bg-amber-200 text-amber-800'
                                    : 'bg-red-200 text-red-800'
                                }`}>
                                  {leave.days}일
                                </span>
                              </div>
                              {leave.reason && (
                                <p className="text-sm text-gray-600 mt-1">{leave.reason}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                            leave.status === 'APPROVED'
                              ? 'bg-emerald-500 text-white'
                              : leave.status === 'PENDING'
                              ? 'bg-amber-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {leave.status === 'APPROVED'
                            ? '✓ 승인됨'
                            : leave.status === 'PENDING'
                            ? '⏱ 대기중'
                            : '✗ 거절됨'}
                        </span>
                      </div>
                    </motion.div>
                ))}
              </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* 연차 신청 모달 */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-indigo-100"
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-4xl">🌴</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">연차 신청</h3>
                <p className="text-indigo-100 text-sm">휴가 일정을 선택하고 신청하세요</p>
              </div>
            </div>

            {/* 콘텐츠 */}
            <div className="p-8 space-y-6">
              {/* 연차 현황 */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">연차 현황</span>
                  <span className="text-xs text-indigo-600 font-medium">{new Date().getFullYear()}년</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">총 연차</p>
                    <p className="text-2xl font-bold text-gray-800">{leaveStats.totalDays}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">사용</p>
                    <p className="text-2xl font-bold text-indigo-600">{leaveStats.usedDays}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">잔여</p>
                    <p className="text-2xl font-bold text-emerald-600">{leaveStats.remainingDays}</p>
                  </div>
                </div>
              </div>

              {/* 연차 종류 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  휴가 종류
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setLeaveType('ANNUAL')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      leaveType === 'ANNUAL'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-indigo-200 text-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🌴</div>
                    <div className="text-xs font-semibold">연차</div>
                  </button>
                  <button
                    onClick={() => setLeaveType('HALF_AM')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      leaveType === 'HALF_AM'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-indigo-200 text-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🌅</div>
                    <div className="text-xs font-semibold">오전반차</div>
                  </button>
                  <button
                    onClick={() => setLeaveType('HALF_PM')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      leaveType === 'HALF_PM'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-indigo-200 text-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🌆</div>
                    <div className="text-xs font-semibold">오후반차</div>
                  </button>
                </div>
              </div>

              {/* 날짜 선택 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <span>📅</span> 시작일
                  </label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <span>📅</span> 종료일
                  </label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* 사유 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <span>📝</span> 사유
                </label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                  placeholder="휴가 사유를 입력하세요 (선택사항)"
                ></textarea>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowLeaveModal(false);
                    setLeaveStartDate('');
                    setLeaveEndDate('');
                    setLeaveReason('');
                    setLeaveType('ANNUAL');
                  }}
                  className="flex-1 px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    if (!leaveStartDate || !leaveEndDate) {
                      alert('날짜를 선택해주세요.');
                      return;
                    }
                    if (!selectedTeam) {
                      alert('팀을 선택해주세요.');
                      return;
                    }
                    
                    try {
                      await attendanceApi.applyLeave(
                        selectedTeam,
                        leaveStartDate,
                        leaveEndDate,
                        leaveReason || '개인 사유'
                      );
                      
                      alert('연차 신청이 완료되었습니다! 🎉');
                      
                      // 폼 초기화
                      setShowLeaveModal(false);
                      setLeaveStartDate('');
                      setLeaveEndDate('');
                      setLeaveReason('');
                      setLeaveType('ANNUAL');
                      
                      // 연차 내역 및 통계 새로고침
                      loadTeamMemberData();
                    } catch (error) {
                      console.error('연차 신청 실패:', error);
                      alert('연차 신청에 실패했습니다. 다시 시도해주세요.');
                    }
                  }}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <span>✨</span> 신청하기
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
