import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from './TranslationContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Trophy, 
  Target, 
  Layers, 
  Activity, 
  ChevronRight, 
  ArrowUpRight, 
  Clock, 
  Filter,
  Trash2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from './apiConfig';
import './PerformanceReports.css';

const PerformanceReports = ({ user }) => {
  const { t, formatNumber } = useTranslation();
  const [quizHistory, setQuizHistory] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setQuizHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let headers = { 'Authorization': `Bearer ${token}` };
      let response = await fetch(`${API_BASE_URL}/quiz_history`, { headers });

      // If token expired (401), try refreshing using saved refresh_token
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.access_token) {
              localStorage.setItem('token', refreshData.access_token);
              if (refreshData.refresh_token) {
                localStorage.setItem('refresh_token', refreshData.refresh_token);
              }
              headers = { 'Authorization': `Bearer ${refreshData.access_token}` };
              response = await fetch(`${API_BASE_URL}/quiz_history`, { headers });
            }
          }
        }
      }

      const data = await response.json();
      setQuizHistory(data.quizzes || []);
    } catch (error) {
      setQuizHistory([]);
    } finally {
      setTimeout(() => setLoading(false), 800); // Smooth loading feel
    }
  };

  const filteredHistory = useMemo(() => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return quizHistory.filter(q => new Date(q.timestamp) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return quizHistory.filter(q => new Date(q.timestamp) >= monthAgo);
      default:
        return quizHistory;
    }
  }, [selectedPeriod, quizHistory]);

  const stats = useMemo(() => {
    if (filteredHistory.length === 0) return {
      totalQuizzes: 0,
      averageScore: 0,
      totalCorrect: 0,
      accuracyRate: 0,
      subjectData: [],
      trendData: []
    };

    let totalScore = 0;
    let totalQuestions = 0;
    const subjects = {};

    filteredHistory.forEach(quiz => {
      totalScore += quiz.score;
      totalQuestions += quiz.total;
      
      if (!subjects[quiz.subject]) subjects[quiz.subject] = { name: quiz.subject, total: 0, correct: 0 };
      subjects[quiz.subject].total += quiz.total;
      subjects[quiz.subject].correct += quiz.score;
    });

    const subjectData = Object.values(subjects).map(s => ({
      name: s.name,
      score: Math.round((s.correct / s.total) * 100)
    }));

    const trendData = filteredHistory.slice(-10).map((q, i) => ({
      index: i + 1,
      score: Math.round(q.percentage),
      date: new Date(q.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
    }));

    return {
      totalQuizzes: filteredHistory.length,
      averageScore: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
      totalCorrect: totalScore,
      accuracyRate: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
      subjectData,
      trendData
    };
  }, [filteredHistory]);

  const deleteQuiz = async (quizId) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await fetch(`${API_BASE_URL}/quiz_history/${quizId}`, { method: 'DELETE' });
      setQuizHistory(prev => prev.filter(q => q.id !== quizId));
    } catch (error) {
      // Error handled silently
    }
  };

  const getAccuracyClass = (pct) => {
    if (pct >= 80) return 'accuracy-high';
    if (pct >= 50) return 'accuracy-mid';
    return 'accuracy-low';
  };

  const KPIBlock = ({ label, value, icon: Icon, delay }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="kpi-card"
    >
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <Icon className="kpi-icon" size={48} />
    </motion.div>
  );

  return (
    <div className="report-dashboard">
      <div className="report-container">
        {/* Header */}
        <div className="breadcrumb">
          <span>{t('home')}</span>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-semibold">{t('performanceTitle')}</span>
        </div>

        <header className="report-header">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {t('performanceTitle')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t('performanceSubtitle')}
          </motion.p>
        </header>

        {/* KPIs */}
        <div className="kpi-grid">
          <KPIBlock label={t('totalQuizzes')} value={formatNumber(stats.totalQuizzes)} icon={Layers} delay={0.1} />
          <KPIBlock label={t('avgScore')} value={`${formatNumber(stats.averageScore)}%`} icon={Trophy} delay={0.2} />
          <KPIBlock label={t('totalCorrect')} value={formatNumber(stats.totalCorrect)} icon={Target} delay={0.3} />
          <KPIBlock label={t('accuracyRate')} value={`${formatNumber(stats.accuracyRate)}%`} icon={Activity} delay={0.4} />
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <span className="filter-label">{t('reportPeriod')}</span>
          </div>
          <select 
            className="clean-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="all">{t('allTime')}</option>
            <option value="month">{t('last30Days')}</option>
            <option value="week">{t('past7Days')}</option>
          </select>
          <div className="ml-auto">
            <button 
              onClick={loadHistory}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="chart-grid">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="chart-card"
          >
            <div className="chart-header">
              <h3 className="chart-title text-indigo-600">{t('subjectPerformance')}</h3>
              <ArrowUpRight size={18} className="text-slate-300" />
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={stats.subjectData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} fontSize={12} fontWeight={600} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                    {stats.subjectData.map((entry, index) => (
                      <Cell key={index} fill={entry.score >= 80 ? '#6366f1' : entry.score >= 50 ? '#8b5cf6' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="chart-card"
          >
            <div className="chart-header">
              <h3 className="chart-title text-violet-600">{t('recentTrend')}</h3>
              <Activity size={18} className="text-slate-300" />
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={stats.trendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} stroke="#94a3b8" />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* History Table */}
        <section className="history-section animate-in" style={{ animationDelay: '0.7s' }}>
          <div className="history-header">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock className="text-slate-400" size={20} />
              {t('quizHistory')}
            </h3>
          </div>

          <div className="overflow-x-auto">
            {quizHistory.length === 0 ? (
              <div className="empty-state">
                <AlertCircle className="empty-icon" />
                <h4 className="empty-title text-slate-900">{t('noHistory')}</h4>
                <p className="empty-text">{t('noHistoryMsg')}</p>
              </div>
            ) : (
              <div className="table-scroll-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>{t('date')}</th>
                    <th>{t('subjectTopic')}</th>
                    <th>{t('score')}</th>
                    <th>{t('accuracy')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredHistory.slice().reverse().map((quiz) => (
                      <motion.tr 
                        key={quiz.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <td className="whitespace-nowrap font-medium text-slate-500">
                          {new Date(quiz.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{quiz.subject}</span>
                            <span className="text-xs text-slate-500 uppercase tracking-tighter">{quiz.topic}</span>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono font-bold text-slate-700">{formatNumber(quiz.score)} / {formatNumber(quiz.total)}</span>
                        </td>
                        <td>
                          <span className={`accuracy-badge ${getAccuracyClass(quiz.percentage)}`}>
                            {formatNumber(Math.round(quiz.percentage))}%
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => deleteQuiz(quiz.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PerformanceReports;
