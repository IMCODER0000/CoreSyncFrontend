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
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/authentication/authenticate`,
      {
        headers: {
          'AuthenticationHeader': `Bearer ${userToken}`,
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
