import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Team } from '../../sidebar/types/team.types';
import { teamApi } from '../../api/teamApi';
import { projectApi } from '../../api/projectApi';
import CreateProjectModal from '../components/CreateProjectModal';
import InviteMemberModal from '../components/InviteMemberModal';

const TeamDetailPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      const response = await teamApi.getTeamList();
      const foundTeam = response.teams.find(t => t.id === Number(teamId));
      
      if (foundTeam) {
        // 팀 프로젝트 목록 조회
        try {
          const projectsResponse = await projectApi.getTeamProjects(Number(teamId));
          // projectList를 프로젝트 배열로 변환
          const projects = projectsResponse.projectList.map((p: any) => ({
            id: p.id,
            name: p.title,
          }));
          setTeam({ ...foundTeam, projects });
        } catch (error) {
          console.error('프로젝트 목록 조회 실패:', error);
          setTeam(foundTeam);
        }
      } else {
        console.error('팀을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('팀 정보 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  const handleCreateProject = async (projectName: string) => {
    if (!teamId) return;
    
    try {
      setIsCreatingProject(true);
      const response = await teamApi.createTeamProject(Number(teamId), { title: projectName });
      console.log('프로젝트 생성 성공:', response);
      // 프로젝트 생성 후 팀 데이터 재조회
      await fetchTeamData();
      setIsCreateModalOpen(false);
      
      // Sidebar에 프로젝트 생성 알림
      window.dispatchEvent(new Event('projectCreated'));
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      alert('프로젝트 생성에 실패했습니다.');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleInviteMember = async (email: string) => {
    if (!teamId) return;
    
    try {
      setIsInviting(true);
      await teamApi.inviteMember(Number(teamId), email);
      alert('멤버 초대가 완료되었습니다!');
      setIsInviteModalOpen(false);
      // 팀 데이터 재조회 (멤버 수 업데이트)
      await fetchTeamData();
    } catch (error: any) {
      console.error('멤버 초대 실패:', error);
      console.error('에러 상세:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = '멤버 초대에 실패했습니다.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      throw error; // 모달이 닫히지 않도록
    } finally {
      setIsInviting(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!team) return;
    
    const confirmMessage = `정말 "${team.name}" 팀에서 탈퇴하시겠습니까?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      await teamApi.leaveTeam(team.id);
      alert('팀에서 탈퇴했습니다.');
      navigate('/workspace');
    } catch (error: any) {
      console.error('팀 탈퇴 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '팀 탈퇴에 실패했습니다.';
      alert(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">팀 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-lg border border-indigo-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">팀을 찾을 수 없습니다</h2>
          <p className="text-gray-500 text-sm mb-5">요청하신 팀이 존재하지 않거나 접근 권한이 없습니다.</p>
          <button
            onClick={() => navigate('/workspace')}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
          >
            워크스페이스로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-indigo-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">{team.name}</h1>
                <div className="flex items-center space-x-3 text-gray-500">
                  <span className="flex items-center text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    ID: {team.id}
                  </span>
                  <span className="flex items-center text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {team.projects.length}개 프로젝트
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate(`/team/${teamId}/settings`)}
                className="px-4 py-2 bg-white/80 text-gray-700 rounded-xl hover:bg-white border border-indigo-100 hover:shadow-md transition-all duration-150 text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                팀 설정
              </button>
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-150 text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                멤버 초대
              </button>
              <button 
                onClick={handleLeaveTeam}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border border-red-100 hover:shadow-md transition-all duration-150 text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                팀 탈퇴
              </button>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-5 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-xs font-medium mb-1.5">프로젝트</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{team.projects.length}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-5 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-xs font-medium mb-1.5">팀 멤버</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">0</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-5 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-xs font-medium mb-1.5">진행 중인 작업</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">0</p>
          </div>
        </div>

        {/* 프로젝트 목록 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">프로젝트</h2>
              <p className="text-xs text-gray-500">팀의 모든 프로젝트를 관리하세요</p>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-150 text-sm font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              프로젝트 추가
            </button>
          </div>

          {team.projects.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="w-14 h-14 bg-[#5b7cdb]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#5b7cdb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">아직 프로젝트가 없습니다</h3>
              <p className="text-sm text-gray-500 mb-4">첫 번째 프로젝트를 만들어 팀 작업을 시작하세요</p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-[#5b7cdb] text-white rounded-lg hover:bg-[#4a63b8] transition-colors duration-150 text-sm font-medium"
              >
                첫 프로젝트 만들기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.projects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-white rounded-lg p-5 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-[#5b7cdb]"
                  onClick={() => navigate(`/agile/project/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-[#5b7cdb]/10 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#5b7cdb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-base text-gray-800 mb-2 group-hover:text-[#5b7cdb] transition-colors duration-200">
                    {project.name}
                  </h3>
                  
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      ID: {project.id}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {localStorage.getItem('nickname') || 'User'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">프로젝트 보기</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-[#5b7cdb] group-hover:translate-x-1 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 프로젝트 생성 모달 */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        isLoading={isCreatingProject}
      />

      {/* 멤버 초대 모달 */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteMember}
        isLoading={isInviting}
      />
    </div>
  );
};

export default TeamDetailPage;
