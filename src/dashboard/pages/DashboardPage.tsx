import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardApi } from '../../api/dashboardApi';
import type { DashboardStats } from '../../api/dashboardApi';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 시간을 "X시간 Y분" 형식으로 변환
  const formatHoursToTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}분`;
    if (m === 0) return `${h}시간`;
    return `${h}시간 ${m}분`;
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('통계 로드 실패:', error);
      // 에러 발생 시 기본값으로 설정
      setStats({
        teamCount: 0,
        projectCount: 0,
        ticketCount: 0,
        todayWorkHours: 0,
        weekWorkHours: [0, 0, 0, 0, 0, 0, 0],
        leaveStats: {
          totalDays: 15,
          usedDays: 0,
          remainingDays: 15
        },
        myBacklogCount: 0,
        myInProgressCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // 주간 작업 시간 차트 데이터
  const weekData = [
    { day: '월', hours: stats.weekWorkHours[1] },
    { day: '화', hours: stats.weekWorkHours[2] },
    { day: '수', hours: stats.weekWorkHours[3] },
    { day: '목', hours: stats.weekWorkHours[4] },
    { day: '금', hours: stats.weekWorkHours[5] },
    { day: '토', hours: stats.weekWorkHours[6] },
    { day: '일', hours: stats.weekWorkHours[0] },
  ];

  // 연차 파이 차트 데이터
  const leaveData = [
    { name: '사용', value: stats.leaveStats.usedDays, color: '#6366f1' },
    { name: '잔여', value: stats.leaveStats.remainingDays, color: '#f3f4f6' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">대시보드</h1>
          <p className="text-gray-600 text-sm">나의 업무 현황을 한눈에 확인하세요 ✨</p>
        </motion.div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 팀 수 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-indigo-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">소속 팀</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{stats.teamCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* 프로젝트 수 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-emerald-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">진행 프로젝트</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{stats.projectCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* 티켓 수 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">백로그 티켓</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">{stats.ticketCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-gray-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* 오늘 작업 시간 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-amber-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">오늘 작업 시간</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{formatHoursToTime(stats.todayWorkHours)}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* 내 백로그 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-purple-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">내 백로그</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{stats.myBacklogCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* 진행 중인 작업 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-cyan-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">진행 중인 작업</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{stats.myInProgressCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 주간 작업 시간 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-7 border border-indigo-100"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
              주간 작업 시간
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="50%" stopColor="#8b5cf6"/>
                    <stop offset="100%" stopColor="#a78bfa"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="day" 
                  stroke="#9ca3af" 
                  style={{ fontSize: '13px', fontWeight: 500 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  style={{ fontSize: '13px', fontWeight: 500 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  label={{ value: '시간', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: '12px' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    padding: '12px 16px'
                  }}
                  labelStyle={{ fontWeight: 600, color: '#374151', marginBottom: '4px' }}
                  formatter={(value: number) => [formatHoursToTime(value), '작업 시간']}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="url(#lineGradient)" 
                  strokeWidth={3}
                  fill="url(#colorArea)" 
                  dot={{ 
                    fill: '#fff', 
                    stroke: '#6366f1', 
                    strokeWidth: 3, 
                    r: 5,
                    filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))'
                  }}
                  activeDot={{ 
                    r: 7, 
                    fill: '#6366f1',
                    stroke: '#fff',
                    strokeWidth: 3,
                    filter: 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.4))'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 연차 현황 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-7 border border-emerald-100"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mr-3"></span>
              연차 현황
            </h2>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={leaveData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leaveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">총 연차</span>
                  <span className="text-sm font-bold text-gray-800">{stats.leaveStats.totalDays}일</span>
                </div>
                <div className="flex justify-between items-center mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2 shadow-sm"></div>
                    <span className="text-sm text-gray-600 font-medium">사용</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{stats.leaveStats.usedDays}일</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mr-2 shadow-sm"></div>
                    <span className="text-sm text-gray-600 font-medium">잔여</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{stats.leaveStats.remainingDays}일</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
