import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TeamDropdown from './TeamDropdown';
import CreateTeamModal from './CreateTeamModal';
import type { Team } from '../types/team.types';
import { teamApi } from '../../api/teamApi';
import { projectApi } from '../../api/projectApi';
import { logout as logoutApi } from '../../auth/api/authApi';
import { attendanceApi } from '../../api/attendanceApi';
import { hrApi } from '../../api/hrApi';

interface SidebarItem {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  /** 사이드바 접기/펼치기 상태 */
  collapsed?: boolean;
  /** 사이드바 접기/펼치기 토글 함수 */
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed = false, 
  onToggleCollapse 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 사용자 정보
  const [userNickname, setUserNickname] = useState<string>('');
  
  // 팀 데이터 상태
  const [teams, setTeams] = useState<Team[]>([]);
  const [, setIsLoadingTeams] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  
  // 오늘의 총 작업 시간
  const [totalWorkTime, setTotalWorkTime] = useState<string>('0:00:00');
  const [baseSeconds, setBaseSeconds] = useState<number>(0);
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);

  // 팀 목록 조회
  const fetchTeams = async () => {
    console.log('[Sidebar] 팀 목록 조회 시작');
    try {
      setIsLoadingTeams(true);
      console.log('[Sidebar] teamApi.getTeamList() 호출');
      const response = await teamApi.getTeamList();
      console.log('[Sidebar] 팀 목록 응답:', response);
      console.log('[Sidebar] response.teams:', response.teams);
      
      // 각 팀의 프로젝트 목록도 함께 조회
      const teamsWithProjects = await Promise.all(
        response.teams.map(async (team) => {
          console.log(`[Sidebar] 팀 ${team.id}의 프로젝트 조회 시작`);
          try {
            const projectsResponse = await projectApi.getTeamProjects(team.id);
            console.log(`[Sidebar] 팀 ${team.id}의 프로젝트 응답:`, projectsResponse);
            const projects = projectsResponse.projectList.map((p: any) => ({
              id: p.id,
              name: p.title,
            }));
            console.log(`[Sidebar] 팀 ${team.id}의 프로젝트:`, projects);
            return { ...team, projects };
          } catch (error: any) {
            console.error(`[Sidebar] 팀 ${team.id}의 프로젝트 조회 실패:`, error);
            console.error(`[Sidebar] 에러 상세:`, error.response?.data);
            // 에러 발생 시 빈 프로젝트 배열로 반환
            return { ...team, projects: [] };
          }
        })
      );
      
      console.log('[Sidebar] 최종 팀 목록:', teamsWithProjects);
      setTeams(teamsWithProjects);
    } catch (error) {
      console.error('[Sidebar] 팀 목록 조회 실패:', error);
      console.error('[Sidebar] 에러 상세:', error);
      setTeams([]);
    } finally {
      setIsLoadingTeams(false);
      console.log('[Sidebar] 팀 목록 조회 완료');
    }
  };

  // 총 작업 시간 로드
  const loadTotalWorkTime = async (eventData?: { totalSeconds?: number; isWorking?: boolean }) => {
    try {
      console.log('[Sidebar] 총 작업 시간 로드 시작', eventData);
      
      // 이벤트에서 데이터가 전달되면 그것을 사용, 아니면 서버에서 가져옴
      let totalSeconds: number;
      let working: boolean;
      
      if (eventData && eventData.totalSeconds !== undefined) {
        console.log('[Sidebar] 이벤트에서 받은 데이터 사용');
        totalSeconds = eventData.totalSeconds;
        working = eventData.isWorking !== undefined ? eventData.isWorking : false;
        setBaseSeconds(totalSeconds);
        setIsWorking(working);
        setWorkStartTime(null);
      } else {
        console.log('[Sidebar] 서버에서 데이터 조회');
        const data = await attendanceApi.getTodayTotalWorkTime();
        console.log('[Sidebar] 서버에서 받은 totalSeconds:', data.totalSeconds);
        totalSeconds = data.totalSeconds;
        setBaseSeconds(totalSeconds);
        
        // 현재 작업 중인지 확인 (localStorage에서)
        const workingTeamId = localStorage.getItem('currentWorkingTeam');
        const sessionStart = localStorage.getItem('sessionStartTime');
        
        console.log('[Sidebar] localStorage - workingTeamId:', workingTeamId, 'sessionStart:', sessionStart);
        
        if (workingTeamId && sessionStart) {
          setIsWorking(true);
          setWorkStartTime(new Date(sessionStart));
          console.log('[Sidebar] 작업 중 상태로 설정');
        } else {
          setIsWorking(false);
          setWorkStartTime(null);
          console.log('[Sidebar] 작업 중지 상태로 설정');
        }
      }
    } catch (error) {
      console.error('[Sidebar] 총 작업 시간 로드 실패:', error);
    }
  };
  
  // 실시간 타이머
  useEffect(() => {
    const calculateTime = () => {
      let totalSeconds = baseSeconds;
      
      if (isWorking && workStartTime) {
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - workStartTime.getTime()) / 1000);
        totalSeconds += elapsedSeconds;
      }
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTotalWorkTime(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    
    calculateTime();
    
    if (isWorking) {
      const interval = setInterval(calculateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [baseSeconds, isWorking, workStartTime]);

  useEffect(() => {
    fetchTeams();
    // localStorage에서 사용자 닉네임 가져오기
    const nickname = localStorage.getItem('nickname') || 'Guest';
    setUserNickname(nickname);
    
    // 총 작업 시간 로드
    loadTotalWorkTime();
    
    // 10초마다 총 작업 시간 업데이트 (작업 중일 때만)
    const interval = setInterval(() => {
      // 작업 중일 때만 서버에서 업데이트
      const workingTeamId = localStorage.getItem('currentWorkingTeam');
      if (workingTeamId) {
        loadTotalWorkTime();
      }
    }, 10000);
    
    // 작업 상태 변경 이벤트 리스너
    const handleWorkStatusChange = (event: Event) => {
      console.log('[Sidebar] 작업 상태 변경 감지');
      const customEvent = event as CustomEvent;
      loadTotalWorkTime(customEvent.detail);
    };
    
    // 팀/프로젝트 생성 이벤트 리스너
    const handleTeamCreated = () => {
      console.log('[Sidebar] 팀/프로젝트 생성 감지 - 팀 목록 새로고침');
      fetchTeams();
    };
    
    // 팀 삭제 이벤트 리스너
    const handleTeamDeleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { teamId } = customEvent.detail;
      console.log('[Sidebar] 팀 삭제 감지 - teamId:', teamId);
      setTeams(prev => prev.filter(team => team.id !== teamId));
    };
    
    window.addEventListener('workStatusChanged', handleWorkStatusChange);
    window.addEventListener('teamCreated', handleTeamCreated);
    window.addEventListener('projectCreated', handleTeamCreated);
    window.addEventListener('boardCreated', handleTeamCreated);
    window.addEventListener('teamDeleted', handleTeamDeleted);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('workStatusChanged', handleWorkStatusChange);
      window.removeEventListener('teamCreated', handleTeamCreated);
      window.removeEventListener('projectCreated', handleTeamCreated);
      window.removeEventListener('boardCreated', handleTeamCreated);
      window.removeEventListener('teamDeleted', handleTeamDeleted);
    };
  }, []);

  const handleTeamSelect = (teamId: number) => {
    console.log('팀 선택:', teamId);
    navigate(`/team/${teamId}`);
  };

  const handleProjectSelect = (teamId: number, projectId: number) => {
    console.log('프로젝트 선택:', teamId, projectId);
    navigate(`/agile/project/${projectId}`);
  };

  const handleCreateTeam = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateTeamSubmit = async (teamName: string) => {
    try {
      setIsCreatingTeam(true);
      
      // hrApi를 직접 호출하여 TeamResponse 받기
      const response = await hrApi.createTeam({ name: teamName });
      console.log('팀 생성 응답:', response);
      
      setIsCreateModalOpen(false);
      
      // 약간의 지연 후 전체 팀 목록 다시 조회 (서버 커밋 확실히 대기)
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchTeams();
      console.log('팀 목록 새로고침 완료');
    } catch (error: any) {
      console.error('팀 생성 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '팀 생성에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleLogout = async () => {
    try {
      // 백엔드 로그아웃 API 호출
      const success = await logoutApi();
      
      if (success) {
        console.log('✅ 로그아웃 성공');
      } else {
        console.warn('⚠️ 로그아웃 API 호출 실패, 로컬 데이터만 삭제');
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    } finally {
      // API 성공 여부와 관계없이 로컬 데이터 정리
      localStorage.removeItem('userToken');
      localStorage.removeItem('nickname');
      localStorage.removeItem('isLoggedIn');
      
      // 로그인 페이지로 이동
      navigate('/auth/login');
    }
  };
  
  // 네비게이션 아이템 정의
  const navItems: SidebarItem[] = [
    {
      id: 'dashboard',
      title: '대시보드',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    },
    {
      id: 'agile',
      title: '애자일 보드',
      path: '/agile/projects',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'settings',
      title: '나의 일정',
      path: '/meeting',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'community',
      title: '나의 작업',
      path: '/workspace',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'attendance',
      title: '근태 관리',
      path: '/attendance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/30 backdrop-blur-xl flex flex-col h-screen transition-all duration-300 shadow-xl border-r border-indigo-100/50 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* 로고 및 사용자 정보 섹션 */}
      <div className={`${collapsed ? 'px-2' : 'px-5'} py-5 mb-2`}>
        {/* 로고 */}
        <motion.div 
          className={`flex items-center ${collapsed ? 'justify-center' : ''}`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <span className="text-white font-bold text-base">C</span>
          </div>
          {!collapsed && (
            <span className="ml-3 text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">CoreSync</span>
          )}
        </motion.div>
        
        {/* 사용자 정보 카드 */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1 }}
              className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-indigo-100/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                {/* 프로필 아바타 */}
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md"
                  >
                    <span className="text-white font-bold text-sm">
                      {userNickname.charAt(0).toUpperCase()}
                    </span>
                  </motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm"
                  ></motion.div>
                </div>
              
                {/* 사용자 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {userNickname}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <motion.span 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5"
                    ></motion.span>
                    활동 중
                  </p>
                </div>
              </div>
              
              {/* 오늘의 총 작업 시간 */}
              <div className="mt-3 pt-3 border-t border-indigo-100/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">오늘 작업 시간</span>
                  <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{totalWorkTime}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* collapsed 상태일 때 작은 아바타만 표시 */}
        <AnimatePresence>
          {collapsed && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-4 flex justify-center"
            >
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-2 ring-white hover:ring-indigo-200 transition-all duration-300"
                >
                  <span className="text-white font-bold text-xs">
                    {userNickname.charAt(0).toUpperCase()}
                  </span>
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm"
                ></motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-3 py-3">
        <ul className="space-y-1.5">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <motion.li 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center ${
                    collapsed ? 'justify-center' : 'justify-between'
                  } px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:bg-white/60 hover:shadow-md'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="flex items-center relative z-10">
                    <motion.span 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'} transition-colors duration-200 w-5 h-5`}
                    >
                      {item.icon}
                    </motion.span>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span 
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -5 }}
                          className={`ml-3 text-sm font-semibold ${isActive ? 'text-indigo-600' : 'text-gray-700 group-hover:text-gray-900'}`}
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {!collapsed && item.badge && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 text-xs font-bold rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md relative z-10"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </Link>
              </motion.li>
            );
          })}
          
          {/* 팀 드롭다운 */}
          <li>
            <TeamDropdown
              collapsed={collapsed}
              teams={teams}
              onTeamSelect={handleTeamSelect}
              onProjectSelect={handleProjectSelect}
              onCreateTeam={handleCreateTeam}
            />
          </li>
        </ul>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-auto border-t border-indigo-100/50 pt-4 pb-3 bg-gradient-to-t from-white/50 to-transparent backdrop-blur-sm"
      >
        {/* 로그아웃 버튼 */}
        <div className={`${collapsed ? 'px-2' : 'px-4'} mb-3`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center' : 'justify-start'
            } px-3 py-2.5 rounded-xl text-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200 group hover:shadow-lg border border-transparent hover:border-red-200`}
          >
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              whileHover={{ scale: 1.1, rotate: 6 }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </motion.svg>
            <AnimatePresence>
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="ml-3 text-sm font-bold"
                >
                  로그아웃
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* 작업 시간 */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-4 py-3 mx-3 mb-2 rounded-xl bg-white/60 backdrop-blur-sm border border-indigo-100/50 shadow-sm"
            >
              <div className="flex items-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white mr-3 shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <div>
                  <div className="text-xs font-medium text-gray-600">작업 시간</div>
                  <div className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{totalWorkTime}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed ? (
          <div className="flex justify-center mt-1">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleCollapse}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        ) : (
          <div className="px-4 mt-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggleCollapse}
              className="flex items-center justify-center w-full py-2 text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              <span>사이드바 접기</span>
            </motion.button>
          </div>
        )}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="border-t border-indigo-100/50 py-3 px-4 bg-white/40 backdrop-blur-sm"
      >
        <Link to="/profile" className={`flex items-center text-gray-600 hover:text-indigo-600 transition-all duration-200 ${
          collapsed ? 'justify-center' : ''
        } px-2 py-2 rounded-lg hover:bg-indigo-50`}>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mr-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                className="text-xs font-semibold"
              >
                마이페이지
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </motion.div>

      {/* 팀 생성 모달 */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTeamSubmit}
        isLoading={isCreatingTeam}
      />
    </motion.div>
  );
};

export default Sidebar;
