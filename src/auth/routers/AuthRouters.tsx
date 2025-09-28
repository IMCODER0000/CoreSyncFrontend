import React from 'react';
import {Route, Routes, Navigate} from "react-router-dom";
import LoginPage from "../pages/LoginPage.tsx";
import TermsPage from "../pages/TermsPage.tsx";

// 로그인 상태 확인 함수
export const isAuthenticated = () => {
    return localStorage.getItem('isLoggedIn') === 'wxx-sdwsx-ds=!>,?';
};

// 보호된 라우트 컴포넌트
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isAuthenticated()) {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
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




