import axios from 'axios';

const hrAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_HR_API_URL || 'http://localhost:8003',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export interface AttendanceRecord {
  id: number;
  teamId: number;
  accountId: number;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY';
  workHours?: number;
  note?: string;
  isWorking?: boolean;  // 현재 작업 중인지 여부
  currentSessionStart?: string;  // 현재 세션 시작 시간
}

export interface AnnualLeave {
  id: number;
  teamId: number;
  accountId: number;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
}

export interface LeaveStats {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface DailyWorkTime {
  accountId: number;
  date: string;
  totalSeconds: number;
  totalHours: number;
}

export const attendanceApi = {
  // 일 시작 (출근)
  checkIn: async (teamId: number): Promise<AttendanceRecord> => {
    const response = await hrAxiosInstance.post('/api/attendance/check-in', { teamId });
    return response.data;
  },

  // 일 종료 (퇴근)
  checkOut: async (teamId: number): Promise<AttendanceRecord> => {
    const response = await hrAxiosInstance.post('/api/attendance/check-out', { teamId });
    return response.data;
  },

  // 근태 목록 조회
  getAttendanceList: async (teamId: number, year: number, month: number): Promise<AttendanceRecord[]> => {
    const response = await hrAxiosInstance.get('/api/attendance/list', {
      params: { teamId, year, month }
    });
    return response.data;
  },

  // 오늘의 근태 조회
  getTodayAttendance: async (teamId: number): Promise<AttendanceRecord | null> => {
    const response = await hrAxiosInstance.get('/api/attendance/today', {
      params: { teamId }
    });
    return response.data;
  },

  // 연차 신청
  applyLeave: async (teamId: number, startDate: string, endDate: string, reason: string): Promise<AnnualLeave> => {
    const response = await hrAxiosInstance.post('/api/attendance/leave/apply', {
      teamId,
      startDate,
      endDate,
      reason
    });
    return response.data;
  },

  // 연차 목록 조회
  getLeaveList: async (teamId: number): Promise<AnnualLeave[]> => {
    const response = await hrAxiosInstance.get('/api/attendance/leave/list', {
      params: { teamId }
    });
    return response.data;
  },

  // 연차 통계
  getLeaveStats: async (teamId: number): Promise<LeaveStats> => {
    const response = await hrAxiosInstance.get('/api/attendance/leave/stats', {
      params: { teamId }
    });
    return response.data;
  },

  // 연차 승인/거절
  approveLeave: async (leaveId: number, approved: boolean): Promise<AnnualLeave> => {
    const response = await hrAxiosInstance.post(`/api/attendance/leave/${leaveId}/approve`, {
      approved
    });
    return response.data;
  },

  // 오늘의 총 작업 시간 조회
  getTodayTotalWorkTime: async (): Promise<DailyWorkTime> => {
    const response = await hrAxiosInstance.get('/api/daily-work-time/today');
    return response.data;
  },

  // 팀장용: 팀 전체 연차 신청 목록 조회
  getTeamLeaveList: async (teamId: number): Promise<AnnualLeave[]> => {
    const response = await hrAxiosInstance.get(`/api/attendance/leave/team/${teamId}`);
    return response.data;
  },

  // 팀장용: 특정 팀원의 근태 목록 조회
  getMemberAttendanceList: async (teamId: number, accountId: number, year: number, month: number): Promise<AttendanceRecord[]> => {
    const response = await hrAxiosInstance.get(`/api/attendance/member/${accountId}/list`, {
      params: { teamId, year, month }
    });
    return response.data;
  },
};
