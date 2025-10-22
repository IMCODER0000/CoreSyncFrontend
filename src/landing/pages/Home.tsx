
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

import imsi1Image from '../assets/images/imsi1.png';


const Home = () => {
    const navigate = useNavigate();
    
    const handleClick = () => {
        navigate("/workspace");
    }

    const handleStartClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const userToken = localStorage.getItem('userToken');
        
        if (!userToken) {
            // 토큰이 없으면 로그인 페이지로 이동
            navigate('/auth/login');
        } else {
            // 토큰이 있으면 workspace로 이동
            navigate('/workspace');
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center relative overflow-hidden">
            {/* 배경 장식 요소 */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between max-w-7xl gap-16 lg:gap-24 relative z-10">
                <motion.div
                    className="w-full md:w-1/2 mb-16 md:mb-0 mr-40"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                >
                    <div className="relative group">
                        {/* 배경 장식 레이어들 */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-indigo-300/40 scale-150 to-purple-300/40 rounded-3xl transform rotate-6 scale-95 blur-sm"
                            animate={{
                                rotate: [6, 8, 6],
                                scale: [0.95, 0.97, 0.95]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-br from-blue-300/30 to-indigo-300/30 rounded-3xl transform -rotate-3 scale-98 blur-sm scale-150"
                            animate={{
                                rotate: [-3, -5, -3],
                                scale: [0.98, 1, 0.98]
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        
                        {/* 이미지 컨테이너 */}
                        <motion.div
                            className="relative bg-white/80 backdrop-blur-sm p-3 rounded-3xl shadow-2xl border border-white/50"
                            whileHover={{ scale: 1.02, rotate: 0.5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <img
                                src={imsi1Image}
                                alt="서비스 이미지"
                                className="w-full h-auto rounded-2xl shadow-lg scale-150"
                            />
                            
                            {/* 이미지 위 그라데이션 오버레이 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/10 to-transparent rounded-2xl pointer-events-none" />
                        </motion.div>
                        
                        {/* 플로팅 배지 */}
                        <motion.div
                            className="absolute -top-20 -right-40 bg-gradient-to-br from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-2xl shadow-xl font-bold text-base"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 10 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                        >
                            CoreSync
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    className="w-full md:w-2/5 flex flex-col items-start"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
                >
                    {/* 로고 섹션 */}
                    <motion.div 
                        className="flex items-center mb-10 ml-11"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.div 
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            C
                        </motion.div>
                        <h1 className="text-5xl font-bold ml-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Core Sync</h1>
                    </motion.div>

                    {/* 메인 타이틀 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8 ml-20"
                    >
                        <div className="text-center">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-800 leading-tight">
                                IT관리의 마침표,<br />
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Core Sync</span>
                            </h2>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border text-center border-indigo-100/50 shadow-lg">
                            <p className="text-gray-700 leading-relaxed text-lg font-medium">
                                IT 일정과 효율적인 관리로<br />
                                <span className="text-indigo-600 font-bold">작업률을 높이는</span> IT관리 서비스
                            </p>
                        </div>
                    </motion.div>

                    {/* 버튼 그룹 */}
                    <motion.div 
                        className="space-y-4 w-full max-w-md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleStartClick}
                            className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                근태 관리 시작하기
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/guest/login')}
                            className="w-full px-8 py-4 bg-white/80 backdrop-blur-sm text-indigo-600 font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl border-2 border-indigo-200 hover:border-indigo-300 transition-all duration-300"
                        >
                            <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                게스트 로그인
                            </span>
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full px-8 py-4 bg-white/60 backdrop-blur-sm text-gray-700 font-semibold text-lg rounded-2xl shadow-md hover:shadow-lg border border-gray-200 hover:border-indigo-200 transition-all duration-300"
                        >
                            <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                서비스 알아보기
                            </span>
                        </motion.button>
                    </motion.div>

                    {/* 하단 링크 */}
                    <motion.div 
                        className="mt-8 w-full max-w-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-100/50 shadow-sm text-center">
                            <p className="text-sm text-gray-600">
                                사용법이 궁금하다면? 
                                <Link to="/ui-components" className="text-indigo-600 font-bold hover:text-purple-600 transition-colors duration-200 ml-1">
                                    서비스 살펴보기
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* 플로팅 액션 버튼 */}
            <motion.div 
                className="fixed bottom-8 right-8 z-50"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
            >
                <motion.div 
                    onClick={handleClick}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-2xl cursor-pointer border-4 border-white hover:shadow-3xl transition-all duration-300"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Home;