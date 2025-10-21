
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

import { Button, Badge } from '../../common_ui';
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
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between max-w-6xl">
                <motion.div
                    className="w-full md:w-1/2 mb-10 md:mb-0"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-200 rounded-2xl transform rotate-3 scale-95 opacity-20 -z-10"></div>
                        <img
                            src={imsi1Image}
                            alt="서비스 이미지"
                            className="w-full h-auto rounded-xl shadow-2xl"
                        />
                    </div>
                </motion.div>

                <motion.div
                    className="w-full md:w-2/5 md:pl-12 flex flex-col items-start"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="flex items-center mb-8">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">D</div>
                        <h1 className="text-4xl font-bold ml-3 text-gray-800">Core Syncc</h1>
                    </div>

                    <h2 className="text-2xl font-bold mb-5 text-gray-800">"IT관리의 마침표, Core Syncc"</h2>
                    <div className="text-center">
                        <p className="text-gray-600 mb-10 leading-relaxed text-lg ">
                            IT 일정과 효율적인 관리로 작업률을 높이는<br />
                            IT관리 서비스.
                        </p>
                    </div>

                    <div className="space-y-4 w-full max-w-xs mx-auto md:mx-0">
                        <Button
                            variant="filled"
                            color="primary"
                            fullWidth
                            className="shadow-md"
                            onClick={handleStartClick}
                        >
                            근태 관리 시작하기
                        </Button>
                        <Button
                            variant="outline"
                            color="primary"
                            fullWidth
                            className="shadow-sm"
                            onClick={() => navigate('/guest/login')}
                        >
                            게스트 로그인
                        </Button>
                        <Button variant="outline" color="primary" fullWidth className="shadow-sm">
                            서비스 알아보기
                        </Button>
                    </div>

                    <div className="mt-10 text-sm text-gray-600 w-full max-w-xs mx-auto md:mx-0 text-center ">
                        사용법이 궁금하다면? <Link to="/ui-components" className="text-blue-500 font-medium hover:underline cursor-pointer">서비스 살펴보기</Link>
                        <Badge color="primary" variant="soft" size="sm" className="ml-2">New</Badge>
                    </div>
                </motion.div>
            </div>

            <div className="fixed bottom-8 right-8">
                <div onClick={handleClick} className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
                    D
                </div>
            </div>
        </div>
    );
};

export default Home;