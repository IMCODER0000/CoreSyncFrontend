import { agileAxiosInstance } from './axiosInstance';
import type { CreateProjectRequest, ListProjectResponse, Project, ReadProjectResponse } from './types';

export interface LinkGithubRepositoryRequest {
  repositoryUrl: string;
  repositoryName: string;
  owner: string;
}

export const projectApi = {
  // 프로젝트 생성
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await agileAxiosInstance.post('/project/create', data);
    return response.data;
  },

  // 프로젝트 목록 조회
  getProjectList: async (page: number = 1, perPage: number = 10): Promise<ListProjectResponse> => {
    const response = await agileAxiosInstance.get('/project/list', {
      params: { page, perPage },
    });
    return response.data;
  },

  // 프로젝트 상세 조회
  getProjectDetail: async (id: number, page: number = 1, perPage: number = 10): Promise<ReadProjectResponse> => {
    const response = await agileAxiosInstance.get(`/project/read/${id}`, {
      params: { page, perPage },
    });
    return response.data;
  },

  // 팀 프로젝트 목록 조회
  getTeamProjects: async (teamId: number): Promise<ListProjectResponse> => {
    console.log('[projectApi] getTeamProjects 호출 - teamId:', teamId);
    try {
      const response = await agileAxiosInstance.get(`/project/team/${teamId}`);
      console.log('[projectApi] getTeamProjects 응답:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[projectApi] getTeamProjects 실패:', error);
      console.error('[projectApi] 에러 응답:', error.response?.data);
      console.error('[projectApi] 에러 상태:', error.response?.status);
      throw error;
    }
  },

  // GitHub 저장소 연동
  linkGithubRepository: async (projectId: number, data: LinkGithubRepositoryRequest): Promise<string> => {
    const response = await agileAxiosInstance.post(`/project/${projectId}/link-github`, data);
    return response.data;
  },

  // 프로젝트 삭제
  deleteProject: async (projectId: number): Promise<string> => {
    const response = await agileAxiosInstance.delete(`/project/${projectId}`);
    return response.data;
  },
};
