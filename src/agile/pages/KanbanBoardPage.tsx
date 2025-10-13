import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { agileBoardApi } from '../../api/agileBoardApi';
import { kanbanTicketApi } from '../../api/kanbanTicketApi';
import type { KanbanTicket, TicketStatus, TicketPriority } from '../../api/types';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  CircularProgress,
  IconButton,
  Breadcrumbs,
  Link,
  Chip,
  Select,
  MenuItem,
  Drawer,
  Divider,
} from '@mui/material';
import { Add, ArrowBack, Close } from '@mui/icons-material';

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
  const [boardTitle, setBoardTitle] = useState('');
  const [tickets, setTickets] = useState<KanbanTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<KanbanTicket | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 폼 데이터 상태
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedStatus, setEditedStatus] = useState<TicketStatus>('BACKLOG');
  const [editedPriority, setEditedPriority] = useState<TicketPriority>('MEDIUM');
  const [editedDomain, setEditedDomain] = useState('');
  
  // 뷰 모드 상태
  type ViewMode = 'status' | 'domain' | 'list';
  const [viewMode, setViewMode] = useState<ViewMode>('status');

  useEffect(() => {
    if (boardId) {
      loadBoardDetail();
    }
  }, [boardId]);

  const loadBoardDetail = async () => {
    try {
      setLoading(true);
      const response = await agileBoardApi.getAgileBoardDetail(Number(boardId));
      console.log('보드 상세 API 응답:', response);
      setBoardTitle(response.title || '보드');
      // kanbanTicketList를 KanbanTicket 타입으로 변환
      const ticketList = (response.kanbanTicketList || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status || 'BACKLOG',
        priority: item.priority || 'MEDIUM',
        domain: item.domain || '',
        writer: {
          id: item.writerId || 0,
          nickname: item.writerNickname || '알 수 없음'
        },
        agileBoardId: Number(boardId),
        createDate: item.createDate,
        updateDate: item.updateDate
      }));
      setTickets(ticketList);
    } catch (error) {
      console.error('보드 상세 로드 실패:', error);
    } finally {
      setLoading(false);
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
      await loadBoardDetail();
      // 생성된 티켓을 바로 열기
      const newTicket: KanbanTicket = {
        id: response.id,
        title: response.title || '제목 없음',
        description: (response as any).description || '',
        status: (response as any).status || 'BACKLOG',
        priority: (response as any).priority || 'MEDIUM',
        domain: (response as any).domain || '',
        writer: {
          id: 0,
          nickname: (response as any).writerNickname || '알 수 없음'
        },
        agileBoardId: Number(boardId),
        createDate: (response as any).createDate || new Date().toISOString(),
        updateDate: (response as any).updateDate || new Date().toISOString()
      };
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
    setIsDrawerOpen(true);
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
    }, 300);
  };

  const handleSaveTicket = async () => {
    if (!selectedTicket) return;

    const updateData = {
      title: editedTitle,
      description: editedDescription,
      status: editedStatus,
      priority: editedPriority,
      domain: editedDomain,
    };

    console.log('Sending update data:', updateData);
    console.log('Priority type:', typeof editedPriority, 'Value:', editedPriority);
    console.log('Status type:', typeof editedStatus, 'Value:', editedStatus);

    try {
      setSaving(true);
      await kanbanTicketApi.updateKanbanTicket(selectedTicket.id, updateData);
      
      // 성공 후 보드 데이터 재조회
      await loadBoardDetail();
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Box mb={3}>
        <Breadcrumbs>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/agile/projects')}
            sx={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            프로젝트
          </Link>
          <Typography color="text.primary">{boardTitle}</Typography>
        </Breadcrumbs>
      </Box>

      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" flex={1}>
          {boardTitle}
        </Typography>
        
        {/* 뷰 모드 전환 버튼 */}
        <Box display="flex" gap={1} sx={{ bgcolor: 'white', borderRadius: 1, p: 0.5 }}>
          <Button
            size="small"
            variant={viewMode === 'status' ? 'contained' : 'text'}
            onClick={() => setViewMode('status')}
            sx={{ minWidth: 80 }}
          >
            상태별
          </Button>
          <Button
            size="small"
            variant={viewMode === 'domain' ? 'contained' : 'text'}
            onClick={() => setViewMode('domain')}
            sx={{ minWidth: 80 }}
          >
            도메인별
          </Button>
          <Button
            size="small"
            variant={viewMode === 'list' ? 'contained' : 'text'}
            onClick={() => setViewMode('list')}
            sx={{ minWidth: 80 }}
          >
            리스트
          </Button>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTicket}
          disabled={creating}
          sx={{
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' },
          }}
        >
          {creating ? <CircularProgress size={24} /> : '새 티켓'}
        </Button>
      </Box>

      {/* 칸반 보드 */}
      {viewMode === 'list' ? (
        // 리스트 뷰 - 테이블 형태
        <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
          {tickets.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                티켓이 없습니다
              </Typography>
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
              {tickets.map((ticket, index) => (
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
          <Box display="flex" gap={3} sx={{ overflowX: 'auto', pb: 2 }}>
            {(viewMode === 'status' ? COLUMNS : getDomainColumns()).map((column: any) => {
              const columnTickets = viewMode === 'status' 
                ? getTicketsByStatus(column.status)
                : getTicketsByDomain(column.id);
              const columnKey = column.status || column.id;
              return (
              <Box
                key={columnKey}
                sx={{
                  minWidth: 320,
                  flex: 1,
                  bgcolor: '#f1f5f9',
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: column.color,
                    }}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    {column.title}
                  </Typography>
                  <Chip
                    label={columnTickets.length}
                    size="small"
                    sx={{ ml: 'auto', bgcolor: 'white' }}
                  />
                </Box>

                <Droppable droppableId={columnKey}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: 100,
                        bgcolor: snapshot.isDraggingOver ? '#e2e8f0' : 'transparent',
                        borderRadius: 1,
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <Box display="flex" flexDirection="column" gap={2}>
                        {columnTickets.map((ticket, index) => (
                          <Draggable
                            key={ticket.id}
                            draggableId={ticket.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  cursor: 'grab',
                                  transition: 'all 0.2s',
                                  position: 'relative',
                                  bgcolor: snapshot.isDragging ? '#f8fafc' : 'white',
                                  boxShadow: snapshot.isDragging ? 6 : 1,
                                  transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                  '&:hover': {
                                    boxShadow: 4,
                                  },
                                  '&:hover .delete-button': {
                                    opacity: 1,
                                  },
                                }}
                              >
                                <CardContent onClick={() => handleTicketClick(ticket)}>
                                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                    <Typography variant="subtitle1" fontWeight="bold" flex={1}>
                                      {ticket.title}
                                    </Typography>
                                    <IconButton
                                      className="delete-button"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('이 티켓을 삭제하시겠습니까?')) {
                                          handleDeleteTicketFromCard(ticket.id);
                                        }
                                      }}
                                      sx={{
                                        opacity: 0,
                                        transition: 'opacity 0.2s',
                                        padding: '4px',
                                        '&:hover': {
                                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                                        },
                                      }}
                                    >
                                      <Close sx={{ fontSize: 16, color: '#ef4444' }} />
                                    </IconButton>
                                  </Box>
                                  {ticket.description && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      mb={2}
                                      sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                      }}
                                    >
                                      {ticket.description}
                                    </Typography>
                                  )}
                                  <Box display="flex" gap={1} flexWrap="wrap">
                                    {ticket.priority && (
                                      <Chip
                                        label={ticket.priority}
                                        size="small"
                                        sx={{
                                          bgcolor: getPriorityColor(ticket.priority),
                                          color: 'white',
                                          fontSize: '0.7rem',
                                        }}
                                      />
                                    )}
                                    {ticket.domain && (
                                      <Chip
                                        label={ticket.domain}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </Box>
                                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                    {ticket.writer?.nickname || '알 수 없음'}
                                  </Typography>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>

                      {columnTickets.length === 0 && (
                        <Box
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            color: 'text.secondary',
                            bgcolor: 'white',
                            borderRadius: 1,
                            border: '2px dashed #e2e8f0',
                          }}
                        >
                          <Typography variant="body2">티켓이 없습니다</Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Droppable>
              </Box>
            );
          })}
        </Box>
      </DragDropContext>
      )}

      {/* 티켓 상세 Drawer - Notion 스타일 */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 700 },
            bgcolor: '#ffffff',
          },
        }}
      >
        {selectedTicket && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 헤더 */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #e0e0e0' }}>
              <IconButton onClick={handleCloseDrawer} size="small">
                <Close />
              </IconButton>
            </Box>

            {/* 컨텐츠 */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
              {/* 제목 */}
              <TextField
                fullWidth
                variant="standard"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="제목 없음"
                InputProps={{
                  disableUnderline: true,
                  style: { 
                    fontSize: '2rem', 
                    fontWeight: 'bold',
                    marginBottom: '24px'
                  },
                }}
              />

              {/* 속성 영역 */}
              <Box sx={{ mb: 4 }}>
                {/* Domain */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, '&:hover': { bgcolor: '#f7f7f7' }, p: 1, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150, color: '#787774' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>⭕ Domain</Typography>
                  </Box>
                  <TextField
                    fullWidth
                    variant="standard"
                    value={editedDomain}
                    onChange={(e) => setEditedDomain(e.target.value)}
                    placeholder="도메인 입력"
                    InputProps={{
                      disableUnderline: true,
                      style: { fontSize: '0.875rem' }
                    }}
                  />
                </Box>

                {/* Priority */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, '&:hover': { bgcolor: '#f7f7f7' }, p: 1, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150, color: '#787774' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>☰ Priority</Typography>
                  </Box>
                  <Select
                    value={editedPriority}
                    onChange={(e) => setEditedPriority(e.target.value as TicketPriority)}
                    variant="standard"
                    disableUnderline
                    sx={{ fontSize: '0.875rem', flex: 1 }}
                  >
                    <MenuItem value="LOW">낮음</MenuItem>
                    <MenuItem value="MEDIUM">보통</MenuItem>
                    <MenuItem value="HIGH">높음</MenuItem>
                    <MenuItem value="URGENT">긴급</MenuItem>
                  </Select>
                </Box>

                {/* Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, '&:hover': { bgcolor: '#f7f7f7' }, p: 1, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150, color: '#787774' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>⭕ Status</Typography>
                  </Box>
                  <Select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value as TicketStatus)}
                    variant="standard"
                    disableUnderline
                    sx={{ fontSize: '0.875rem', flex: 1 }}
                  >
                    <MenuItem value="BACKLOG">Backlog</MenuItem>
                    <MenuItem value="SPRINT_TERM">Sprint Term</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="REVIEW">Review</MenuItem>
                    <MenuItem value="DONE">Done</MenuItem>
                    <MenuItem value="ADDITIONAL_WORK">Additional Work</MenuItem>
                    <MenuItem value="BLOCKED">Blocked</MenuItem>
                  </Select>
                </Box>

                {/* 담당자 */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, '&:hover': { bgcolor: '#f7f7f7' }, p: 1, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150, color: '#787774' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>👤 담당자</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {selectedTicket.writer?.nickname || '알 수 없음'}
                  </Typography>
                </Box>

                {/* 생성일 */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, '&:hover': { bgcolor: '#f7f7f7' }, p: 1, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150, color: '#787774' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>🕐 생성일</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#787774' }}>
                    {new Date(selectedTicket.createDate).toLocaleString('ko-KR')}
                  </Typography>
                </Box>

                {/* 생성자 */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, '&:hover': { bgcolor: '#f7f7f7' }, p: 1, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150, color: '#787774' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>😀 생성자</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {selectedTicket.writer?.nickname || '알 수 없음'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* 설명 영역 */}
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  variant="standard"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="내용을 입력하세요..."
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: '0.95rem', lineHeight: 1.6 }
                  }}
                />
              </Box>
            </Box>

            {/* 하단 버튼 */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1, justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                color="error"
                onClick={handleDeleteTicket}
                disabled={saving}
                size="small"
              >
                삭제
              </Button>
              <Box display="flex" gap={1}>
                <Button variant="outlined" onClick={handleCloseDrawer} disabled={saving} size="small">
                  닫기
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleSaveTicket}
                  disabled={saving || !editedTitle.trim()}
                  size="small"
                >
                  {saving ? <CircularProgress size={20} /> : '저장'}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default KanbanBoardPage;
