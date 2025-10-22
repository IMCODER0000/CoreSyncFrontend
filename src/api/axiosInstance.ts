import axios, { type AxiosInstance } from 'axios';

// Account Service용 Axios 인스턴스 (인증, 계정, 팀 관련)
const accountAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_ACCOUNT_API_URL || 'http://localhost:8001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agile Service용 Axios 인스턴스 (프로젝트, 애자일보드, 칸반티켓 관련)
const agileAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AGILE_API_URL || 'http://localhost:8002',
  timeout: 120000, // AI 백로그 생성을 위해 120초로 증가
  headers: {
    'Content-Type': 'application/json',
  },
});

// 공통 요청 인터셉터 설정 함수
const setupRequestInterceptor = (instance: AxiosInstance, serviceName: string) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('userToken');
      console.log(`[${serviceName}] 요청:`, config.method?.toUpperCase(), config.url);
      console.log(`[${serviceName}] 토큰:`, token ? token.substring(0, 20) + '...' : 'NONE');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn(`[${serviceName}] ⚠️ 토큰이 없습니다!`);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// 공통 응답 인터셉터 설정 함수
const setupResponseInterceptor = (instance: AxiosInstance, serviceName: string) => {
  instance.interceptors.response.use(
    (response) => {
      console.log(`[${serviceName}] 응답:`, response.config.url, '→', response.status);
      console.log(`[${serviceName}] 응답 데이터:`, response.data);
      return response;
    },
    (error) => {
      console.error(`[${serviceName}] 에러:`, error.config?.url, '→', error.response?.status || error.message);
      console.error(`[${serviceName}] 에러 상세:`, error.response?.data);
      
      if (error.response?.status === 401) {
        // GitHub API 호출인 경우는 로그아웃 처리하지 않음
        const isGithubApi = error.config?.url?.includes('/api/github');
        
        if (!isGithubApi) {
          // 토큰 만료 또는 인증 실패 (GitHub API 제외)
          console.warn('인증 실패 - 로그인 페이지로 이동');
          localStorage.removeItem('userToken');
          window.location.href = '/auth/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

// 인터셉터 적용
setupRequestInterceptor(accountAxiosInstance, 'Account API');
setupRequestInterceptor(agileAxiosInstance, 'Agile API');
setupResponseInterceptor(accountAxiosInstance, 'Account API');
setupResponseInterceptor(agileAxiosInstance, 'Agile API');

// 하위 호환성을 위한 기본 export (Account Service 사용)
export default accountAxiosInstance;

// 개별 export
export { accountAxiosInstance, agileAxiosInstance };
