import axios from 'axios';

/**
 * 백엔드 인증 API를 호출하여 사용자 인증 상태를 확인합니다.
 * @returns {Promise<boolean>} 인증 성공 시 true, 실패 시 false
 */
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    const userToken = localStorage.getItem('userToken');
    
    if (!userToken) {
      return false;
    }

    const response = await axios.get(
      `${import.meta.env.VITE_ACCOUNT_API_URL || 'http://localhost:8001'}/authentication/authenticate`,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
        timeout: 5000,
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error('인증 확인 실패:', error);
    return false;
  }
};

/**
 * 백엔드 로그아웃 API를 호출합니다.
 * @returns {Promise<boolean>} 로그아웃 성공 시 true, 실패 시 false
 */
export const logout = async (): Promise<boolean> => {
  try {
    const userToken = localStorage.getItem('userToken');
    
    if (!userToken) {
      return true; // 토큰이 없으면 이미 로그아웃 상태
    }

    const response = await axios.post(
      `${import.meta.env.VITE_ACCOUNT_API_URL || 'http://localhost:8001'}/authentication/logout`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
        timeout: 5000,
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    return false;
  }
};
