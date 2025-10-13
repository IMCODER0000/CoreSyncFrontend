import axiosInstance from './axiosInstance';

export interface Project {
  id: number;
  name: string;
}

export interface Team {
  id: number;
  name: string;
  projects: Project[];
}

export interface TeamListResponse {
  teams: Team[];
}

export interface CreateTeamRequest {
  name: string;
}

export interface CreateTeamResponse {
  name: string;
}

export interface CreateTeamProjectRequest {
  title: string;
}

export interface CreateTeamProjectResponse {
  projectId: number;
  title: string;
  teamId: number;
  writerNickname: string;
}

export const teamApi = {
  // 팀 목록 조회
  getTeamList: async (): Promise<TeamListResponse> => {
    const response = await axiosInstance.get('/api/team/list');
    return response.data;
  },

  // 팀 생성
  createTeam: async (data: CreateTeamRequest): Promise<CreateTeamResponse> => {
    const response = await axiosInstance.post('/api/team/register', data);
    return response.data;
  },

  // 팀 프로젝트 생성
  createTeamProject: async (teamId: number, data: CreateTeamProjectRequest): Promise<CreateTeamProjectResponse> => {
    const response = await axiosInstance.post(`/api/team/${teamId}/project/register`, data);
    return response.data;
  },
};
