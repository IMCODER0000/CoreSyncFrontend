import { hrApi } from './hrApi';

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
  id?: number;
  projectId?: number;
  title: string;
  teamId: number;
  writerNickname: string;
}

export const teamApi = {
  // 팀 목록 조회 (hr_service)
  getTeamList: async (): Promise<TeamListResponse> => {
    console.log('[teamApi] getTeamList 호출');
    const hrTeams = await hrApi.getTeamList();
    console.log('[teamApi] hrApi.getTeamList 응답:', hrTeams);
    console.log('[teamApi] hrTeams 타입:', typeof hrTeams);
    console.log('[teamApi] hrTeams 길이:', Array.isArray(hrTeams) ? hrTeams.length : 'not array');
    
    // hr_service의 TeamResponse를 Team 타입으로 변환
    const teams: Team[] = hrTeams.map(hrTeam => ({
      id: hrTeam.id,
      name: hrTeam.name,
      projects: [] // hr_service에는 projects 정보가 없으므로 빈 배열
    }));
    console.log('[teamApi] 변환된 teams:', teams);
    return { teams };
  },

  // 팀 생성 (hr_service)
  createTeam: async (data: CreateTeamRequest): Promise<CreateTeamResponse> => {
    const response = await hrApi.createTeam(data);
    return response;
  },

  // 팀 프로젝트 생성 (hr_service -> agile_service)
  createTeamProject: async (teamId: number, data: CreateTeamProjectRequest): Promise<CreateTeamProjectResponse> => {
    const response = await hrApi.createTeamProject(teamId, data);
    return response;
  },

  // 팀 멤버 초대 (hr_service)
  inviteMember: async (teamId: number, email: string): Promise<{ message: string }> => {
    const response = await hrApi.inviteMember(teamId, email);
    return response;
  },

  // 팀 탈퇴 (hr_service)
  leaveTeam: async (teamId: number): Promise<{ message: string }> => {
    const response = await hrApi.leaveTeam(teamId);
    return response;
  },
};
