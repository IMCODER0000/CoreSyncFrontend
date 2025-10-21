import { agileAxiosInstance } from './axiosInstance';
import type { TicketComment, CreateCommentRequest, UpdateCommentRequest } from './types';

export const ticketCommentApi = {
  // 티켓의 댓글 목록 조회
  getComments: async (ticketId: number): Promise<TicketComment[]> => {
    const response = await agileAxiosInstance.get(`/ticket-comment/list/${ticketId}`);
    return response.data;
  },

  // 댓글 생성
  createComment: async (data: CreateCommentRequest): Promise<TicketComment> => {
    const response = await agileAxiosInstance.post('/ticket-comment/register', data);
    return response.data;
  },

  // 댓글 수정
  updateComment: async (commentId: number, data: UpdateCommentRequest): Promise<TicketComment> => {
    const response = await agileAxiosInstance.put(`/ticket-comment/modify/${commentId}`, data);
    return response.data;
  },

  // 댓글 삭제
  deleteComment: async (commentId: number): Promise<void> => {
    await agileAxiosInstance.delete(`/ticket-comment/delete/${commentId}`);
  },
};
