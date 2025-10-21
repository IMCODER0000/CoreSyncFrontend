import { agileAxiosInstance } from './axiosInstance';
import type { CreateKanbanTicketRequest, KanbanTicket } from './types';

export interface UpdateKanbanTicketRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  domain?: string;
}

export const kanbanTicketApi = {
  // 칸반 티켓 생성
  createKanbanTicket: async (data: CreateKanbanTicketRequest): Promise<KanbanTicket> => {
    const response = await agileAxiosInstance.post('/kanban-ticket/register', data);
    return response.data;
  },

  // 칸반 티켓 수정
  updateKanbanTicket: async (ticketId: number, data: UpdateKanbanTicketRequest): Promise<KanbanTicket> => {
    const response = await agileAxiosInstance.put(`/kanban-ticket/modify/${ticketId}`, data);
    return response.data;
  },

  // 칸반 티켓 삭제
  deleteKanbanTicket: async (ticketId: number): Promise<void> => {
    await agileAxiosInstance.delete(`/kanban-ticket/delete/${ticketId}`);
  },
};
