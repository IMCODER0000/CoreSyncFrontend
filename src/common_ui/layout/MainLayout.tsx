import React from 'react';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

interface MainLayoutProps {
  /** 추가적인 클래스명 */
  className?: string;
  /** 자식 컴포넌트 */
  children?: ReactNode;
}


const MainLayout: React.FC<MainLayoutProps> = ({ className = '', children }) => {
  
  return (
    <div className={`h-screen bg-gray-100 ${className}`}>
      <main className="w-full overflow-auto transition-all duration-300">
        <div className="container mx-auto p-6 min-h-screen">
          <div className="bg-white rounded-xl shadow-sm p-6" style={{ minHeight: 'calc(100vh - 3rem)' }}>
            {children || <Outlet />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
