import axiosInstance from './axiosInstance';
import type { CreateProjectRequest, ListProjectResponse, Project } from './types';

export const projectApi = {
  // 프로젝트 목록 조회
  getProjectList: async (page: number = 1, perPage: number = 10): Promise<ListProjectResponse> => {
    const response = await axiosInstance.get('/project/list', {
      params: { page, perPage },
    });
    return response.data;
  },

  // 프로젝트 생성
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await axiosInstance.post('/project/register', data);
    return response.data;
  },

  // 프로젝트 상세 조회
  getProjectDetail: async (id: number, page: number = 1, perPage: number = 10) => {
    const response = await axiosInstance.get(`/project/read/${id}`, {
      params: { page, perPage },
    });
    return response.data;
  },

  // 팀 프로젝트 목록 조회
  getTeamProjects: async (teamId: number): Promise<ListProjectResponse> => {
    const response = await axiosInstance.get(`/project/team/${teamId}`);
    return response.data;
  },
};
