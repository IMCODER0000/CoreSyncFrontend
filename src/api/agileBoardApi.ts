import axiosInstance from './axiosInstance';
import type { CreateAgileBoardRequest, ReadAgileBoardResponse, AgileBoard } from './types';

export const agileBoardApi = {
  // 애자일 보드 생성
  createAgileBoard: async (data: CreateAgileBoardRequest): Promise<AgileBoard> => {
    const response = await axiosInstance.post('/agile-board/register', data);
    return response.data;
  },

  // 애자일 보드 상세 조회 (티켓 포함)
  getAgileBoardDetail: async (
    id: number,
    page: number = 1,
    perPage: number = 100
  ): Promise<ReadAgileBoardResponse> => {
    const response = await axiosInstance.get(`/agile-board/read/${id}`, {
      params: { page, perPage },
    });
    return response.data;
  },
};
