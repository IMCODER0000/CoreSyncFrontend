import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { agileBoardApi } from '../../api/agileBoardApi';
import { kanbanTicketApi } from '../../api/kanbanTicketApi';
import { ticketCommentApi } from '../../api/ticketCommentApi';
import { githubApi, type GithubCommit } from '../../api/githubApi';
import { projectApi } from '../../api/projectApi';
import { hrApi, type TeamMemberResponse } from '../../api/hrApi';
import axios from 'axios';
import type { KanbanTicket, TicketStatus, TicketPriority, TicketComment } from '../../api/types';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import { Close } from '@mui/icons-material';

const COLUMNS: { status: TicketStatus; title: string; color: string }[] = [
  { status: 'BACKLOG', title: 'Backlog', color: '#94a3b8' },
  { status: 'SPRINT_TERM', title: 'Sprint Term', color: '#a78bfa' },
  { status: 'IN_PROGRESS', title: 'In Progress', color: '#3b82f6' },
  { status: 'REVIEW', title: 'Review', color: '#f59e0b' },
  { status: 'DONE', title: 'Done', color: '#10b981' },
  { status: 'ADDITIONAL_WORK', title: 'Additional Work', color: '#ec4899' },
  { status: 'BLOCKED', title: 'Blocked', color: '#ef4444' },
];

const KanbanBoardPage = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [boardTitle, setBoardTitle] = useState('');
  const [, setProjectId] = useState<number | null>(null);
  const [tickets, setTickets] = useState<KanbanTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<KanbanTicket | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 팀 멤버 관련 상태
  const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([]);
  const [, setTeamId] = useState<number | null>(null);
  const [memberNicknames, setMemberNicknames] = useState<Map<number, string>>(new Map());
  
  // GitHub 커밋 관련 상태
  const [githubCommits, setGithubCommits] = useState<GithubCommit[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [githubOwner, setGithubOwner] = useState<string | null>(null);
  const [githubRepo, setGithubRepo] = useState<string | null>(null);
  const [showCommitSearch, setShowCommitSearch] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<GithubCommit | null>(null);
  const [commitSearchQuery, setCommitSearchQuery] = useState('');
  const [generatingBacklog, setGeneratingBacklog] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  // 댓글 관련 상태
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // 폼 데이터 상태
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedStatus, setEditedStatus] = useState<TicketStatus>('BACKLOG');
  const [editedPriority, setEditedPriority] = useState<TicketPriority>('MEDIUM');
  const [editedDomain, setEditedDomain] = useState('');
  const [editedAssignee, setEditedAssignee] = useState<number | null>(null);
  
  // 뷰 모드 상태
  type ViewMode = 'status' | 'domain' | 'list';
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // 검색 상태
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (boardId) {
      loadBoardDetail();
    }
  }, [boardId]);
  
  // memberNicknames는 담당자 드롭다운에서만 사용
  // 티켓의 writerNickname은 백엔드에서 제공하는 값을 그대로 사용

  const loadBoardDetail = async () => {
    try {
      setLoading(true);
      const response = await agileBoardApi.getAgileBoardDetail(Number(boardId));
      console.log('보드 상세 API 응답:', response);
      setBoardTitle(response.title || '보드');
      
      // 프로젝트 ID 저장
      const projId = response.projectId;
      setProjectId(projId);
      
      // 프로젝트 정보 가져와서 GitHub 저장소 정보 및 팀 정보 확인
      if (projId) {
        try {
          const projectDetail = await projectApi.getProjectDetail(projId);
          if (projectDetail.githubOwner && projectDetail.githubRepositoryName) {
            setGithubOwner(projectDetail.githubOwner);
            setGithubRepo(projectDetail.githubRepositoryName);
          }
          
          // 팀 ID 저장 및 팀 멤버 로드
          const projTeamId = (projectDetail as any).teamId;
          if (projTeamId) {
            setTeamId(projTeamId);
            try {
              const members = await hrApi.getTeamMembers(projTeamId);
              setTeamMembers(members);
              console.log('팀 멤버 로드 완료:', members);
              
              // 각 멤버의 닉네임 조회
              const nicknameMap = new Map<number, string>();
              const token = localStorage.getItem('userToken');
              
              await Promise.all(
                members.map(async (member) => {
                  try {
                    const response = await axios.get(
                      `${import.meta.env.VITE_ACCOUNT_API_URL || 'http://localhost:8001'}/account-profile/${member.accountId}`,
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
              console.error('팀 멤버 로드 실패:', error);
            }
          }
        } catch (error) {
          console.error('프로젝트 정보 로드 실패:', error);
        }
      }
      
      // kanbanTicketList를 KanbanTicket 타입으로 변환
      const ticketList = (response.kanbanTicketList || []).map((item: any) => {
        // 백엔드에서 제공하는 writerNickname을 우선 사용
        let writerNickname = item.writerNickname;
        
        // writerNickname이 없는 경우에만 memberNicknames에서 조회
        if (!writerNickname && item.writerId && memberNicknames.size > 0) {
          writerNickname = memberNicknames.get(item.writerId) || `User #${item.writerId}`;
        }
        
        // 그래도 없으면 기본값
        if (!writerNickname) {
          writerNickname = `User #${item.writerId || 0}`;
        }
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          status: item.status || 'BACKLOG',
          priority: item.priority || 'MEDIUM',
          domain: item.domain || '',
          writer: {
            id: item.writerId || 0,
            nickname: writerNickname
          },
          agileBoardId: Number(boardId),
          backlogNumber: item.backlogNumber,
          createDate: item.createDate,
          updateDate: item.updateDate,
          linkedCommitSha: item.linkedCommitSha,
          linkedCommitMessage: item.linkedCommitMessage,
          linkedCommitUrl: item.linkedCommitUrl,
        };
      });
      setTickets(ticketList);
      
      // URL 파라미터에서 ticketId를 확인하고 자동으로 티켓 상세 열기
      const ticketIdParam = searchParams.get('ticketId');
      if (ticketIdParam) {
        const ticketId = parseInt(ticketIdParam);
        const targetTicket = ticketList.find((t: KanbanTicket) => t.id === ticketId);
        if (targetTicket) {
          // 티켓 상세 열기
          handleTicketClick(targetTicket);
        }
        // URL에서 ticketId 파라미터 제거
        setSearchParams({});
      }
    } catch (error) {
      console.error('보드 상세 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGithubCommits = async () => {
    if (!githubOwner || !githubRepo) {
      console.log('GitHub 저장소 정보 없음');
      return;
    }

    try {
      setLoadingCommits(true);
      const commits = await githubApi.getCommits(githubOwner, githubRepo, 10);
      setGithubCommits(commits);
    } catch (error) {
      console.error('GitHub 커밋 조회 실패:', error);
      setGithubCommits([]);
    } finally {
      setLoadingCommits(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!boardId) return;

    try {
      setCreating(true);
      const response = await kanbanTicketApi.createKanbanTicket({
        agileBoardId: Number(boardId),
        title: '제목 없음',
      });
      console.log('티켓 생성 응답:', response);
      console.log('백로그 넘버:', (response as any).backlogNumber);
      
      // 생성된 티켓을 바로 열기 (loadBoardDetail 전에)
      const currentUserNickname = localStorage.getItem('nickname') || 'User';
      const newTicket: KanbanTicket = {
        id: response.id,
        title: response.title || '제목 없음',
        description: (response as any).description || '',
        status: (response as any).status || 'BACKLOG',
        priority: (response as any).priority || 'MEDIUM',
        domain: (response as any).domain || '',
        writer: {
          id: (response as any).writerId || 0,
          nickname: currentUserNickname
        },
        agileBoardId: Number(boardId),
        backlogNumber: (response as any).backlogNumber,
        createDate: (response as any).createDate || new Date().toISOString(),
        updateDate: (response as any).updateDate || new Date().toISOString()
      };
      console.log('생성된 티켓 객체:', newTicket);
      
      // 티켓을 즉시 목록에 추가
      setTickets(prev => [...prev, newTicket]);
      console.log('티켓 목록에 즉시 추가:', newTicket);
      
      setSelectedTicket(newTicket);
      setIsDrawerOpen(true);
    } catch (error: any) {
      console.error('티켓 생성 실패:', error);
      console.error('에러 응답:', error.response?.data);
      console.error('에러 상태:', error.response?.status);
      alert(`티켓 생성에 실패했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleTicketClick = (ticket: KanbanTicket) => {
    setSelectedTicket(ticket);
    setEditedTitle(ticket.title);
    setEditedDescription(ticket.description || '');
    setEditedStatus(ticket.status);
    setEditedPriority(ticket.priority);
    setEditedDomain(ticket.domain || '');
    setEditedAssignee(ticket.writer?.id || null);
    setIsDrawerOpen(true);
    
    // 이미 연결된 커밋이 있으면 표시, 없으면 초기화
    if (ticket.linkedCommitSha) {
      setSelectedCommit({
        sha: ticket.linkedCommitSha,
        message: ticket.linkedCommitMessage || '',
        author: { name: '', email: '', date: '' },
        url: ticket.linkedCommitUrl || '',
      });
    } else {
      setSelectedCommit(null);
    }
    
    // 댓글 로드
    loadComments(ticket.id);
  };
  
  // 댓글 로드
  const loadComments = async (ticketId: number) => {
    try {
      setLoadingComments(true);
      const commentList = await ticketCommentApi.getComments(ticketId);
      setComments(commentList);
    } catch (error) {
      console.error('댓글 로드 실패:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };
  
  // 댓글 작성
  const handleCreateComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;
    
    try {
      setSubmittingComment(true);
      await ticketCommentApi.createComment({
        ticketId: selectedTicket.id,
        content: newComment,
      });
      setNewComment('');
      await loadComments(selectedTicket.id);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmittingComment(false);
    }
  };
  
  // 댓글 수정
  const handleUpdateComment = async (commentId: number) => {
    if (!editingCommentContent.trim()) return;
    
    try {
      await ticketCommentApi.updateComment(commentId, {
        content: editingCommentContent,
      });
      setEditingCommentId(null);
      setEditingCommentContent('');
      if (selectedTicket) {
        await loadComments(selectedTicket.id);
      }
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };
  
  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) return;
    
    try {
      await ticketCommentApi.deleteComment(commentId);
      if (selectedTicket) {
        await loadComments(selectedTicket.id);
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedTicket(null);
      setEditedTitle('');
      setEditedDescription('');
      setEditedStatus('BACKLOG');
      setEditedPriority('MEDIUM');
      setEditedDomain('');
      setGithubCommits([]);
      setShowCommitSearch(false);
      setSelectedCommit(null);
      setCommitSearchQuery('');
      setComments([]);
      setNewComment('');
      setEditingCommentId(null);
      setEditingCommentContent('');
    }, 300);
  };

  // 커밋 필터링 함수
  const filteredCommits = githubCommits.filter(commit => 
    commit.message.toLowerCase().includes(commitSearchQuery.toLowerCase()) ||
    commit.author.name.toLowerCase().includes(commitSearchQuery.toLowerCase()) ||
    commit.sha.toLowerCase().includes(commitSearchQuery.toLowerCase())
  );

  // AI 백로그 생성 함수
  const handleGenerateBacklog = async () => {
    if (!githubOwner || !githubRepo) {
      alert('GitHub 저장소 정보가 없습니다.');
      return;
    }

    try {
      setGeneratingBacklog(true);
      
      let backlog: string;
      
      // 연결된 커밋이 있으면 상세 백로그 생성, 없으면 일반 백로그 생성
      if (selectedCommit && selectedCommit.sha) {
        backlog = await githubApi.generateDetailedBacklog(githubOwner, githubRepo, selectedCommit.sha);
      } else {
        backlog = await githubApi.generateBacklog(githubOwner, githubRepo, 30);
      }
      
      // 기존 description에 AI 생성 백로그 추가
      const newDescription = editedDescription 
        ? `${editedDescription}\n\n---\n\n${backlog}`
        : backlog;
      
      setEditedDescription(newDescription);
      
      if (selectedCommit) {
        alert('연결된 커밋의 코드 변경사항을 분석하여 상세 백로그가 생성되었습니다!');
      } else {
        alert('최근 커밋 내역을 기반으로 백로그가 생성되었습니다!');
      }
    } catch (error: any) {
      console.error('AI 백로그 생성 실패:', error);
      alert(`백로그 생성에 실패했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setGeneratingBacklog(false);
    }
  };

  const handleSaveTicket = async () => {
    if (!selectedTicket) return;

    const updateData = {
      title: editedTitle,
      description: editedDescription,
      status: editedStatus,
      priority: editedPriority,
      domain: editedDomain,
      linkedCommitSha: selectedCommit?.sha || null,
      linkedCommitMessage: selectedCommit?.message || null,
      linkedCommitUrl: selectedCommit?.url || null,
    };

    console.log('Sending update data:', updateData);
    console.log('Priority type:', typeof editedPriority, 'Value:', editedPriority);
    console.log('Status type:', typeof editedStatus, 'Value:', editedStatus);

    try {
      setSaving(true);
      const response = await kanbanTicketApi.updateKanbanTicket(selectedTicket.id, updateData);
      console.log('티켓 업데이트 응답:', response);
      
      // 티켓 목록에서 해당 티켓 업데이트
      setTickets(prev => prev.map(ticket => 
        ticket.id === selectedTicket.id 
          ? {
              ...ticket,
              title: editedTitle,
              description: editedDescription,
              status: editedStatus,
              priority: editedPriority,
              domain: editedDomain,
              updateDate: new Date().toISOString()
            }
          : ticket
      ));
      console.log('티켓 목록 업데이트 완료');
      
      handleCloseDrawer();
    } catch (error: any) {
      console.error('티켓 저장 실패:', error);
      console.error('에러 응답:', error.response?.data);
      alert(`티켓 저장에 실패했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;

    if (!confirm('정말 이 티켓을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setSaving(true);
      await kanbanTicketApi.deleteKanbanTicket(selectedTicket.id);
      
      // 성공 후 보드 데이터 재조회
      await loadBoardDetail();
      handleCloseDrawer();
    } catch (error: any) {
      console.error('티켓 삭제 실패:', error);
      alert(`티켓 삭제에 실패했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTicketFromCard = async (ticketId: number) => {
    try {
      await kanbanTicketApi.deleteKanbanTicket(ticketId);
      // 성공 후 보드 데이터 재조회
      await loadBoardDetail();
    } catch (error: any) {
      console.error('티켓 삭제 실패:', error);
      alert(`티켓 삭제에 실패했습니다: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // 드롭 위치가 없으면 무시
    if (!destination) {
      return;
    }

    // 같은 위치에 드롭하면 무시
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const ticketId = parseInt(draggableId);
    const newStatus = destination.droppableId as TicketStatus;

    // 로컬 상태 즉시 업데이트
    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    );
    setTickets(updatedTickets);

    // 백엔드에 업데이트 요청
    try {
      await kanbanTicketApi.updateKanbanTicket(ticketId, {
        status: newStatus,
      });
    } catch (error: any) {
      console.error('티켓 상태 업데이트 실패:', error);
      alert(`티켓 상태 업데이트에 실패했습니다: ${error.response?.data?.message || error.message}`);
      // 실패 시 원래 데이터로 복구
      await loadBoardDetail();
    }
  };

  const getTicketsByStatus = (status: TicketStatus) => {
    return tickets.filter((ticket) => ticket.status === status);
  };
  
  // 검색 필터링된 티켓 목록
  const getFilteredTickets = () => {
    if (!searchQuery.trim()) {
      return tickets;
    }
    
    const query = searchQuery.toLowerCase();
    return tickets.filter((ticket) => {
      return (
        ticket.title.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query) ||
        ticket.domain?.toLowerCase().includes(query) ||
        ticket.writer?.nickname?.toLowerCase().includes(query) ||
        ticket.status.toLowerCase().includes(query) ||
        ticket.priority.toLowerCase().includes(query) ||
        (ticket.backlogNumber && ticket.backlogNumber.toString().includes(query))
      );
    });
  };

  const getTicketsByDomain = (domain: string) => {
    return tickets.filter((ticket) => ticket.domain === domain);
  };

  const getUniqueDomains = () => {
    const domains = tickets.map(ticket => ticket.domain || '미분류').filter(Boolean);
    return Array.from(new Set(domains));
  };

  const getDomainColumns = () => {
    const domains = getUniqueDomains();
    return domains.map(domain => ({
      id: domain,
      title: domain,
      color: getDomainColor(domain),
    }));
  };

  const getDomainColor = (domain: string) => {
    const colors: { [key: string]: string } = {
      '프론트엔드': '#3b82f6',
      '백엔드': '#10b981',
      '디자인': '#f59e0b',
      '인프라': '#8b5cf6',
      'QA': '#ec4899',
      '미분류': '#94a3b8',
    };
    return colors[domain] || '#64748b';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return '#ef4444';
      case 'HIGH':
        return '#f59e0b';
      case 'MEDIUM':
        return '#3b82f6';
      case 'LOW':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">보드 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* 헤더 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-indigo-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center hover:bg-white border border-indigo-100 hover:shadow-md transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{boardTitle}</h1>
                <p className="text-xs text-gray-500 mt-1">{tickets.length}개의 티켓</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* 뷰 모드 전환 */}
              <div className="flex bg-white/80 rounded-xl p-1 border border-indigo-100">
                <button
                  onClick={() => setViewMode('status')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'status' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  상태별
                </button>
                <button
                  onClick={() => setViewMode('domain')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'domain' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  도메인별
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  리스트
                </button>
              </div>

              <button
                onClick={handleCreateTicket}
                disabled={creating}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all text-sm font-medium flex items-center disabled:opacity-50"
              >
                {creating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    새 티켓
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      {/* 칸반 보드 */}
      {viewMode === 'list' ? (
        // 리스트 뷰 - 테이블 형태
        <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
          {/* 검색 바 */}
          <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="티켓 검색 (제목, 설명, 도메인, 담당자, 상태, 우선순위, 백로그 번호)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#f8fafc',
                  '&:hover': {
                    bgcolor: '#f1f5f9',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'white',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: '#64748b' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </Box>
                ),
                endAdornment: searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ color: '#64748b' }}
                  >
                    <Close sx={{ fontSize: 18 }} />
                  </IconButton>
                ),
              }}
            />
          </Box>
          
          {getFilteredTickets().length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {searchQuery ? '검색 결과가 없습니다' : '티켓이 없습니다'}
              </Typography>
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  sx={{ mt: 2 }}
                  variant="outlined"
                  size="small"
                >
                  검색 초기화
                </Button>
              )}
            </Box>
          ) : (
            <Box>
              {/* 테이블 헤더 */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 150px 120px 120px 100px 60px',
                  gap: 2,
                  p: 2,
                  bgcolor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  fontWeight: 'bold',
                }}
              >
                <Typography variant="body2" fontWeight="bold" color="text.secondary">
                  제목
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="text.secondary">
                  도메인
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="text.secondary">
                  상태
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="text.secondary">
                  우선순위
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="text.secondary">
                  담당자
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="text.secondary" textAlign="center">
                  작업
                </Typography>
              </Box>

              {/* 테이블 바디 */}
              {getFilteredTickets().map((ticket, index) => (
                <Box
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket)}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 150px 120px 120px 100px 60px',
                    gap: 2,
                    p: 2,
                    cursor: 'pointer',
                    borderBottom: index < tickets.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#f8fafc',
                    },
                  }}
                >
                  {/* 제목 */}
                  <Box>
                    <Typography variant="body1" fontWeight="500" sx={{ mb: 0.5 }}>
                      {ticket.backlogNumber && <span style={{ color: '#888', marginRight: '8px' }}>#{ticket.backlogNumber}</span>}
                      {ticket.title}
                    </Typography>
                    {ticket.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {ticket.description}
                      </Typography>
                    )}
                  </Box>

                  {/* 도메인 */}
                  <Box display="flex" alignItems="center">
                    {ticket.domain ? (
                      <Chip
                        label={ticket.domain}
                        size="small"
                        sx={{
                          bgcolor: getDomainColor(ticket.domain) + '20',
                          color: getDomainColor(ticket.domain),
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </Box>

                  {/* 상태 */}
                  <Box display="flex" alignItems="center">
                    <Chip
                      label={ticket.status}
                      size="small"
                      sx={{
                        bgcolor: COLUMNS.find(c => c.status === ticket.status)?.color + '20' || '#e2e8f0',
                        color: COLUMNS.find(c => c.status === ticket.status)?.color || '#64748b',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>

                  {/* 우선순위 */}
                  <Box display="flex" alignItems="center">
                    {ticket.priority && (
                      <Chip
                        label={ticket.priority}
                        size="small"
                        sx={{
                          bgcolor: getPriorityColor(ticket.priority),
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    )}
                  </Box>

                  {/* 담당자 */}
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {ticket.writer?.nickname || '-'}
                    </Typography>
                  </Box>

                  {/* 삭제 버튼 */}
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('이 티켓을 삭제하시겠습니까?')) {
                          handleDeleteTicketFromCard(ticket.id);
                        }
                      }}
                      sx={{
                        '&:hover': {
                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                        },
                      }}
                    >
                      <Close sx={{ fontSize: 18, color: '#ef4444' }} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {(viewMode === 'status' ? COLUMNS : getDomainColumns()).map((column: any) => {
              const columnTickets = viewMode === 'status' 
                ? getTicketsByStatus(column.status)
                : getTicketsByDomain(column.id);
              const columnKey = column.status || column.id;
              return (
              <div
                key={columnKey}
                className="min-w-[320px] flex-1 bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="text-base font-bold text-gray-800">
                    {column.title}
                  </h3>
                  <span className="ml-auto bg-gradient-to-r from-indigo-50 to-purple-50 px-2 py-1 rounded-full text-xs font-semibold text-indigo-600 border border-indigo-100">
                    {columnTickets.length}
                  </span>
                </div>

                <Droppable droppableId={columnKey}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[100px] rounded-xl transition-colors ${
                        snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-3">
                        {columnTickets.map((ticket, index) => (
                          <Draggable
                            key={ticket.id}
                            draggableId={ticket.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-xl p-4 group relative border ${
                                  snapshot.isDragging 
                                    ? 'border-indigo-400 shadow-2xl cursor-grabbing' 
                                    : 'border-indigo-100 shadow-md hover:shadow-xl hover:border-indigo-300 cursor-grab'
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.95 : 1,
                                  transform: provided.draggableProps.style?.transform || 'none',
                                  userSelect: 'none',
                                  WebkitUserSelect: 'none',
                                  pointerEvents: snapshot.isDragging ? 'none' : 'auto',
                                }}
                                onDoubleClick={() => !snapshot.isDragging && handleTicketClick(ticket)}
                              >
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-bold text-gray-800 flex-1">
                                      {ticket.backlogNumber && <span className="text-gray-400 mr-2 text-xs">#{ticket.backlogNumber}</span>}
                                      {ticket.title}
                                    </h4>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (confirm('이 티켓을 삭제하시겠습니까?')) {
                                          handleDeleteTicketFromCard(ticket.id);
                                        }
                                      }}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded flex-shrink-0"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div>
                                    {ticket.description && (
                                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                        {ticket.description}
                                      </p>
                                    )}
                                    <div className="flex gap-1 flex-wrap mb-2">
                                      {ticket.priority && (
                                        <span
                                          className="px-2 py-0.5 text-xs font-medium rounded text-white"
                                          style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                                        >
                                          {ticket.priority}
                                        </span>
                                      )}
                                      {ticket.domain && (
                                        <span className="px-2 py-0.5 text-xs font-medium rounded border border-gray-300 text-gray-600">
                                          {ticket.domain}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      {ticket.writer?.nickname || '알 수 없음'}
                                    </p>
                                  </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>

                      {columnTickets.length === 0 && (
                        <div className="p-6 text-center bg-white rounded-lg border-2 border-dashed border-gray-200">
                          <p className="text-sm text-gray-400">티켓이 없습니다</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
          </div>
        </DragDropContext>
      )}

      {/* 티켓 상세 슬라이드 패널 */}
      {isDrawerOpen && (
        <>
          {/* 배경 오버레이 - 블러 효과 */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={handleCloseDrawer}
          />
          
          {/* 슬라이드 패널 */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-[750px] bg-gradient-to-br from-white to-gray-50 shadow-2xl z-50 transform transition-all duration-500 ease-out animate-slideInRight">
            {selectedTicket && (
              <div className="h-full flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200/80 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">티켓 상세</h2>
                      <p className="text-xs text-gray-500">#{selectedTicket.backlogNumber || '할당 중'}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseDrawer}
                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-all hover:rotate-90 duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 컨텐츠 */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                  {/* 제목 */}
                  <div className="mb-8">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      placeholder="제목을 입력하세요..."
                      className="w-full text-3xl font-bold border-none outline-none focus:ring-0 bg-transparent text-gray-900 placeholder-gray-300"
                    />
                  </div>

                  {/* 속성 영역 */}
                  <div className="mb-8 bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/60 shadow-lg space-y-2">
                    {/* Backlog Number */}
                    <div className="flex items-center p-3.5 hover:bg-indigo-50/60 rounded-xl transition-all group border border-transparent hover:border-indigo-200/50">
                      <div className="flex items-center min-w-[160px] text-gray-700">
                        <span className="text-sm font-bold flex items-center gap-2.5">
                          <span className="text-xl">🔢</span>
                          BacklogNumber
                        </span>
                      </div>
                      <span className="text-base text-gray-900 font-bold px-4 py-1.5 bg-gradient-to-r from-indigo-100 to-indigo-50 rounded-lg shadow-sm">
                        {selectedTicket.backlogNumber ? `#${selectedTicket.backlogNumber}` : '할당 중...'}
                      </span>
                    </div>

                    {/* Domain */}
                    <div className="flex items-center p-3.5 hover:bg-purple-50/60 rounded-xl transition-all group border border-transparent hover:border-purple-200/50">
                      <div className="flex items-center min-w-[160px] text-gray-700">
                        <span className="text-sm font-bold flex items-center gap-2.5">
                          <span className="text-xl">⭕</span>
                          Domain
                        </span>
                      </div>
                      <input
                        type="text"
                        value={editedDomain}
                        onChange={(e) => setEditedDomain(e.target.value)}
                        placeholder="도메인 입력"
                        className="flex-1 text-base border-none outline-none focus:ring-0 bg-transparent text-gray-900 font-bold placeholder-gray-400"
                      />
                    </div>

                    {/* Priority */}
                    <div className="flex items-center p-3.5 hover:bg-orange-50/60 rounded-xl transition-all group border border-transparent hover:border-orange-200/50">
                      <div className="flex items-center min-w-[160px] text-gray-700">
                        <span className="text-sm font-bold flex items-center gap-2.5">
                          <span className="text-xl">☰</span>
                          Priority
                        </span>
                      </div>
                      <select
                        value={editedPriority}
                        onChange={(e) => setEditedPriority(e.target.value as TicketPriority)}
                        className="flex-1 text-base border-none outline-none focus:ring-0 bg-transparent cursor-pointer text-gray-900 font-bold"
                      >
                        <option value="LOW">낮음</option>
                        <option value="MEDIUM">보통</option>
                        <option value="HIGH">높음</option>
                        <option value="URGENT">긴급</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="flex items-center p-3.5 hover:bg-blue-50/60 rounded-xl transition-all group border border-transparent hover:border-blue-200/50">
                      <div className="flex items-center min-w-[160px] text-gray-700">
                        <span className="text-sm font-bold flex items-center gap-2.5">
                          <span className="text-xl">⭕</span>
                          Status
                        </span>
                      </div>
                      <select
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value as TicketStatus)}
                        className="flex-1 text-base border-none outline-none focus:ring-0 bg-transparent cursor-pointer text-gray-900 font-bold"
                      >
                        <option value="BACKLOG">Backlog</option>
                        <option value="SPRINT_TERM">Sprint Term</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="DONE">Done</option>
                        <option value="ADDITIONAL_WORK">Additional Work</option>
                        <option value="BLOCKED">Blocked</option>
                      </select>
                    </div>

                    {/* 담당자 */}
                    <div className="flex items-center p-3.5 hover:bg-green-50/60 rounded-xl transition-all group border border-transparent hover:border-green-200/50">
                      <div className="flex items-center min-w-[160px] text-gray-700">
                        <span className="text-sm font-bold flex items-center gap-2.5">
                          <span className="text-xl">👤</span>
                          담당자
                        </span>
                      </div>
                      <select
                        value={editedAssignee || selectedTicket.writer?.id || ''}
                        onChange={(e) => setEditedAssignee(Number(e.target.value))}
                        className="flex-1 text-base border-none outline-none focus:ring-0 bg-transparent cursor-pointer text-gray-900 font-bold"
                      >
                        <option value="" disabled>담당자 선택</option>
                        {teamMembers.length > 0 ? (
                          teamMembers.map((member) => {
                            const displayName = memberNicknames.get(member.accountId) || `User #${member.accountId}`;
                            return (
                              <option key={member.id} value={member.accountId}>
                                {displayName} {member.role === 'LEADER' && '👑'}
                              </option>
                            );
                          })
                        ) : (
                          <option value={Number(localStorage.getItem('accountId'))}>
                            {localStorage.getItem('nickname') || 'Me'}
                          </option>
                        )}
                      </select>
                    </div>

                    {/* 생성일 */}
                    <div className="flex items-center p-3.5 hover:bg-gray-50/60 rounded-xl transition-all group border border-transparent hover:border-gray-200/50">
                      <div className="flex items-center min-w-[160px] text-gray-700">
                        <span className="text-sm font-bold flex items-center gap-2.5">
                          <span className="text-xl">🕐</span>
                          생성일
                        </span>
                      </div>
                      <span className="text-base text-gray-900 font-bold">
                        {new Date(selectedTicket.createDate).toLocaleString('ko-KR')}
                      </span>
                    </div>

                    {/* 생성자 */}
                    <div className="flex items-center p-3.5 hover:bg-gray-50/60 rounded-xl transition-all group border border-transparent hover:border-gray-200/50">
                      <div className="flex items-center min-w-[160px] text-gray-700">
                        <span className="text-sm font-bold flex items-center gap-2.5">
                          <span className="text-xl">😀</span>
                          생성자
                        </span>
                      </div>
                      <span className="text-base text-gray-900 font-bold">
                        {selectedTicket.writer?.nickname || '알 수 없음'}
                      </span>
                    </div>
                  </div>

                  {/* 설명 영역 */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
                        설명
                      </h3>
                      <div className="flex gap-2">
                        {githubOwner && githubRepo && (
                          <button
                            onClick={handleGenerateBacklog}
                            disabled={generatingBacklog}
                            className="px-3 py-1.5 text-xs font-semibold border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                          >
                            {generatingBacklog ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent"></div>
                                AI 백로그 생성 중...
                              </>
                            ) : (
                              <>🤖 AI 백로그 추가</>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => setIsEditingDescription(!isEditingDescription)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          {isEditingDescription ? '미리보기' : '편집'}
                        </button>
                      </div>
                    </div>
                    
                    {isEditingDescription ? (
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="마크다운 형식으로 내용을 입력하세요..."
                        rows={15}
                        className="w-full text-sm leading-relaxed font-mono bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-gray-200/50 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 resize-none shadow-sm transition-all"
                      />
                    ) : (
                      <div 
                        onClick={() => setIsEditingDescription(true)}
                        className="min-h-[200px] p-5 cursor-text hover:bg-white/60 bg-white/40 backdrop-blur-sm rounded-xl border border-gray-200/50 transition-all shadow-sm"
                      >
                        {editedDescription ? (
                          <div className="prose prose-sm max-w-none">
                            <MarkdownRenderer content={editedDescription} />
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">내용을 입력하세요...</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 my-6"></div>

                  {/* GitHub 커밋 연동 */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold text-gray-800 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        GitHub 커밋 연동
                      </h3>
                    </div>
                    
                    {!githubOwner || !githubRepo ? (
                      <div className="p-4 bg-orange-50 rounded-lg mb-4">
                        <p className="text-sm text-gray-600">
                          ⚠️ 프로젝트에 GitHub 저장소가 연동되어 있지 않습니다. 프로젝트 설정에서 GitHub 저장소를 먼저 연동해주세요.
                        </p>
                      </div>
                    ) : (
                  <>
                  
                      {/* 연결된 커밋 표시 */}
                      {selectedCommit ? (
                        <div className="p-4 bg-green-50 rounded-lg mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-bold text-green-700">
                              ✓ 연결된 커밋
                            </p>
                            <button
                              onClick={() => setSelectedCommit(null)}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              연결 해제
                            </button>
                          </div>
                          <p className="text-sm font-medium mb-1">
                            {selectedCommit.message.split('\n')[0]}
                          </p>
                          <p className="text-xs text-gray-500">
                            SHA: {selectedCommit.sha.substring(0, 7)}
                          </p>
                          {selectedCommit.url && (
                            <button
                              onClick={() => window.open(selectedCommit.url, '_blank')}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              GitHub에서 보기
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="mb-4">
                          <button
                            onClick={() => {
                              setShowCommitSearch(!showCommitSearch);
                              if (!showCommitSearch && githubCommits.length === 0) {
                                loadGithubCommits();
                              }
                            }}
                            className="w-full px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {showCommitSearch ? '커밋 검색 닫기' : '커밋 연결하기'}
                          </button>
                        </div>
                      )}
                  
                  {/* 커밋 검색 및 선택 */}
                  {showCommitSearch && !selectedCommit && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          커밋을 선택하세요
                        </Typography>
                        <Button 
                          size="small" 
                          onClick={loadGithubCommits}
                          disabled={loadingCommits}
                        >
                          {loadingCommits ? <CircularProgress size={16} /> : '새로고침'}
                        </Button>
                      </Box>
                      
                      {/* 검색창 */}
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="커밋 메시지, 작성자, SHA로 검색..."
                        value={commitSearchQuery}
                        onChange={(e) => setCommitSearchQuery(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                              🔍
                            </Box>
                          ),
                        }}
                      />
                      
                      {loadingCommits ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : githubCommits.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                          커밋 내역이 없습니다
                        </Typography>
                      ) : filteredCommits.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                          검색 결과가 없습니다
                        </Typography>
                      ) : (
                        <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          {filteredCommits.map((commit) => (
                            <Box
                              key={commit.sha}
                              sx={{
                                p: 2,
                                borderBottom: '1px solid #f0f0f0',
                                '&:hover': { bgcolor: '#f7f7f7' },
                                cursor: 'pointer',
                                '&:last-child': { borderBottom: 'none' }
                              }}
                              onClick={() => {
                                setSelectedCommit(commit);
                                setShowCommitSearch(false);
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                                {commit.message.split('\n')[0]}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {commit.author.name} • {new Date(commit.author.date).toLocaleString('ko-KR')} • {commit.sha.substring(0, 7)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                  </>
                )}
                  </div>

                  <div className="border-t border-gray-200 my-6"></div>

                  {/* 댓글 섹션 */}
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
                      댓글 ({comments.length})
                    </h3>

                    {/* 댓글 목록 */}
                    <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                      {loadingComments ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-indigo-600"></div>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p className="text-sm">아직 댓글이 없습니다.</p>
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:border-indigo-200 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {comment.writer.nickname.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{comment.writer.nickname}</p>
                                  <p className="text-xs text-gray-500">{new Date(comment.createDate).toLocaleString('ko-KR')}</p>
                                </div>
                              </div>
                              {localStorage.getItem('nickname') === comment.writer.nickname && (
                                <div className="flex gap-2">
                                  {editingCommentId === comment.id ? (
                                    <>
                                      <button
                                        onClick={() => handleUpdateComment(comment.id)}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                      >
                                        저장
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(null);
                                          setEditingCommentContent('');
                                        }}
                                        className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                                      >
                                        취소
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(comment.id);
                                          setEditingCommentContent(comment.content);
                                        }}
                                        className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                                      >
                                        수정
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                                      >
                                        삭제
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            {editingCommentId === comment.id ? (
                              <textarea
                                value={editingCommentContent}
                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none resize-none"
                                rows={3}
                              />
                            ) : (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* 댓글 작성 */}
                    <div className="flex gap-2">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 입력하세요..."
                        className="flex-1 text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none resize-none"
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            handleCreateComment();
                          }
                        }}
                      />
                      <button
                        onClick={handleCreateComment}
                        disabled={submittingComment || !newComment.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-fit"
                      >
                        {submittingComment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            전송
                          </>
                        ) : (
                          '댓글 작성'
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">팁: Ctrl/Cmd + Enter로 빠르게 댓글을 작성할 수 있습니다.</p>
                  </div>
                </div>

                {/* 하단 버튼 */}
                <div className="px-8 py-5 border-t border-gray-200/80 bg-white/80 backdrop-blur-sm flex justify-between items-center">
                  <button
                    onClick={handleDeleteTicket}
                    disabled={saving}
                    className="px-5 py-2.5 text-sm font-semibold text-red-600 border-2 border-red-200 bg-red-50 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all disabled:opacity-50 shadow-sm"
                  >
                    삭제
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseDrawer}
                      disabled={saving}
                      className="px-5 py-2.5 text-sm font-semibold text-gray-700 border-2 border-gray-200 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm"
                    >
                      닫기
                    </button>
                    <button
                      onClick={handleSaveTicket}
                      disabled={saving || !editedTitle.trim()}
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/30"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          저장 중...
                        </>
                      ) : (
                        '저장'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default KanbanBoardPage;
