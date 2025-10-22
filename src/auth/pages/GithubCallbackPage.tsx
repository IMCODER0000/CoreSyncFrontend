import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const GithubCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      
      if (!code) {
        alert('GitHub 인증에 실패했습니다.');
        navigate('/');
        return;
      }

      try {
        // GitHub 로그인 처리
        const response = await axios.get(`${import.meta.env.VITE_ACCOUNT_API_URL || 'http://localhost:8001'}/github-authentication/login?code=${code}`);
        
        if (response.data && response.data.userToken) {
          // 토큰 저장
          localStorage.setItem('userToken', response.data.userToken);
          
          // 성공 메시지
          alert('GitHub 인증이 완료되었습니다!');
          
          // 이전 페이지로 돌아가기 또는 프로젝트 페이지로 이동
          const returnUrl = sessionStorage.getItem('githubReturnUrl');
          if (returnUrl) {
            sessionStorage.removeItem('githubReturnUrl');
            navigate(returnUrl);
          } else {
            navigate('/agile/projects');
          }
        }
      } catch (error) {
        console.error('GitHub 로그인 처리 실패:', error);
        alert('GitHub 인증 처리 중 오류가 발생했습니다.');
        navigate('/');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">GitHub 인증 처리 중...</p>
      </div>
    </div>
  );
};

export default GithubCallbackPage;
