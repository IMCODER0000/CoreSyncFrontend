import React, { useState } from 'react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectName: string) => void;
  isLoading?: boolean;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [projectName, setProjectName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      onSubmit(projectName.trim());
      setProjectName('');
    }
  };

  const handleClose = () => {
    setProjectName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={handleClose}
      ></div>

      {/* 모달 */}
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-4 border border-gray-200">
        {/* 헤더 */}
        <div className="border-b border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#5b7cdb]/10 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#5b7cdb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800">새 프로젝트 만들기</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 내용 */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-5">
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 이름
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="프로젝트 이름을 입력하세요"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b7cdb] focus:border-[#5b7cdb] transition-colors"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!projectName.trim() || isLoading}
              className="px-4 py-2 text-sm bg-[#5b7cdb] text-white rounded-lg hover:bg-[#4a63b8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  생성 중...
                </>
              ) : (
                '프로젝트 만들기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
