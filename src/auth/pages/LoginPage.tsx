import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useKakaoLogin } from "../api/KakaoApi";

import { Button } from '../../common_ui';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const { requestKakaoLoginToSpring } = useKakaoLogin();
  
  // 약관 페이지에서 돌아온 경우 처리
  useEffect(() => {
    const state = location.state as { termsAccepted?: boolean; provider?: string } | null;
    
    if (state?.termsAccepted && state?.provider) {
      setActiveButton(state.provider);
      completeLogin(state.provider);
    }
  }, [location.state]);


  const handleSocialLogin = (provider: string) => {
    console.log("카카오 로그인 호출");
    if (provider === "kakao"){
      requestKakaoLoginToSpring();
    }
  };

  const goHome = () => {
    window.location.href="/";
  }


  const completeLogin = (provider: string) => {
    // 약관에 동의한 후 로그인 처리
    setIsLoading(true);
    setActiveButton(provider);
    
    // 여기에 로그인 후 처리 로직 추가
    // 예: 토큰 저장, 사용자 정보 가져오기 등
    
    setTimeout(() => {
      setIsLoading(false);
      navigate('/workspace');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {true && (
            <motion.div
              key="login-page"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20"
            >
              {/* 로고 및 헤더 영역 */}
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-2xl bg-white/95 backdrop-blur-sm flex items-center justify-center font-bold text-4xl shadow-2xl mx-auto transform hover:scale-105 transition-transform duration-300">
                    <span onClick={goHome} className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">C</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mt-6 tracking-tight">CoreSync</h1>
                  <p className="text-white/90 mt-3 text-base font-medium">IT 관리의 마침표</p>
                </div>
              </div>

              {/* 소셜 로그인 영역 */}
              <div className="p-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">소셜 계정으로 로그인</h2>
                <p className="text-gray-500 text-sm text-center mb-8">간편하게 시작하세요</p>
                
                <div className="space-y-4">
                  <Button
                    onClick={() => handleSocialLogin('kakao')}
                    color="warning"
                    variant="filled"
                    size="lg"
                    fullWidth
                    loading={isLoading && activeButton === 'kakao'}
                    className="shadow-md hover:shadow-lg bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300 flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] font-semibold"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3C6.48 3 2 6.48 2 11c0 2.76 1.33 5.19 3.38 6.74L3.69 20.37c-.24.49.08 1.07.61 1.12.28.03.57-.06.79-.27l3.29-2.93c1.15.36 2.38.56 3.62.56 5.52 0 10-3.48 10-8s-4.48-8-10-8z"/>
                    </svg>
                    카카오톡으로 로그인
                  </Button>
                  
                  <Button
                    onClick={() => handleSocialLogin('github')}
                    color="secondary"
                    variant="filled"
                    size="lg"
                    fullWidth
                    loading={isLoading && activeButton === 'github'}
                    className="shadow-md hover:shadow-lg bg-gray-800 hover:bg-gray-900 focus:ring-gray-700 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] font-semibold"
                  >
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    깃허브로 로그인
                  </Button>
                  
                  <Button
                    onClick={() => handleSocialLogin('meta')}
                    color="primary"
                    variant="filled"
                    size="lg"
                    fullWidth
                    loading={isLoading && activeButton === 'meta'}
                    className="shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700 focus:ring-blue-400 flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] font-semibold"
                  >
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    메타로 로그인
                  </Button>
                </div>
                
                {/* 구분선 */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">또는</span>
                  </div>
                </div>
                
                {/* 게스트 로그인 버튼 */}
                <Button
                  onClick={() => navigate('/guest/login')}
                  color="secondary"
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] font-semibold border-2 hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  게스트 로그인
                </Button>
                
                <div className="mt-8 text-center text-xs text-gray-500">
                  <p>로그인하면 <span className="font-semibold text-gray-700">서비스 이용약관</span>과 <span className="font-semibold text-gray-700">개인정보처리방침</span>에 동의하게 됩니다.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 푸터 */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-gray-600 text-sm mt-8 font-medium"
        >
          © 2025 CoreSync. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
};

export default LoginPage;
