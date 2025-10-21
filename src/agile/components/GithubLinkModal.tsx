import React, { useState } from 'react';
import { githubApi } from '../../api/githubApi';

interface GithubLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onSuccess: () => void;
}

const GithubLinkModal: React.FC<GithubLinkModalProps> = ({ isOpen, onClose, projectId, onSuccess }) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseGithubUrl = (url: string) => {
    // GitHub URL 파싱: https://github.com/owner/repo
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return {
        owner: match[1],
        repositoryName: match[2].replace(/\.git$/, ''),
        repositoryUrl: url
      };
    }
    return null;
  };

  const handleLinkRepository = async () => {
    if (!githubUrl.trim()) {
      setError('GitHub 저장소 URL을 입력해주세요.');
      return;
    }

    const parsed = parseGithubUrl(githubUrl);
    if (!parsed) {
      setError('올바른 GitHub 저장소 URL을 입력해주세요. (예: https://github.com/owner/repo)');
      return;
    }

    try {
      setLinking(true);
      setError(null);
      
      // 백엔드로 저장소 정보 전송
      await githubApi.linkRepository(projectId, parsed);
      
      alert('GitHub 저장소가 성공적으로 연동되었습니다!\n\n공개 저장소는 바로 사용 가능하며, 비공개 저장소의 경우 추가 인증이 필요할 수 있습니다.');
      onSuccess();
      onClose();
      setGithubUrl('');
    } catch (error: any) {
      console.error('저장소 연동 실패:', error);
      setError(`저장소 연동에 실패했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setLinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">GitHub 저장소 연동</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub 저장소 URL
            </label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              예: https://github.com/facebook/react
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={linking}
            >
              취소
            </button>
            <button
              onClick={handleLinkRepository}
              disabled={linking || !githubUrl.trim()}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
            >
              {linking ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  연동 중...
                </>
              ) : (
                '저장소 연동'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GithubLinkModal;
