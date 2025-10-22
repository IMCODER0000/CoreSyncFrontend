import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import { agileBoardApi } from '../../api/agileBoardApi';
import type { AgileBoard } from '../../api/types';
import GithubLinkModal from '../components/GithubLinkModal';

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState('');
  const [agileBoards, setAgileBoards] = useState<AgileBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [openGithubModal, setOpenGithubModal] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectDetail();
    }
  }, [projectId]);

  const loadProjectDetail = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getProjectDetail(Number(projectId));
      console.log('프로젝트 상세 API 응답:', response);
      setProjectTitle(response.title || '프로젝트');
      // agileBoardList를 AgileBoard 타입으로 변환
      const boardList = (response.agileBoardList || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        projectId: Number(projectId),
        writer: {
          id: item.writerId || 0,
          nickname: item.writerNickname || '알 수 없음'
        },
        createDate: item.createDate,
        updateDate: item.updateDate
      }));
      setAgileBoards(boardList);
    } catch (error) {
      console.error('프로젝트 상세 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim() || !projectId) return;

    try {
      setCreating(true);
      const response = await agileBoardApi.createAgileBoard({
        projectId: Number(projectId),
        title: newBoardTitle,
      });
      console.log('보드 생성 응답:', response);
      
      // 생성된 보드를 즉시 목록에 추가
      const newBoard = {
        id: response.id,
        title: response.title,
        projectId: Number(projectId),
        writer: response.writer || {
          id: 0,
          nickname: '나'
        },
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString()
      };
      
      setAgileBoards(prev => [...prev, newBoard]);
      console.log('보드 목록에 즉시 추가:', newBoard);
      
      setOpenDialog(false);
      setNewBoardTitle('');
      
      // Sidebar에 보드 생성 알림
      window.dispatchEvent(new Event('boardCreated'));
    } catch (error: any) {
      console.error('애자일 보드 생성 실패:', error);
      console.error('에러 응답:', error.response?.data);
      console.error('에러 상태:', error.response?.status);
      alert(`애자일 보드 생성에 실패했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleBoardClick = (boardId: number) => {
    navigate(`/agile/board/${boardId}`);
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    
    if (!confirm(`정말로 "${projectTitle}" 프로젝트를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 프로젝트와 관련된 모든 애자일 보드가 삭제됩니다.`)) {
      return;
    }
    
    try {
      await projectApi.deleteProject(Number(projectId));
      alert('프로젝트가 삭제되었습니다.');
      navigate('/agile/project');
    } catch (error: any) {
      console.error('프로젝트 삭제 실패:', error);
      alert(`프로젝트 삭제에 실패했습니다: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">프로젝트 정보를 불러오는 중...</p>
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
              <button
                onClick={() => navigate('/agile/projects')}
                className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center hover:bg-white border border-indigo-100 hover:shadow-md transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">{projectTitle}</h1>
                <div className="flex items-center space-x-3 text-gray-500">
                  <span className="flex items-center text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    {agileBoards.length}개 보드
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border border-red-100 hover:shadow-md transition-all text-sm font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                삭제
              </button>
              <button
                onClick={() => setOpenGithubModal(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 hover:shadow-lg transition-all text-sm font-medium flex items-center"
              >
                <svg className="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Git 연동
              </button>
              <button
                onClick={() => setOpenDialog(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all text-sm font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 보드
              </button>
            </div>
          </div>
        </div>

        {/* 애자일 보드 목록 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">애자일 보드</h2>
              <p className="text-xs text-gray-500">프로젝트의 모든 보드를 관리하세요</p>
            </div>
          </div>

          {agileBoards.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">아직 애자일 보드가 없습니다</h3>
              <p className="text-sm text-gray-500 mb-4">첫 번째 보드를 만들어 작업을 시작하세요</p>
              <button
                onClick={() => setOpenDialog(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all text-sm font-medium"
              >
                첫 보드 만들기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agileBoards.map((board) => (
                <div
                  key={board.id}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 hover:shadow-xl transition-all duration-200 cursor-pointer border border-indigo-100 hover:border-emerald-400"
                  onClick={() => handleBoardClick(board.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-base text-gray-800 mb-2 group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-200">
                    {board.title}
                  </h3>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(board.createDate).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">보드 열기</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 보드 생성 모달 */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setOpenDialog(false)}
          ></div>
          
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-4 border border-gray-200">
            <div className="border-b border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#52c17c]/10 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#52c17c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">새 애자일 보드 만들기</h2>
                </div>
                <button
                  onClick={() => setOpenDialog(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <div className="mb-5">
                <label htmlFor="boardName" className="block text-sm font-medium text-gray-700 mb-2">
                  보드 이름
                </label>
                <input
                  type="text"
                  id="boardName"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateBoard();
                    }
                  }}
                  placeholder="보드 이름을 입력하세요"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#52c17c] focus:border-[#52c17c] transition-colors"
                  disabled={creating}
                  autoFocus
                />
              </div>
              
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setOpenDialog(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  disabled={creating}
                >
                  취소
                </button>
                <button
                  onClick={handleCreateBoard}
                  disabled={creating || !newBoardTitle.trim()}
                  className="px-4 py-2 text-sm bg-[#52c17c] text-white rounded-lg hover:bg-[#45a869] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
                >
                  {creating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      생성 중...
                    </>
                  ) : (
                    '보드 만들기'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub 연동 모달 */}
      <GithubLinkModal
        isOpen={openGithubModal}
        onClose={() => setOpenGithubModal(false)}
        projectId={Number(projectId)}
        onSuccess={() => {
          loadProjectDetail();
        }}
      />
    </div>
  );
};

export default ProjectDetailPage;
