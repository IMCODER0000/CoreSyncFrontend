import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
      
      // 생성된 팀을 즉시 목록에 추가
      const newTeam = {
        id: response.id,
        name: response.name,
        projects: []
      };
      
      setTeams(prev => [...prev, newTeam]);
      console.log('팀 목록에 즉시 추가:', newTeam);
      
      setIsCreateModalOpen(false);
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
    <div 
      className={`bg-white flex flex-col h-screen transition-all duration-300 shadow-sm border-r border-gray-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* 로고 및 사용자 정보 섹션 */}
      <div className={`${collapsed ? 'px-2' : 'px-5'} py-5 mb-2`}>
        {/* 로고 */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-lg bg-[#5b7cdb] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-base">C</span>
          </div>
          {!collapsed && (
            <span className="ml-3 text-base font-bold text-gray-800">CoreSync</span>
          )}
        </div>
        
        {/* 사용자 정보 카드 */}
        {!collapsed && (
          <div className="mt-4 p-3.5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              {/* 프로필 아바타 */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#5b7cdb] flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {userNickname.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#52c17c] rounded-full border-2 border-white"></div>
              </div>
              
              {/* 사용자 정보 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {userNickname}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <span className="w-1.5 h-1.5 bg-[#52c17c] rounded-full mr-1.5"></span>
                  활동 중
                </p>
              </div>
            </div>
            
            {/* 오늘의 총 작업 시간 */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">오늘 작업 시간</span>
                <span className="text-sm font-semibold text-[#5b7cdb]">{totalWorkTime}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* collapsed 상태일 때 작은 아바타만 표시 */}
        {collapsed && (
          <div className="mt-4 flex justify-center">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-lg ring-2 ring-white hover:ring-indigo-200 transition-all duration-300">
                <span className="text-white font-bold text-xs">
                  {userNickname.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center ${
                    collapsed ? 'justify-center' : 'justify-between'
                  } px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                    isActive
                      ? 'bg-[#5b7cdb]/10 text-[#5b7cdb]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`${isActive ? 'text-[#5b7cdb]' : 'text-gray-400 group-hover:text-gray-600'} transition-colors duration-150 w-5 h-5`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className={`ml-3 text-sm font-medium ${isActive ? 'text-[#5b7cdb]' : 'text-gray-700 group-hover:text-gray-900'}`}>{item.title}</span>
                    )}
                  </div>
                  
                  {!collapsed && item.badge && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-5 px-1.5 text-xs font-semibold rounded-full bg-[#5b7cdb] text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
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

      <div className="mt-auto border-t border-gray-100/80 pt-4 pb-3">
        {/* 로그아웃 버튼 */}
        <div className={`${collapsed ? 'px-2' : 'px-4'} mb-3`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center' : 'justify-start'
            } px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group hover:shadow-sm`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
            {!collapsed && (
              <span className="ml-3 text-sm font-semibold">로그아웃</span>
            )}
          </button>
        </div>

        {/* 작업 시간 */}
        <div className="px-4 py-2 flex items-center">
          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mr-3 ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <div className="text-xs text-gray-500">작업 시간</div>
              <div className="text-sm font-bold text-gray-800">00:05:09</div>
            </div>
          )}
        </div>
        
        {collapsed ? (
          <div className="flex justify-center mt-1">
            <button 
              onClick={onToggleCollapse}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="px-4 mt-1">
            <button 
              onClick={onToggleCollapse}
              className="flex items-center justify-center w-full py-1 text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              <span>사이드바 접기</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-100 py-2 px-4">
        <Link to="/profile" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3 ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          {!collapsed && <span className="text-xs">마이페이지</span>}
        </Link>
      </div>

      {/* 팀 생성 모달 */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTeamSubmit}
        isLoading={isCreatingTeam}
      />
    </div>
  );
};

export default Sidebar;
