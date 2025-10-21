import axios from 'axios';

const hrAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_HR_API_URL || 'http://localhost:8003',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const accountAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_ACCOUNT_API_URL || 'http://localhost:8001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (HR)
hrAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 요청 인터셉터 (Account)
accountAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface TeamUpdateRequest {
  name?: string;
  annualLeaveCount?: number;
  minimumWorkHours?: number;
  description?: string;
}

export interface TeamResponse {
  id: number;
  name: string;
  leaderId: number;
  annualLeaveCount: number;
  minimumWorkHours?: number;
  description: string;
  memberCount: number;
}

export interface TeamMemberResponse {
  id: number;
  accountId: number;
  role: string;
  nickname?: string;
}

export const hrApi = {
  // 팀 목록 조회
  getTeamList: async (): Promise<TeamResponse[]> => {
    const response = await hrAxiosInstance.get('/api/team/list');
    return response.data;
  },

  // 팀 생성
  createTeam: async (data: { name: string }): Promise<TeamResponse> => {
    const response = await hrAxiosInstance.post('/api/team/register', data);
    return response.data;
  },

  // 팀 상세 조회
  getTeam: async (teamId: number): Promise<TeamResponse> => {
    const response = await hrAxiosInstance.get(`/api/team/${teamId}`);
    return response.data;
  },

  // 팀 정보 수정
  updateTeam: async (teamId: number, data: TeamUpdateRequest): Promise<TeamResponse> => {
    const response = await hrAxiosInstance.put(`/api/team/${teamId}`, data);
    return response.data;
  },

  // 팀장 여부 확인
  isTeamLeader: async (teamId: number): Promise<boolean> => {
    const response = await hrAxiosInstance.get(`/api/team/${teamId}/is-leader`);
    return response.data.isLeader;
  },

  // 팀 멤버 목록 조회
  getTeamMembers: async (teamId: number): Promise<TeamMemberResponse[]> => {
    const response = await hrAxiosInstance.get(`/api/team/${teamId}/members`);
    return response.data;
  },

  // 팀 멤버 제거
  removeMember: async (teamId: number, memberId: number): Promise<{ message: string }> => {
    const response = await hrAxiosInstance.delete(`/api/team/${teamId}/member/${memberId}`);
    return response.data;
  },

  // 팀 프로젝트 생성
  createTeamProject: async (teamId: number, data: { title: string }): Promise<any> => {
    const response = await hrAxiosInstance.post(`/api/team/${teamId}/project/register`, data);
    return response.data;
  },

  // 팀 멤버 초대
  inviteMember: async (teamId: number, email: string): Promise<{ message: string }> => {
    const response = await hrAxiosInstance.post(`/api/team/${teamId}/invite`, { email });
    return response.data;
  },

  // 팀 삭제 (팀장만 가능)
  deleteTeam: async (teamId: number): Promise<{ message: string }> => {
    const response = await hrAxiosInstance.delete(`/api/team/${teamId}`);
    return response.data;
  },

  // 팀 탈퇴
  leaveTeam: async (teamId: number): Promise<{ message: string }> => {
    const response = await hrAxiosInstance.post(`/api/team/${teamId}/leave`);
    return response.data;
  },

  // 사용자 닉네임 조회 (account_service)
  getNickname: async (accountId: number): Promise<string> => {
    const response = await accountAxiosInstance.get(`/api/account/${accountId}/nickname`);
    return response.data.nickname || response.data;
  },
};
