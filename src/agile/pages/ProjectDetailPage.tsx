import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import { agileBoardApi } from '../../api/agileBoardApi';
import type { AgileBoard } from '../../api/types';

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState('');
  const [agileBoards, setAgileBoards] = useState<AgileBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [creating, setCreating] = useState(false);

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
      setOpenDialog(false);
      setNewBoardTitle('');
      loadProjectDetail();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">프로젝트 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* 헤더 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white p-8 rounded-2xl shadow-xl mb-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-24 -mt-24"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white opacity-5 rounded-full -ml-18 -mb-18"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/agile/projects')}
              className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1 tracking-tight">{projectTitle}</h1>
              <div className="flex items-center space-x-3 text-blue-100">
                <span className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  {agileBoards.length}개 보드
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpenDialog(true)}
            className="px-5 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 보드
          </button>
        </div>
      </div>

      {/* 애자일 보드 목록 */}
      <div className="bg-white bg-opacity-70 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white border-opacity-50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-0.5">애자일 보드</h2>
            <p className="text-xs text-gray-500">프로젝트의 모든 보드를 관리하세요</p>
          </div>
        </div>

        {agileBoards.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">아직 애자일 보드가 없습니다</h3>
            <p className="text-sm text-gray-500 mb-4">첫 번째 보드를 만들어 작업을 시작하세요</p>
            <button
              onClick={() => setOpenDialog(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
            >
              첫 보드 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agileBoards.map((board) => (
              <div
                key={board.id}
                className="group relative overflow-hidden bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200"
                onClick={() => handleBoardClick(board.id)}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 opacity-0 group-hover:opacity-10 rounded-full -mr-12 -mt-12 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center group-hover:from-green-500 group-hover:to-emerald-600 transition-all duration-300 group-hover:scale-110 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-base text-gray-800 mb-1.5 group-hover:text-green-600 transition-colors duration-300">
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 보드 생성 모달 */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setOpenDialog(false)}
          ></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">새 애자일 보드 만들기</h2>
                </div>
                <button
                  onClick={() => setOpenDialog(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  disabled={creating}
                  autoFocus
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setOpenDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  disabled={creating}
                >
                  취소
                </button>
                <button
                  onClick={handleCreateBoard}
                  disabled={creating || !newBoardTitle.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
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
    </div>
  );
};

export default ProjectDetailPage;
