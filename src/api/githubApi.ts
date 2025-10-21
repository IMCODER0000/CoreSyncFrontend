import { agileAxiosInstance } from './axiosInstance';

export interface GithubRepository {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  isPrivate: boolean;
  owner: string;
}

export interface GithubRepositoryListResponse {
  repositories: GithubRepository[];
}

export interface LinkGithubRepositoryRequest {
  repositoryUrl: string;
  repositoryName: string;
  owner: string;
}

export interface GithubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
}

export const githubApi = {
  // GitHub 저장소 목록 조회
  getRepositories: async (): Promise<GithubRepositoryListResponse> => {
    const response = await agileAxiosInstance.get('/api/github/repositories');
    return response.data;
  },

  // 프로젝트에 GitHub 저장소 연동
  linkRepository: async (projectId: number, data: LinkGithubRepositoryRequest): Promise<string> => {
    const response = await agileAxiosInstance.post(`/project/${projectId}/link-github`, data);
    return response.data;
  },

  // GitHub 커밋 내역 조회 (공개 저장소)
  getCommits: async (owner: string, repo: string, perPage: number = 10): Promise<GithubCommit[]> => {
    const response = await agileAxiosInstance.get(`/api/github/commits/${owner}/${repo}?per_page=${perPage}`);
    return response.data;
  },

  // AI 백로그 생성
  generateBacklog: async (owner: string, repo: string, perPage: number = 30): Promise<string> => {
    const response = await agileAxiosInstance.post(`/api/github/generate-backlog/${owner}/${repo}?per_page=${perPage}`);
    return response.data.backlog;
  },

  // 연결된 커밋 기반 상세 AI 백로그 생성
  generateDetailedBacklog: async (owner: string, repo: string, sha: string): Promise<string> => {
    const response = await agileAxiosInstance.post(`/api/github/generate-detailed-backlog/${owner}/${repo}/${sha}`);
    return response.data.backlog;
  },
};
