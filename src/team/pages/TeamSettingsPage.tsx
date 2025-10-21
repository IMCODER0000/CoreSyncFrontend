import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrApi, type TeamResponse, type TeamMemberResponse } from '../../api/hrApi';
import axios from 'axios';

const TeamSettingsPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState<TeamResponse | null>(null);
  const [members, setMembers] = useState<TeamMemberResponse[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 편집 상태
  const [editedName, setEditedName] = useState('');
  const [editedAnnualLeave, setEditedAnnualLeave] = useState(15);
  const [editedMinimumWorkHours, setEditedMinimumWorkHours] = useState<number>(0);
  const [editedDescription, setEditedDescription] = useState('');
  
  // 멤버 닉네임 맵
  const [memberNicknames, setMemberNicknames] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      setIsLoading(true);
      
      // 팀 정보 조회
      const teamData = await hrApi.getTeam(Number(teamId));
      setTeam(teamData);
      setEditedName(teamData.name);
      setEditedAnnualLeave(teamData.annualLeaveCount);
      setEditedMinimumWorkHours(teamData.minimumWorkHours || 0);
      setEditedDescription(teamData.description || '');
      
      // 팀장 여부 확인
      const leaderStatus = await hrApi.isTeamLeader(Number(teamId));
      setIsLeader(leaderStatus);
      
      // 팀장이 아니면 접근 불가
      if (!leaderStatus) {
        alert('팀장만 접근할 수 있습니다.');
        navigate(`/team/${teamId}`);
        return;
      }
      
      // 팀 멤버 목록 조회
      const membersData = await hrApi.getTeamMembers(Number(teamId));
      setMembers(membersData);
      
      // 각 멤버의 닉네임 조회
      const nicknameMap = new Map<number, string>();
      const token = localStorage.getItem('userToken');
      
      await Promise.all(
        membersData.map(async (member) => {
          try {
            const response = await axios.get(
              `http://localhost:8001/account/${member.accountId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            nicknameMap.set(member.accountId, response.data.nickname || `User #${member.accountId}`);
          } catch (error) {
            console.error(`멤버 ${member.accountId} 정보 조회 실패:`, error);
            nicknameMap.set(member.accountId, `User #${member.accountId}`);
          }
        })
      );
      
      setMemberNicknames(nicknameMap);
      console.log('멤버 닉네임 로드 완료:', nicknameMap);
      
    } catch (error) {
      console.error('팀 데이터 로드 실패:', error);
      alert('팀 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!team) return;
    
    try {
      setIsSaving(true);
      
      await hrApi.updateTeam(team.id, {
        name: editedName,
        annualLeaveCount: editedAnnualLeave,
        minimumWorkHours: editedMinimumWorkHours,
        description: editedDescription,
      });
      
      alert('팀 정보가 저장되었습니다.');
      await loadTeamData();
      
    } catch (error: any) {
      console.error('팀 정보 저장 실패:', error);
      alert(`저장에 실패했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (accountId: number) => {
    if (!team) return;
    
    // 팀장은 제거할 수 없음
    if (accountId === team.leaderId) {
      alert('팀장은 제거할 수 없습니다.');
      return;
    }
    
    if (!confirm('정말 이 멤버를 제거하시겠습니까?')) {
      return;
    }
    
    try {
      await hrApi.removeMember(team.id, accountId);
      alert('멤버가 제거되었습니다.');
      await loadTeamData();
    } catch (error: any) {
      console.error('멤버 제거 실패:', error);
      alert(`멤버 제거에 실패했습니다: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    
    const confirmMessage = `정말 "${team.name}" 팀을 삭제하시겠습니까?\n\n이 작업은 취소할 수 없으며, 모든 팀 데이터가 삭제됩니다.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      await hrApi.deleteTeam(team.id);
      alert('팀이 삭제되었습니다.');
      navigate('/workspace');
    } catch (error: any) {
      console.error('팀 삭제 실패:', error);
      alert(`팀 삭제에 실패했습니다: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleLeaveTeam = async () => {
    if (!team) return;
    
    const confirmMessage = `정말 "${team.name}" 팀에서 탈퇴하시겠습니까?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      await hrApi.leaveTeam(team.id);
      alert('팀에서 탈퇴했습니다.');
      navigate('/workspace');
    } catch (error: any) {
      console.error('팀 탈퇴 실패:', error);
      alert(`팀 탈퇴에 실패했습니다: ${error.response?.data?.message || error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f8f9fa]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-[#5b7cdb] mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">팀 설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!team || !isLeader) {
    return null;
  }

  return (
    <div className="h-full overflow-auto bg-[#f8f9fa] p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/team/${teamId}`)}
                className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">팀 설정</h1>
                <p className="text-gray-500 text-sm">{team.name}</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-[#5b7cdb] text-white rounded-lg hover:bg-[#4a63b8] transition-colors font-medium disabled:opacity-50 text-sm"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 기본 정보 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">기본 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    팀 이름
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b7cdb] focus:border-[#5b7cdb] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연차 수
                  </label>
                  <input
                    type="number"
                    value={editedAnnualLeave}
                    onChange={(e) => setEditedAnnualLeave(Number(e.target.value))}
                    min="0"
                    max="30"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b7cdb] focus:border-[#5b7cdb] transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500">팀 멤버에게 부여되는 연차 일수</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기준 작업시간 (시간)
                  </label>
                  <input
                    type="number"
                    value={editedMinimumWorkHours}
                    onChange={(e) => setEditedMinimumWorkHours(Number(e.target.value))}
                    min="0"
                    max="24"
                    step="0.5"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b7cdb] focus:border-[#5b7cdb] transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    하루 출근 인정을 위한 최소 작업시간 (예: 8시간). 0으로 설정하면 제한 없음
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    팀 설명
                  </label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b7cdb] focus:border-[#5b7cdb] transition-colors resize-none"
                    placeholder="팀에 대한 설명을 입력하세요..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 팀 멤버 관리 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">팀 멤버</h2>
              
              <div className="space-y-2">
                {members.map((member) => {
                  const displayName = memberNicknames.get(member.accountId) || `User #${member.accountId}`;
                  const currentAccountId = localStorage.getItem('accountId');
                  const isCurrentUser = member.accountId.toString() === currentAccountId;
                  
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-[#5b7cdb] rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {member.role === 'LEADER' ? '👑' : displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {displayName}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-[#5b7cdb]/10 text-[#5b7cdb] px-2 py-0.5 rounded-full">
                                나
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.role === 'LEADER' ? '팀장' : '멤버'}
                          </p>
                        </div>
                      </div>
                      
                      {member.role !== 'LEADER' && (
                        <button
                          onClick={() => handleRemoveMember(member.accountId)}
                          className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-[#5b7cdb]/5 border border-[#5b7cdb]/20 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>총 {members.length}명</strong>의 멤버가 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 위험 영역 */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border-2 border-red-200 p-6">
          <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            위험 영역
          </h2>
          
          <div className="space-y-3">
            {/* 팀 삭제 */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1 text-sm">팀 삭제</h3>
                  <p className="text-xs text-gray-600">
                    팀을 영구적으로 삭제합니다. 모든 데이터가 삭제되며 복구할 수 없습니다.
                  </p>
                </div>
                <button
                  onClick={handleDeleteTeam}
                  className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  팀 삭제
                </button>
              </div>
            </div>

            {/* 팀 탈퇴 */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1 text-sm">팀 탈퇴</h3>
                  <p className="text-xs text-gray-600">
                    이 팀에서 탈퇴합니다. 팀장은 탈퇴할 수 없습니다.
                  </p>
                </div>
                <button
                  onClick={handleLeaveTeam}
                  className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
                >
                  팀 탈퇴
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSettingsPage;
