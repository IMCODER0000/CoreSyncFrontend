// 프로젝트 관련 타입
export interface Project {
  id: number;
  title: string;
  writer: {
    id: number;
    nickname: string;
  };
  createDate: string;
  updateDate: string;
}

export interface CreateProjectRequest {
  title: string;
  teamId?: number; // 팀 ID (선택사항)
}

export interface ListProjectResponse {
  projectList: any[];
  totalItems: number;
  totalPages: number;
}

export interface ReadProjectResponse {
  projectId: number;
  title: string;
  writerNickname: string;
  agileBoardList: any[];
  totalItems: number;
  totalPages: number;
  githubOwner?: string;
  githubRepositoryName?: string;
  githubRepositoryUrl?: string;
}

// 애자일 보드 관련 타입
export interface AgileBoard {
  id: number;
  title: string;
  projectId: number;
  writer: {
    id: number;
    nickname: string;
  };
  createDate: string;
  updateDate: string;
}

export interface CreateAgileBoardRequest {
  projectId: number;
  title: string;
}

export interface ReadAgileBoardResponse {
  agileBoardId: number;
  projectId: number;
  title: string;
  writerNickname: string;
  kanbanTicketList: any[];
  totalItems: number;
  totalPages: number;
}

// 칸반 티켓 관련 타입
export type TicketStatus = 'BACKLOG' | 'SPRINT_TERM' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'ADDITIONAL_WORK' | 'BLOCKED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Domain은 자유롭게 입력 가능

export interface KanbanTicket {
  id: number;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  domain: string;
  writer: {
    id: number;
    nickname: string;
  };
  agileBoardId: number;
  backlogNumber?: number;
  createDate: string;
  updateDate: string;
  linkedCommitSha?: string;
  linkedCommitMessage?: string;
  linkedCommitUrl?: string;
}

export interface CreateKanbanTicketRequest {
  agileBoardId: number;
  title: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  domain?: string;
}

// 댓글 관련 타입
export interface TicketComment {
  id: number;
  content: string;
  writer: {
    id: number;
    nickname: string;
  };
  ticketId: number;
  createDate: string;
  updateDate: string;
}

export interface CreateCommentRequest {
  ticketId: number;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
