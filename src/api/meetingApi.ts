import axios from 'axios';

const meetingAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_MEETING_API_URL || 'http://localhost:8004',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 인터셉터
meetingAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface MeetingTemplateColumn {
  key: string;
  label: string;
  badgeClass?: string | null;
}

export interface MeetingTemplate {
  id: string;
  title: string;
  columns?: MeetingTemplateColumn[];
}

export interface ReadMeetingResponse {
  publicId: string;
  title: string;
  start: string | Date;
  end: string | Date;
  allDay?: boolean;
  noteContent?: string;
  meetingVersion?: number;
  participantList?: Array<{
    nickname?: string;
    name?: string;
    displayName?: string;
  }>;
  teamList?: Array<{
    name?: string;
    teamName?: string;
  }>;
}

export interface CreateMeetingPayload {
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
}

export interface UpdateMeetingPayload {
  title?: string;
  start?: string;
  end?: string;
  allDay?: boolean;
  meetingVersion?: number;
  content?: string;
}

export interface MeetingListItem {
  publicId: string;
  title: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  locked: boolean;
}

export interface MeetingListResponse {
  items: MeetingListItem[];
  totalItems: number;
  totalPages: number;
  page?: number;
  perPage?: number;
}

export const meetingApi = {
  // 미팅 템플릿 목록 조회
  getMeetingTemplateList: async (): Promise<MeetingTemplate[]> => {
    try {
      const response = await meetingAxiosInstance.get('/meeting/templates');
      return response.data;
    } catch (error) {
      console.error('미팅 템플릿 목록 조회 실패:', error);
      // 기본 템플릿 반환
      return [
        { id: 'standup', title: '스탠드업 미팅' },
        { id: '4ls', title: '4Ls 회고' },
        { id: 'kpt', title: 'KPT 회고' },
      ];
    }
  },

  // 특정 미팅 템플릿 조회
  getMeetingTemplate: async (templateId: string): Promise<MeetingTemplate> => {
    try {
      const response = await meetingAxiosInstance.get(`/meeting/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('미팅 템플릿 조회 실패:', error);
      // 기본 템플릿 반환
      return getDefaultTemplate(templateId);
    }
  },

  // 미팅 상세 조회
  getMeetingDetail: async (meetingId: string): Promise<ReadMeetingResponse> => {
    const response = await meetingAxiosInstance.get(`/meeting/${meetingId}`);
    return response.data;
  },

  // 미팅 생성
  createMeeting: async (payload: CreateMeetingPayload): Promise<ReadMeetingResponse> => {
    const response = await meetingAxiosInstance.post('/meeting', payload);
    return response.data;
  },

  // 미팅 수정
  updateMeeting: async (meetingId: string, payload: UpdateMeetingPayload): Promise<ReadMeetingResponse> => {
    const response = await meetingAxiosInstance.patch(`/meeting/${meetingId}`, payload);
    return response.data;
  },

  // 미팅 삭제
  deleteMeeting: async (meetingId: string, options?: { ifMatch?: number }): Promise<void> => {
    const headers: any = {};
    if (options?.ifMatch !== undefined) {
      headers['If-Match'] = options.ifMatch;
    }
    await meetingAxiosInstance.delete(`/meeting/${meetingId}`, { headers });
  },

  // 미팅 목록 조회
  getMeetingList: async (params?: {
    page?: number;
    perPage?: number;
    from?: string;
    to?: string;
  }): Promise<MeetingListResponse> => {
    try {
      const response = await meetingAxiosInstance.get('/meeting', { params });
      return response.data;
    } catch (error) {
      console.error('미팅 목록 조회 실패:', error);
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
      };
    }
  },
};

// 기본 템플릿 정의
function getDefaultTemplate(id: string): MeetingTemplate {
  const templates: Record<string, MeetingTemplate> = {
    standup: {
      id: 'standup',
      title: '스탠드업 미팅',
      columns: [
        { key: 'yesterday', label: '어제 한 일', badgeClass: 'bg-blue-100 text-blue-800' },
        { key: 'today', label: '오늘 할 일', badgeClass: 'bg-green-100 text-green-800' },
        { key: 'blockers', label: '장애물', badgeClass: 'bg-red-100 text-red-800' },
      ],
    },
    '4ls': {
      id: '4ls',
      title: '4Ls 회고',
      columns: [
        { key: 'liked', label: 'Liked (좋았던 점)', badgeClass: 'bg-green-100 text-green-800' },
        { key: 'learned', label: 'Learned (배운 점)', badgeClass: 'bg-blue-100 text-blue-800' },
        { key: 'lacked', label: 'Lacked (부족했던 점)', badgeClass: 'bg-yellow-100 text-yellow-800' },
        { key: 'longed', label: 'Longed for (바라는 점)', badgeClass: 'bg-purple-100 text-purple-800' },
      ],
    },
    kpt: {
      id: 'kpt',
      title: 'KPT 회고',
      columns: [
        { key: 'keep', label: 'Keep (유지할 점)', badgeClass: 'bg-green-100 text-green-800' },
        { key: 'problem', label: 'Problem (문제점)', badgeClass: 'bg-red-100 text-red-800' },
        { key: 'try', label: 'Try (시도할 점)', badgeClass: 'bg-blue-100 text-blue-800' },
      ],
    },
  };

  return templates[id] || { id, title: id };
}
