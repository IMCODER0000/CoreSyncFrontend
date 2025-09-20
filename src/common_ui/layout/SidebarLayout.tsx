import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../sidebar/compoenet/Sidebar.tsx';

interface SidebarLayoutProps {
  /** 사이드바 초기 상태 (접힘/펼침) */
  initialCollapsed?: boolean;
  /** 추가적인 클래스명 */
  className?: string;
}

// 로컬 스토리지 키
const SIDEBAR_STATE_KEY = 'sidebar_collapsed';

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ 
  initialCollapsed = false,
  className = ''
}) => {
  const getSavedSidebarState = (): boolean => {
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    return savedState ? JSON.parse(savedState) : initialCollapsed;
  };

  const [collapsed, setCollapsed] = useState<boolean>(getSavedSidebarState());
  
  const toggleSidebar = () => {
    setCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(newState));
      return newState;
    });
  };
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !collapsed) {
        setCollapsed(true);
        localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(true));
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [collapsed]);
  
  return (
    <div className={`flex h-screen bg-gray-100 ${className}`}>
      <div className="relative z-10">
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleSidebar} />
        <div className="absolute top-0 bottom-0 right-0 w-4 bg-gradient-to-r from-transparent to-gray-200 opacity-30"></div>
      </div>

      <div className="flex-1 overflow-auto transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;
