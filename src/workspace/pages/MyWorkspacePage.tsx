import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import type { KanbanTicket } from '../../api/types';

interface MyTask extends KanbanTicket {
  projectTitle: string;
  boardTitle: string;
  isToday: boolean;
}

const MyWorkspacePage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [todayTasks, setTodayTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<MyTask | null>(null);

  useEffect(() => {
    loadMyTasks();
  }, []);

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      
      // 1. 내 칸반 티켓 전체 조회 (백엔드에서 자동으로 accountProfileId 찾아서 조회)
      const ticketsResponse = await axios.get(
        `${import.meta.env.VITE_AGILE_API_URL}/kanban-ticket/my-tickets`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const allTickets = ticketsResponse.data || [];
      console.log('내 모든 티켓:', allTickets);
      
      // 3. IN_PROGRESS와 BACKLOG만 필터링
      const filteredTickets = allTickets.filter((ticket: any) => 
        ticket.status === 'IN_PROGRESS' || ticket.status === 'BACKLOG'
      );
      
      console.log('필터링된 티켓 (IN_PROGRESS + BACKLOG):', filteredTickets);
      
      // 4. MyTask 형식으로 변환 (프로젝트/보드 정보는 별도 조회 필요)
      const tasksWithDetails: MyTask[] = [];
      
      for (const ticket of filteredTickets) {
        try {
          // 보드 정보 조회
          const boardResponse = await axios.get(
            `${import.meta.env.VITE_AGILE_API_URL}/agile-board/${ticket.agileBoardId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // 프로젝트 정보 조회
          const projectResponse = await axios.get(
            `${import.meta.env.VITE_AGILE_API_URL}/project/read/${boardResponse.data.projectId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          tasksWithDetails.push({
            ...ticket,
            projectTitle: projectResponse.data.title || '프로젝트',
            boardTitle: boardResponse.data.title || '보드',
            isToday: false
          });
        } catch (error) {
          console.error(`티켓 ${ticket.id} 상세 정보 로드 실패:`, error);
          // 실패해도 기본값으로 추가
          tasksWithDetails.push({
            ...ticket,
            projectTitle: '알 수 없음',
            boardTitle: '알 수 없음',
            isToday: false
          });
        }
      }
      
      setTasks(tasksWithDetails);
      
      // localStorage에서 오늘 할 일 불러오기
      const savedTodayTasks = localStorage.getItem('todayTasks');
      if (savedTodayTasks) {
        const todayTaskIds = JSON.parse(savedTodayTasks);
        const todayTaskList = tasksWithDetails.filter((task: MyTask) => todayTaskIds.includes(task.id));
        setTodayTasks(todayTaskList);
      }
    } catch (error) {
      console.error('작업 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToToday = (task: MyTask) => {
    if (!todayTasks.find(t => t.id === task.id)) {
      const newTodayTasks = [...todayTasks, task];
      setTodayTasks(newTodayTasks);
      
      // localStorage에 저장
      const taskIds = newTodayTasks.map(t => t.id);
      localStorage.setItem('todayTasks', JSON.stringify(taskIds));
    }
  };

  // 드래그 시작
  const handleDragStart = (task: MyTask, fromToday: boolean) => {
    setDraggedTask({ ...task, isToday: fromToday });
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  // 오늘 할 일 영역에 드롭
  const handleDropToToday = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTask && !draggedTask.isToday) {
      addToToday(draggedTask);
    }
    setDraggedTask(null);
  };

  // 진행 중인 작업 영역에 드롭
  const handleDropToTasks = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTask && draggedTask.isToday) {
      removeFromToday(draggedTask.id);
    }
    setDraggedTask(null);
  };

  // 드래그 오버 허용
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFromToday = (taskId: number) => {
    const newTodayTasks = todayTasks.filter(t => t.id !== taskId);
    setTodayTasks(newTodayTasks);
    
    // localStorage 업데이트
    const taskIds = newTodayTasks.map(t => t.id);
    localStorage.setItem('todayTasks', JSON.stringify(taskIds));
  };

  const goToTicket = (task: MyTask) => {
    navigate(`/agile/board/${task.agileBoardId}?ticketId=${task.id}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '긴급';
      case 'HIGH': return '높음';
      case 'MEDIUM': return '보통';
      case 'LOW': return '낮음';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BACKLOG': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'SPRINT_TERM': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'REVIEW': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'DONE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ADDITIONAL_WORK': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'BLOCKED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'BACKLOG': return '백로그';
      case 'SPRINT_TERM': return '스프린트';
      case 'IN_PROGRESS': return '진행중';
      case 'REVIEW': return '리뷰';
      case 'DONE': return '완료';
      case 'ADDITIONAL_WORK': return '추가작업';
      case 'BLOCKED': return '차단됨';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">작업 목록을 불러오는 중...</p>
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
                    ✅
                  </div>
                  나의 작업
                </h1>
                <p className="text-gray-600 text-sm">모든 프로젝트에서 진행 중인 작업을 한눈에 확인하고 관리하세요 ✨</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">전체 작업</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{tasks.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 오늘 할 일 */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onDrop={handleDropToToday}
              onDragOver={handleDragOver}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 p-6 transition-all ${
                draggedTask && !draggedTask.isToday 
                  ? 'border-indigo-400 bg-indigo-50/50' 
                  : 'border-indigo-100'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  오늘 할 일
                </h2>
                <span className="text-sm font-semibold text-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-1.5 rounded-full shadow-sm">
                  {todayTasks.length}개
                </span>
              </div>

              {todayTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📝</div>
                  <p className="text-gray-500 text-sm">
                    {draggedTask && !draggedTask.isToday 
                      ? '여기에 드롭하여 오늘 할 일에 추가하세요' 
                      : '오늘 할 일을 추가해보세요'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {todayTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable
                        onDragStart={() => handleDragStart(task, true)}
                        onDragEnd={handleDragEnd}
                        className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200 hover:shadow-lg transition-all group cursor-move"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                              onClick={() => goToTicket(task)}
                            >
                              {task.title}
                            </h3>
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="inline-flex items-center gap-1 text-indigo-600 font-medium">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                  </svg>
                                  {task.projectTitle}
                                </span>
                                <span className="text-gray-400">/</span>
                                <span className="text-gray-600">{task.boardTitle}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromToday(task.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${getStatusColor(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${getPriorityColor(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                          {task.backlogNumber && (
                            <span className="text-xs px-2 py-1 bg-white/80 text-gray-600 rounded-md font-medium">#{task.backlogNumber}</span>
                          )}
                          {task.domain && (
                            <span className="text-xs px-2 py-1 bg-white/80 text-indigo-700 rounded-md font-medium border border-indigo-200">{task.domain}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>

          {/* 진행 중인 모든 작업 */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onDrop={handleDropToTasks}
              onDragOver={handleDragOver}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 p-6 transition-all ${
                draggedTask && draggedTask.isToday 
                  ? 'border-emerald-400 bg-emerald-50/50' 
                  : 'border-emerald-100'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                  진행 중인 작업
                </h2>
                <span className="text-sm font-semibold text-emerald-600 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-1.5 rounded-full shadow-sm">
                  {tasks.length}개
                </span>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🎯</div>
                  <p className="text-gray-500 text-sm">진행 중인 작업이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      draggable
                      onDragStart={() => handleDragStart(task, false)}
                      onDragEnd={handleDragEnd}
                      className="bg-white/90 rounded-xl p-4 border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all group cursor-move"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-emerald-600 transition-colors"
                            onClick={() => goToTicket(task)}
                          >
                            {task.title}
                          </h3>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="inline-flex items-center gap-1 text-indigo-600 font-medium">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                {task.projectTitle}
                              </span>
                              <span className="text-gray-400">/</span>
                              <span className="text-gray-600">{task.boardTitle}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => addToToday(task)}
                          disabled={todayTasks.some(t => t.id === task.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ml-2 flex-shrink-0 ${
                            todayTasks.some(t => t.id === task.id)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-md'
                          }`}
                        >
                          {todayTasks.some(t => t.id === task.id) ? '추가됨' : '오늘 할 일'}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${getStatusColor(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${getPriorityColor(task.priority)}`}>
                          {getPriorityText(task.priority)}
                        </span>
                        {task.backlogNumber && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">#{task.backlogNumber}</span>
                        )}
                        {task.domain && (
                          <span className="text-xs px-2 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-md font-medium border border-indigo-100">{task.domain}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyWorkspacePage;
