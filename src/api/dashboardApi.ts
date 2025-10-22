import axios from 'axios';

const hrAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_HR_API_URL || 'http://localhost:8003',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const agileAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AGILE_API_URL || 'http://localhost:8002',
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

// 토큰 인터셉터
[hrAxiosInstance, agileAxiosInstance, accountAxiosInstance].forEach(instance => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
});

export interface DashboardStats {
  teamCount: number;
  projectCount: number;
  ticketCount: number;
  todayWorkHours: number;
  weekWorkHours: number[];
  leaveStats: {
    totalDays: number;
    usedDays: number;
    remainingDays: number;
  };
  myBacklogCount: number;
  myInProgressCount: number;
}

export const dashboardApi = {
  // 대시보드 통계 조회
  getStats: async (): Promise<DashboardStats> => {
    try {
      // 먼저 팀 정보를 가져옴 (HR Service에서)
      const teamStatsResponse = await accountAxiosInstance.get('/dashboard/team-stats');
      console.log('팀 통계 응답:', teamStatsResponse.data);
      
      // 병렬로 나머지 데이터 조회 (실패해도 계속 진행)
      const [dailyWorkTime, weekWorkTime, projectStats, myTickets] = await Promise.allSettled([
        hrAxiosInstance.get('/api/daily-work-time/today'),
        hrAxiosInstance.get('/api/daily-work-time/week'),
        agileAxiosInstance.get('/api/dashboard/project-stats'),
        agileAxiosInstance.get('/kanban-ticket/my-tickets')
      ]);
      
      const teamStats = teamStatsResponse;
      
      // 연차 통계는 기본값 사용 (teamId가 필요하므로 생략)
      const leaveStats = { data: { totalDays: 15, usedDays: 0, remainingDays: 15 } };

      // 팀 수
      const teamCount = teamStats.data.teamCount || 0;
      console.log('팀 수:', teamCount);

      // 프로젝트 수 (Agile Service가 없으면 0)
      const projectCount = projectStats.status === 'fulfilled' 
        ? (projectStats.value.data.projectCount || 0) 
        : 0;
      
      if (projectStats.status === 'rejected') {
        console.warn('프로젝트 통계 조회 실패 (Agile Service 미실행):', projectStats.reason.message);
      }

      // 티켓 수 (Agile Service가 없으면 0)
      const ticketCount = projectStats.status === 'fulfilled'
        ? (projectStats.value.data.ticketCount || 0)
        : 0;

      // 오늘 작업 시간
      const todayWorkHours = dailyWorkTime.status === 'fulfilled'
        ? (dailyWorkTime.value.data.totalHours || 0)
        : 0;
      
      if (dailyWorkTime.status === 'rejected') {
        console.warn('오늘 작업 시간 조회 실패 (HR Service Redis 연결 문제 가능성):', dailyWorkTime.reason.message);
      }

      // 주간 작업 시간 (서버에서 가져온 데이터)
      const weekWorkHours = [0, 0, 0, 0, 0, 0, 0];
      if (weekWorkTime.status === 'fulfilled' && weekWorkTime.value.data && Array.isArray(weekWorkTime.value.data)) {
        weekWorkTime.value.data.forEach((day: any) => {
          const date = new Date(day.date);
          const dayOfWeek = date.getDay();
          weekWorkHours[dayOfWeek] = day.totalHours || 0;
        });
      } else if (weekWorkTime.status === 'rejected') {
        console.warn('주간 작업 시간 조회 실패 (HR Service Redis 연결 문제 가능성):', weekWorkTime.reason.message);
      }

      // 내 백로그 및 진행 중인 작업 통계
      let myBacklogCount = 0;
      let myInProgressCount = 0;
      
      if (myTickets.status === 'fulfilled' && Array.isArray(myTickets.value.data)) {
        myTickets.value.data.forEach((ticket: any) => {
          if (ticket.status === 'BACKLOG') {
            myBacklogCount++;
          } else if (ticket.status === 'IN_PROGRESS') {
            myInProgressCount++;
          }
        });
      }

      return {
        teamCount,
        projectCount,
        ticketCount,
        todayWorkHours,
        weekWorkHours,
        leaveStats: leaveStats.data,
        myBacklogCount,
        myInProgressCount
      };
    } catch (error) {
      console.error('대시보드 통계 조회 실패:', error);
      // 에러 발생 시 기본값 반환 (팀이 없는 경우 포함)
      return {
        teamCount: 0,
        projectCount: 0,
        ticketCount: 0,
        todayWorkHours: 0,
        weekWorkHours: [0, 0, 0, 0, 0, 0, 0],
        leaveStats: {
          totalDays: 15,
          usedDays: 0,
          remainingDays: 15
        },
        myBacklogCount: 0,
        myInProgressCount: 0
      };
    }
  }
};
