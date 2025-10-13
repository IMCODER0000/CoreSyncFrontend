import React, { useState, useEffect } from 'react';
import {Route, Routes, Navigate} from "react-router-dom";
import LoginPage from "../pages/LoginPage.tsx";
import TermsPage from "../pages/TermsPage.tsx";
import { checkAuthentication } from "../api/authApi.ts";

// 로그인 상태 확인 함수 (로컬 체크용)
export const isAuthenticated = () => {
    return localStorage.getItem('isLoggedIn') === 'wxx-sdwsx-ds=!>,?';
};

// 보호된 라우트 컴포넌트
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [isAuthValid, setIsAuthValid] = useState(false);

    useEffect(() => {
        const verifyAuthentication = async () => {
            // 먼저 로컬 스토리지 체크
            if (!isAuthenticated()) {
                setIsAuthValid(false);
                setIsAuthChecking(false);
                return;
            }

            // 백엔드 인증 확인
            const isValid = await checkAuthentication();
            
            if (!isValid) {
                // 인증 실패 시 로컬 스토리지 정리
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userToken');
                localStorage.removeItem('nickname');
            }
            
            setIsAuthValid(isValid);
            setIsAuthChecking(false);
        };

        verifyAuthentication();
    }, []);

    // 인증 확인 중일 때 로딩 표시
    if (isAuthChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">인증 확인 중...</p>
                </div>
            </div>
        );
    }

    // 인증 실패 시 로그인 페이지로 리다이렉트
    if (!isAuthValid) {
        return <Navigate to="/auth/login" replace />;
    }

    return <>{children}</>;
};

export default function AuthRouters() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="login" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="terms" element={<TermsPage />} />
        </Routes>
    )
};




