import axios, {AxiosInstance} from "axios";
import env from "../env.ts";

const ATT_BASE = env.api.VITE_ATT_API_BASE_URL || "http://localhost:8081"; // 근태 서비스 연결

const USER_BASE = env.api.VITE_USER_API_BASE_URL || "http://localhost:8082"; // 사용자 서비스 연결

const LEAVE_BASE = env.api.VITE_LEAVE_API_BASE_URL || "http://localhost:8083"; // 휴가 서비스 연결

const TOKEN_KEY = env.api.VITE_AUTH_TOKEN_KEY || "access_token";


/** 공통 인터셉터 달린 생성기 */
function createApi(baseURL: string): AxiosInstance {
		const api = axios.create({ baseURL, withCredentials: true });

		// 공통 인증 헤더(토큰 쓰는 경우)
		api.interceptors.request.use((config)=> {
				const token = localStorage.getItem(TOKEN_KEY);
				if (token) {
						config.headers = config.headers ?? {};
						config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
		});
		api.interceptors.response.use(
				(res) => res,
				(err) => Promise.reject(err)
		);
		return api;
}

export const attendanceApi = createApi(ATT_BASE); // 근태 MSA
export const userApi = createApi(USER_BASE);       // 유저/프로필 MSA
export const leaveApi = createApi(LEAVE_BASE);       // 유저/프로필 MSA
