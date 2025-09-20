import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">내 프로필</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">홍길동</h2>
            <p className="text-gray-500">프론트엔드 개발자</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">개인 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">이메일</span>
              <span className="text-gray-800 font-medium">hong@example.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">전화번호</span>
              <span className="text-gray-800 font-medium">010-1234-5678</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">위치</span>
              <span className="text-gray-800 font-medium">서울특별시</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">가입일</span>
              <span className="text-gray-800 font-medium">2023년 1월 15일</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">계정 설정</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-800">이메일 알림</span>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input type="checkbox" id="toggle" className="sr-only" />
                <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-800">2단계 인증</span>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input type="checkbox" id="toggle2" className="sr-only" />
                <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">최근 활동</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-gray-800">새 프로젝트 생성: <span className="font-medium">웹사이트 리뉴얼</span></p>
              <p className="text-xs text-gray-500">오늘, 14:32</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-800">작업 완료: <span className="font-medium">로그인 페이지 디자인</span></p>
              <p className="text-xs text-gray-500">어제, 09:41</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-800">미팅 예약: <span className="font-medium">클라이언트 피드백</span></p>
              <p className="text-xs text-gray-500">2023년 9월 18일, 15:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;