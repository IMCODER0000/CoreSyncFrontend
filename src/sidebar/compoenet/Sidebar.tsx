import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import TeamDropdown from './TeamDropdown';
import CreateTeamModal from './CreateTeamModal';
import type { Team } from '../types/team.types';
import { teamApi } from '../../api/teamApi';
import { projectApi } from '../../api/projectApi';

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
  
  // 팀 데이터 상태
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // 팀 목록 조회
  const fetchTeams = async () => {
    try {
      setIsLoadingTeams(true);
      const response = await teamApi.getTeamList();
      
      // 각 팀의 프로젝트 목록도 함께 조회
      const teamsWithProjects = await Promise.all(
        response.teams.map(async (team) => {
          try {
            const projectsResponse = await projectApi.getTeamProjects(team.id);
            const projects = projectsResponse.projectList.map((p: any) => ({
              id: p.id,
              name: p.title,
            }));
            return { ...team, projects };
          } catch (error) {
            console.error(`팀 ${team.id}의 프로젝트 조회 실패:`, error);
            return team;
          }
        })
      );
      
      setTeams(teamsWithProjects);
    } catch (error) {
      console.error('팀 목록 조회 실패:', error);
      setTeams([]);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchTeams();
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
      await teamApi.createTeam({ name: teamName });
      // 팀 생성 성공 후 목록 재조회
      await fetchTeams();
      setIsCreateModalOpen(false);
    } catch (error: any) {
      console.error('팀 생성 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '팀 생성에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsCreatingTeam(false);
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
      className={`bg-white flex flex-col h-screen transition-all duration-300 shadow-lg rounded-tr-xl rounded-br-xl ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-5 mb-2`}>
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-base">
          <span className="text-blue-500">C</span>
        </div>
        {!collapsed && (
          <span className="ml-3 text-base font-bold text-gray-800">CoreSync</span>
        )}
      </div>

      <nav className="flex-1 px-2 py-2">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center ${
                    collapsed ? 'justify-center' : 'justify-between'
                  } px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`${isActive ? 'text-blue-600' : 'text-gray-500'} transition-colors duration-200 w-5 h-5 ml-1`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className={`ml-3 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>{item.title}</span>
                    )}
                  </div>
                  
                  {!collapsed && item.badge && (
                    <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
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

      <div className="mt-auto border-t border-gray-100 pt-3 pb-2">
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
