import React, { useState } from 'react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 이메일 유효성 검사
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    try {
      await onSubmit(email);
      setEmail('');
      setError('');
    } catch (err) {
      // 에러는 부모 컴포넌트에서 처리
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full border border-gray-200">
        {/* 헤더 */}
        <div className="border-b border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#52c17c]/10 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#52c17c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800">팀 멤버 초대</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 본문 */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일 주소
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="example@email.com"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#52c17c] focus:border-[#52c17c] transition-colors"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-xs text-red-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
          </div>

          <div className="bg-[#52c17c]/5 border border-[#52c17c]/20 rounded-lg p-3 mb-5">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#52c17c] mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-700 font-medium mb-0.5">초대 안내</p>
                <p className="text-xs text-gray-600">
                  입력한 이메일로 등록된 계정이 팀에 추가됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-[#52c17c] text-white rounded-lg hover:bg-[#45a869] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  초대 중...
                </>
              ) : (
                '초대하기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
