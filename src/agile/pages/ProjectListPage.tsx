import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { projectApi } from '../../api/projectApi';
import { hrApi, type TeamResponse } from '../../api/hrApi';
import type { Project } from '../../api/types';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const teamList = await hrApi.getTeamList();
      setTeams(teamList);
      if (teamList.length > 0) {
        setSelectedTeamId(teamList[0].id);
      }
    } catch (error) {
      console.error('팀 목록 로드 실패:', error);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getProjectList(1, 50);
      console.log('API 응답:', response);
      // projectList를 Project 타입으로 변환
      const projectList = (response.projectList || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        writer: {
          id: item.writer?.id || item.writerId,
          nickname: item.writer?.nickname || item.writerNickname || '알 수 없음'
        },
        createDate: item.createDate,
        updateDate: item.updateDate
      }));
      setProjects(projectList);
    } catch (error) {
      console.error('프로젝트 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return;

    try {
      setCreating(true);
      const response = await projectApi.createProject({ 
        title: newProjectTitle,
        teamId: selectedTeamId || undefined
      });
      console.log('프로젝트 생성 응답:', response);
      setOpenDialog(false);
      setNewProjectTitle('');
      setSelectedTeamId(teams.length > 0 ? teams[0].id : null);
      loadProjects();
    } catch (error: any) {
      console.error('프로젝트 생성 실패:', error);
      console.error('에러 응답:', error.response?.data);
      console.error('에러 상태:', error.response?.status);
      alert(`프로젝트 생성에 실패했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleProjectClick = (projectId: number) => {
    navigate(`/agile/project/${projectId}`);
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
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-indigo-100 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                    📁
                  </div>
                  프로젝트 관리
                </h1>
                <p className="text-gray-600 text-sm">팀의 모든 프로젝트를 한곳에서 관리하세요 ✨</p>
              </div>
              <button
                onClick={() => setOpenDialog(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                <span>새 프로젝트</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* 프로젝트 목록 */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-indigo-100 p-16 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg">
              📁
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">프로젝트가 없습니다</h2>
            <p className="text-gray-500 text-sm mb-6">첫 번째 프로젝트를 만들어 시작하세요</p>
            <button
              onClick={() => setOpenDialog(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>첫 프로젝트 만들기</span>
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleProjectClick(project.id)}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-6 cursor-pointer hover:shadow-xl hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-2xl group-hover:shadow-md transition-all flex-shrink-0">
                    📁
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      생성일: {new Date(project.createDate).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm">
                      👤
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {project.writer?.nickname || '알 수 없음'}
                    </span>
                  </div>
                  <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* 프로젝트 생성 모달 */}
      <AnimatePresence>
        {openDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenDialog(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-indigo-100"
              >
                {/* 헤더 */}
                <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl">
                        ✨
                      </div>
                      <h3 className="text-2xl font-bold">새 프로젝트</h3>
                    </div>
                    <p className="text-white/90 text-sm">멋진 프로젝트를 시작해보세요</p>
                  </div>
                </div>

                {/* 내용 */}
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-indigo-600">📝</span>
                      프로젝트 이름
                    </label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="예: 새로운 웹 서비스 개발"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newProjectTitle.trim()) {
                          handleCreateProject();
                        }
                      }}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-purple-600">👥</span>
                      팀 선택
                      <span className="text-xs font-normal text-gray-500">(선택사항)</span>
                    </label>
                    <select
                      value={selectedTeamId || ''}
                      onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 transition-all cursor-pointer"
                    >
                      <option value="">🚀 개인 프로젝트로 시작</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 px-8 pb-8">
                  <button
                    onClick={() => setOpenDialog(false)}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={creating || !newProjectTitle.trim()}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>생성 중...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>프로젝트 생성</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectListPage;
