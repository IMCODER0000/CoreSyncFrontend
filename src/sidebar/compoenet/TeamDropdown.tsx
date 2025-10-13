import React, { useState } from 'react';
import type { Team } from '../types/team.types';

interface TeamDropdownProps {
  /** 사이드바 접기/펼치기 상태 */
  collapsed?: boolean;
  /** 팀 목록 */
  teams: Team[];
  /** 팀 선택 시 콜백 */
  onTeamSelect?: (teamId: number) => void;
  /** 프로젝트 선택 시 콜백 */
  onProjectSelect?: (teamId: number, projectId: number) => void;
  /** 팀 생성 버튼 클릭 시 콜백 */
  onCreateTeam?: () => void;
}

const TeamDropdown: React.FC<TeamDropdownProps> = ({
  collapsed = false,
  teams,
  onTeamSelect,
  onProjectSelect,
  onCreateTeam,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());

  const toggleDropdown = () => {
    if (!collapsed) {
      setIsOpen(!isOpen);
    }
  };

  const toggleTeam = (teamId: number, event: React.MouseEvent) => {
    // 화살표 아이콘 클릭 시에만 토글
    const target = event.target as HTMLElement;
    const isArrowClick = target.closest('.toggle-arrow');
    
    if (isArrowClick) {
      // 프로젝트 목록 토글
      const newExpandedTeams = new Set(expandedTeams);
      if (newExpandedTeams.has(teamId)) {
        newExpandedTeams.delete(teamId);
      } else {
        newExpandedTeams.add(teamId);
      }
      setExpandedTeams(newExpandedTeams);
    } else {
      // 팀 이름 클릭 시 팀 페이지로 이동
      onTeamSelect?.(teamId);
    }
  };

  const handleProjectClick = (teamId: number, projectId: number) => {
    onProjectSelect?.(teamId, projectId);
  };

  return (
    <div className="relative">
      {/* 팀 메뉴 버튼 */}
      <button
        onClick={toggleDropdown}
        className={`flex items-center w-full ${
          collapsed ? 'justify-center' : 'justify-between'
        } px-4 py-2 rounded-lg transition-all duration-200 ${
          isOpen
            ? 'bg-blue-50 text-blue-600 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center">
          <span className={`${isOpen ? 'text-blue-600' : 'text-gray-500'} transition-colors duration-200 w-5 h-5 ml-1`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </span>
          {!collapsed && (
            <span className={`ml-3 text-sm font-medium ${isOpen ? 'text-blue-600' : 'text-gray-600'}`}>
              팀
            </span>
          )}
        </div>
        
        {!collapsed && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* 드롭다운 컨텐츠 */}
      {isOpen && !collapsed && (
        <div className="mt-1 ml-4 space-y-1">
          {teams.length === 0 ? (
            <div className="px-4 py-3 space-y-2">
              <div className="text-sm text-gray-400 text-center">
                소속된 팀이 없습니다
              </div>
              <button
                onClick={onCreateTeam}
                className="flex items-center justify-center w-full px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                팀 만들기
              </button>
            </div>
          ) : (
            <>
              {teams.map((team) => (
              <div key={team.id} className="space-y-1">
                {/* 팀 아이템 */}
                <button
                  onClick={(e) => toggleTeam(team.id, e)}
                  className="flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <span className="truncate">{team.name}</span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`toggle-arrow h-3 w-3 transition-transform duration-200 ${
                      expandedTeams.has(team.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 프로젝트 목록 */}
                {expandedTeams.has(team.id) && (
                  <div className="ml-6 space-y-1">
                    {team.projects.length === 0 ? (
                      <div className="px-4 py-2 text-xs text-gray-400">
                        프로젝트가 없습니다
                      </div>
                    ) : (
                      team.projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectClick(team.id, project.id)}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="truncate">{project.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              ))}
              
              {/* 팀이 2개 미만일 때 팀 만들기 버튼 표시 */}
              {teams.length < 2 && (
                <div className="px-4 py-2">
                  <button
                    onClick={onCreateTeam}
                    className="flex items-center justify-center w-full px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    팀 만들기
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamDropdown;
