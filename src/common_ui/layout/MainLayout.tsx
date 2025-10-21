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
    <div className={`h-screen ${className}`}>
      <main className="w-full h-full overflow-auto">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default MainLayout;
