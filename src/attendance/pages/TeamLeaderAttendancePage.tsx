import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { hrApi, type TeamResponse, type TeamMemberResponse } from '../../api/hrApi';
import { attendanceApi, type AttendanceRecord, type AnnualLeave } from '../../api/attendanceApi';

const TeamLeaderAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastCheckedTeam = useRef<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([]);
  const [memberNicknames, setMemberNicknames] = useState<Map<number, string>>(new Map());
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [teamLeaveList, setTeamLeaveList] = useState<AnnualLeave[]>([]);
  const [memberAttendanceList, setMemberAttendanceList] = useState<AttendanceRecord[]>([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<AnnualLeave | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
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

  // 선택한 팀원이 변경되면 근태 목록 로드
  useEffect(() => {
    if (selectedTeam && selectedMember) {
      loadMemberAttendance();
    }
  }, [selectedTeam, selectedMember, currentDate]);

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
    
    // localStorage에서 작업 상태 복원 (페이지 새로고침 대응)
    const workingTeamId = localStorage.getItem('currentWorkingTeam');
    const sessionStart = localStorage.getItem('sessionStartTime');
    
    if (workingTeamId && sessionStart && selectedTeam && workingTeamId === selectedTeam.toString()) {
      console.log('localStorage에서 작업 상태 복원 - sessionStart:', sessionStart);
      setSessionStartTime(new Date(sessionStart));
    } else if (todayAttendance.isWorking && todayAttendance.currentSessionStart) {
      // localStorage에 없으면 서버 데이터로 복원
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
      
      // localStorage에도 저장
      localStorage.setItem('currentWorkingTeam', selectedTeam?.toString() || '');
      localStorage.setItem('sessionStartTime', sessionStart.toISOString());
    }
  }, [todayAttendance, selectedTeam]);
  
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
      
      if (!isLeader) {
        // 팀장이 아니면 일반 페이지로 리다이렉트
        console.log('팀장이 아닙니다. 일반 근태 페이지로 이동합니다.');
        navigate('/attendance', { replace: true, state: { selectedTeam } });
        return;
      }
      
      // 팀장이면 데이터 로드
      loadTeamData();
    } catch (error) {
      console.error('팀장 여부 확인 실패:', error);
      // 오류 발생 시 일반 페이지로 리다이렉트
      navigate('/attendance', { replace: true });
    }
  };
  
  const loadTeamData = async () => {
    if (!selectedTeam) return;

    try {
      // 팀 멤버 목록 로드
      const members = await hrApi.getTeamMembers(selectedTeam);
      setTeamMembers(members);
      if (members.length > 0) {
        setSelectedMember(members[0].accountId);
      }

      // 팀원 닉네임 로드
      const nicknameMap = new Map<number, string>();
      const token = localStorage.getItem('userToken');
      
      await Promise.all(
        members.map(async (member) => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_ACCOUNT_API_URL || 'http://localhost:8001'}/api/account-profile/${member.accountId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            nicknameMap.set(member.accountId, response.data.nickname || `팀원 #${member.accountId}`);
          } catch (error) {
            console.error(`멤버 ${member.accountId} 정보 조회 실패:`, error);
            nicknameMap.set(member.accountId, `팀원 #${member.accountId}`);
          }
        })
      );
      
      setMemberNicknames(nicknameMap);
      console.log('멤버 닉네임 로드 완료:', nicknameMap);

      // 팀 전체 연차 신청 목록 로드
      console.log('연차 목록 조회 시작 - teamId:', selectedTeam);
      try {
        const leaves = await attendanceApi.getTeamLeaveList(selectedTeam);
        console.log('연차 목록 조회 결과:', leaves);
        console.log('연차 목록 개수:', leaves.length);
        setTeamLeaveList(leaves);
      } catch (leaveError) {
        console.error('연차 목록 조회 실패:', leaveError);
        console.error('에러 상세:', leaveError);
        // 연차 조회 실패해도 다른 데이터는 로드되도록 빈 배열 설정
        setTeamLeaveList([]);
      }

      // 오늘의 근태 로드
      try {
        const today = await attendanceApi.getTodayAttendance(selectedTeam);
        console.log('서버에서 받은 오늘의 근태:', today);
        setTodayAttendance(today);
      } catch (error) {
        console.error('오늘의 근태 로드 실패:', error);
      }
    } catch (error) {
      console.error('팀 데이터 로드 실패:', error);
    }
  };

  const loadMemberAttendance = async () => {
    if (!selectedTeam || !selectedMember) return;

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const list = await attendanceApi.getMemberAttendanceList(selectedTeam, selectedMember, year, month);
      setMemberAttendanceList(list);
    } catch (error) {
      console.error('팀원 근태 목록 로드 실패:', error);
    }
  };

  const handleApproveLeave = async (leaveId: number, approved: boolean) => {
    try {
      await attendanceApi.approveLeave(leaveId, approved);
      alert(approved ? '연차가 승인되었습니다.' : '연차가 거절되었습니다.');
      loadTeamData();
      setShowLeaveModal(false);
      setSelectedLeave(null);
    } catch (error) {
      console.error('연차 승인/거절 실패:', error);
      alert('연차 처리에 실패했습니다.');
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return '-';
    const parts = timeStr.split(':');
    return `${parts[0]}:${parts[1]}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'PRESENT': { text: '출근', color: 'bg-green-100 text-green-800' },
      'ABSENT': { text: '결근', color: 'bg-red-100 text-red-800' },
      'LEAVE': { text: '연차', color: 'bg-blue-100 text-blue-800' },
      'HOLIDAY': { text: '휴일', color: 'bg-gray-100 text-gray-800' },
    };
    const info = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${info.color}`}>
        {info.text}
      </span>
    );
  };

  const getLeaveStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'PENDING': { text: '대기중', color: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { text: '승인됨', color: 'bg-green-100 text-green-800' },
      'REJECTED': { text: '거절됨', color: 'bg-red-100 text-red-800' },
    };
    const info = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${info.color}`}>
        {info.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

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
                    👨‍💼
                  </div>
                  팀장 근태 관리
                </h1>
                <p className="text-gray-600 text-sm">팀원들의 근태와 연차 신청을 관리하세요 ✨</p>
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
          <div className="space-y-6">
            {/* 상단: 선택한 팀원의 근태 목록 (크게) */}
            <div>
              {!showAttendanceModal && (
                <motion.div
                  layoutId="attendance-modal"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => {
                    console.log('박스 클릭됨!', memberAttendanceList.length);
                    setShowAttendanceModal(true);
                  }}
                  className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer hover:shadow-2xl hover:border-2 hover:border-indigo-300 transition-all duration-300"
                >
                {/* 월 선택 헤더 */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      previousMonth();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-2xl z-10"
                  >
                    ‹
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 근태 기록
                  </h2>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextMonth();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-2xl z-10"
                  >
                    ›
                  </button>
                </div>


                {/* 근태 목록 미리보기 */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pointer-events-none">
                  {memberAttendanceList.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      근태 기록이 없습니다
                    </div>
                  ) : (
                    memberAttendanceList.slice(0, 8).map((attendance) => (
                      <div
                        key={attendance.id}
                        className="p-3 bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">{attendance.date}</span>
                          {getStatusBadge(attendance.status)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatTime(attendance.checkIn)} ~ {formatTime(attendance.checkOut)}
                          {attendance.workHours && ` (${attendance.workHours.toFixed(1)}h)`}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 더보기 표시 */}
                {memberAttendanceList.length > 8 && (
                  <div className="mt-4 text-center text-sm text-gray-500 pointer-events-none">
                    +{memberAttendanceList.length - 8}개 더보기
                  </div>
                )}
                </motion.div>
              )}
            </div>

            {/* 하단: 2컬럼 레이아웃 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 왼쪽 컬럼: 팀원 목록 + 연차 신청 관리 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 팀원 목록 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-6"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                    팀원 목록
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedMember(member.accountId)}
                        className={`p-3.5 rounded-lg text-left transition-all ${
                          selectedMember === member.accountId
                            ? 'bg-indigo-50 border-2 border-indigo-500'
                            : 'bg-white hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {memberNicknames.get(member.accountId) || `팀원 #${member.accountId}`}
                            </p>
                            <p className="text-xs text-gray-600">
                              {member.role === 'LEADER' ? '팀장' : '팀원'}
                            </p>
                          </div>
                          {selectedMember === member.accountId && (
                            <span className="text-indigo-600">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* 연차 신청 관리 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-6"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
                    연차 신청 관리
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamLeaveList.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-gray-500 text-sm">연차 신청 내역이 없습니다</p>
                      </div>
                    ) : (
                      teamLeaveList.map((leave) => (
                        <div
                          key={leave.id}
                          className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => {
                            setSelectedLeave(leave);
                            setShowLeaveModal(true);
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-gray-900">
                              {memberNicknames.get(leave.accountId) || `팀원 #${leave.accountId}`}
                            </span>
                            {getLeaveStatusBadge(leave.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {leave.startDate} ~ {leave.endDate} ({leave.days}일)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{leave.reason}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>

              {/* 오른쪽 컬럼: 오늘의 근무 */}
              <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
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
                                const currentDisplayTime = currentWorkTime;
                                console.log('일 종료 클릭 - 현재 표시 시간:', currentDisplayTime);
                                
                                setSessionStartTime(null);
                                console.log('타이머 정지');
                                
                                const result = await attendanceApi.checkOut(selectedTeam);
                                console.log('서버 응답:', result);
                                
                                localStorage.removeItem('currentWorkingTeam');
                                localStorage.removeItem('sessionStartTime');
                                
                                // 사이드바에 업데이트된 총 작업 시간 전달
                                const totalSeconds = result.workHours ? Math.floor(result.workHours * 3600) : 0;
                                window.dispatchEvent(new CustomEvent('workStatusChanged', { 
                                  detail: { totalSeconds, isWorking: false } 
                                }));
                                
                                if (result.workHours !== undefined && result.workHours !== null) {
                                  const hours = Math.floor(result.workHours);
                                  const minutes = Math.floor((result.workHours % 1) * 60);
                                  const seconds = Math.floor(((result.workHours % 1) * 60 % 1) * 60);
                                  const newTime = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                                  console.log('새 시간 설정:', newTime);
                                  setCurrentWorkTime(newTime);
                                } else {
                                  console.log('현재 시간 유지:', currentDisplayTime);
                                  setCurrentWorkTime(currentDisplayTime);
                                }
                                
                                setTodayAttendance(prev => {
                                  const updated = prev ? { ...prev, isWorking: false, workHours: result.workHours } : null;
                                  return updated;
                                });
                                
                                await loadMemberAttendance();
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
                                const previousWorkHours = todayAttendance.workHours || 0;
                                console.log('일 재시작 클릭 - 이전 누적 시간:', previousWorkHours);
                                
                                const startTime = new Date();
                                console.log('타이머 시작:', startTime);
                                setSessionStartTime(startTime);
                                
                                localStorage.setItem('currentWorkingTeam', selectedTeam.toString());
                                localStorage.setItem('sessionStartTime', startTime.toISOString());
                                
                                const result = await attendanceApi.checkIn(selectedTeam);
                                console.log('서버 응답:', result);
                                
                                // 사이드바에 현재 누적 시간과 작업 중 상태 전달
                                const totalSeconds = previousWorkHours * 3600;
                                window.dispatchEvent(new CustomEvent('workStatusChanged', { 
                                  detail: { totalSeconds, isWorking: true } 
                                }));
                                
                                setTodayAttendance(prev => {
                                  const updated = prev ? { 
                                    ...prev, 
                                    isWorking: true,
                                    workHours: previousWorkHours,
                                    currentSessionStart: result.currentSessionStart
                                  } : result;
                                  return updated;
                                });
                                
                                await loadMemberAttendance();
                              } catch (error) {
                                console.error('일 시작 실패:', error);
                                setSessionStartTime(null);
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
                              const startTime = new Date();
                              console.log('첫 일 시작 버튼 클릭, 타이머 시작:', startTime);
                              setSessionStartTime(startTime);
                              
                              localStorage.setItem('currentWorkingTeam', selectedTeam.toString());
                              localStorage.setItem('sessionStartTime', startTime.toISOString());
                              
                              const result = await attendanceApi.checkIn(selectedTeam);
                              
                              // 사이드바에 작업 시작 알림 (0초부터 시작)
                              window.dispatchEvent(new CustomEvent('workStatusChanged', { 
                                detail: { totalSeconds: 0, isWorking: true } 
                              }));
                              
                              setTodayAttendance(result);
                              
                              await loadMemberAttendance();
                            } catch (error) {
                              console.error('일 시작 실패:', error);
                              setSessionStartTime(null);
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

            {/* 연차 달력 - 맨 아래 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
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
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
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
                {(() => {
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
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
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="p-2"></div>);
                  }

                  // 날짜
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const leavesOnThisDay = teamLeaveList.filter(leave => {
                      const start = new Date(leave.startDate);
                      const end = new Date(leave.endDate);
                      const current = new Date(dateStr);
                      return current >= start && current <= end;
                    });

                    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                    days.push(
                      <motion.div
                        key={day}
                        whileHover={{ scale: 1.05 }}
                        className={`p-2 min-h-[80px] border-2 rounded-lg cursor-pointer transition-all ${
                          leavesOnThisDay.length > 0
                            ? 'bg-amber-50 border-amber-300'
                            : 'bg-white border-gray-200'
                        } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                            {day}
                          </span>
                          {leavesOnThisDay.length > 0 && <span>✈️</span>}
                        </div>
                        {leavesOnThisDay.length > 0 && (
                          <div className="text-xs text-amber-700 font-medium space-y-0.5">
                            {leavesOnThisDay.map((leave, idx) => (
                              <div key={idx}>
                                {memberNicknames.get(leave.accountId) || `팀원 #${leave.accountId}`}
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  }

                  return days;
                })()}
              </div>

              {/* 범례 */}
              <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <span>✈️</span>
                  <span className="text-sm text-gray-600">연차</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* 연차 승인/거절 모달 */}
      {showLeaveModal && selectedLeave && (
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
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-4xl">📋</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">연차 신청 상세</h3>
                    <p className="text-indigo-100 text-sm">신청 내용을 확인하고 승인/거절하세요</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowLeaveModal(false);
                    setSelectedLeave(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-xl p-2 transition-all hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 콘텐츠 */}
            <div className="p-8 space-y-6">
              {/* 신청자 */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">신청자</p>
                    <p className="text-lg font-bold text-gray-900">
                      {memberNicknames.get(selectedLeave.accountId) || `팀원 #${selectedLeave.accountId}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* 기간 */}
              <div className="bg-white rounded-2xl p-5 border-2 border-indigo-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📅</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-2">휴가 기간</p>
                    <p className="text-xl font-bold text-gray-900 mb-1">
                      {selectedLeave.startDate} ~ {selectedLeave.endDate}
                    </p>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                      <span className="text-sm font-bold text-indigo-700">{selectedLeave.days}일</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 사유 */}
              <div className="bg-white rounded-2xl p-5 border-2 border-indigo-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📝</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-2">신청 사유</p>
                    <p className="text-gray-800 leading-relaxed">{selectedLeave.reason || '사유 없음'}</p>
                  </div>
                </div>
              </div>

              {/* 상태 */}
              <div className="bg-white rounded-2xl p-5 border-2 border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">
                      {selectedLeave.status === 'APPROVED' ? '✅' : selectedLeave.status === 'PENDING' ? '⏳' : '❌'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-2">처리 상태</p>
                    {getLeaveStatusBadge(selectedLeave.status)}
                  </div>
                </div>
              </div>

              {/* 승인/거절 버튼 */}
              {selectedLeave.status === 'PENDING' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleApproveLeave(selectedLeave.id, false)}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:shadow-xl hover:scale-105 transition-all font-bold text-lg flex items-center justify-center gap-2"
                  >
                    <span>❌</span> 거절
                  </button>
                  <button
                    onClick={() => handleApproveLeave(selectedLeave.id, true)}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:shadow-xl hover:scale-105 transition-all font-bold text-lg flex items-center justify-center gap-2"
                  >
                    <span>✅</span> 승인
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* 근태 기록 전체보기 모달 */}
      {showAttendanceModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAttendanceModal(false)}
        >
          <motion.div
            layoutId="attendance-modal"
            onClick={(e) => e.stopPropagation()}
            className="w-full h-[85vh] max-w-6xl bg-white rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* 헤더 */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {memberNicknames.get(selectedMember!) || `팀원 #${selectedMember}`}의 근태 기록
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                  </p>
                </div>
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 콘텐츠 */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* 통계 요약 */}
                {memberAttendanceList.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">총 근무일</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {memberAttendanceList.filter(a => a.status === 'PRESENT').length}일
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">총 근무시간</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {memberAttendanceList
                          .reduce((sum, a) => sum + (a.workHours || 0), 0)
                          .toFixed(1)}h
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">평균 근무시간</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {(memberAttendanceList
                          .reduce((sum, a) => sum + (a.workHours || 0), 0) /
                          Math.max(memberAttendanceList.filter(a => a.workHours).length, 1))
                          .toFixed(1)}h
                      </div>
                    </div>
                  </div>
                )}

                {/* 테이블 */}
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">날짜</th>
                          <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">상태</th>
                          <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">출근</th>
                          <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">퇴근</th>
                          <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">근무시간</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberAttendanceList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-16 text-gray-400">
                              <div className="text-5xl mb-3">📭</div>
                              <div className="text-base">근태 기록이 없습니다</div>
                            </td>
                          </tr>
                        ) : (
                          memberAttendanceList.map((attendance) => (
                            <tr
                              key={attendance.id}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-4 px-6 text-gray-900 font-medium">{attendance.date}</td>
                              <td className="py-4 px-6">{getStatusBadge(attendance.status)}</td>
                              <td className="py-4 px-6 text-gray-600">{formatTime(attendance.checkIn)}</td>
                              <td className="py-4 px-6 text-gray-600">{formatTime(attendance.checkOut)}</td>
                              <td className="py-4 px-6 text-gray-900 font-semibold">
                                {attendance.workHours ? `${attendance.workHours.toFixed(1)}h` : '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TeamLeaderAttendancePage;
