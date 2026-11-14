import React, { useState, useEffect } from 'react';
import './Profile.css';
import { 
  User, 
  Mail, 
  Shield, 
  ArrowLeft, 
  LogOut, 
  CheckCircle, 
  Zap, 
  BookOpen, 
  Award, 
  Compass, 
  Clock, 
  MessageSquare,
  TrendingUp,
  Settings,
  Languages,
  Moon,
  Sun,
  Trash2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import API_BASE_URL from './apiConfig';

function Profile({ 
  user, 
  onBack, 
  onLogout, 
  dailyQuota = { remaining: 5, total: 5 }, 
  recentChatsCount = 0,
  activeTab = 'MathGPT',
  setActiveTab,
  language = 'en',
  changeLanguage,
  darkMode = false,
  setDarkMode,
  onHistoryCleared
}) {
  const [stats, setStats] = useState({
    total_problems: recentChatsCount,
    total_quizzes: 0,
    avg_score: 0,
    favorite_subject: 'MathGPT',
    created_at: null,
    loading: true
  });

  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_BASE_URL}/user_stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setStats({
            total_problems: data.total_problems ?? recentChatsCount,
            total_quizzes: data.total_quizzes ?? 0,
            avg_score: data.avg_score ?? 0,
            favorite_subject: data.favorite_subject || 'MathGPT',
            created_at: data.created_at || null,
            loading: false
          });
        } else {
          setStats(prev => ({ ...prev, loading: false }));
        }
      })
      .catch(() => setStats(prev => ({ ...prev, loading: false })));
  }, [recentChatsCount]);

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/chat_history`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (onHistoryCleared) onHistoryCleared();
        setStats(prev => ({ ...prev, total_problems: 0 }));
        setShowClearModal(false);
        setSuccessMessage('All chat history cleared from Supabase!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
    setClearing(false);
  };

  if (!user) return null;

  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();

  // Calculate quota progress
  const totalLimit = dailyQuota.total || 5;
  const remaining = Math.max(0, dailyQuota.remaining ?? totalLimit);
  const used = Math.max(0, totalLimit - remaining);
  const percentUsed = Math.min(100, Math.round((used / totalLimit) * 100));

  // Member since date
  const memberSince = stats.created_at 
    ? new Date(stats.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'Nov 2026';

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Header with back button */}
        <div className="profile-header">
          <button className="profile-back-btn" onClick={onBack} title="Back to Chat">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h2>Student Profile</h2>
        </div>

        {/* User Hero Section */}
        <div className="profile-hero">
          <div className="profile-avatar-large">
            <span>{initial}</span>
          </div>
          <div className="profile-hero-info">
            <h3>{user.name || 'MathVerse Student'}</h3>
            <div className="profile-meta-row">
              <span className="profile-badge">
                <CheckCircle size={14} /> Verified Student
              </span>
              <span className="profile-member-since">
                <Calendar size={14} /> Member since {memberSince}
              </span>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="profile-success-banner">
            <CheckCircle size={16} /> {successMessage}
          </div>
        )}

        {/* 1. Daily Quota & Usage Progress Bar */}
        <div className="profile-section-card quota-card">
          <div className="section-card-header">
            <div className="section-title-wrap">
              <span className="section-icon zap-icon"><Zap size={20} /></span>
              <div>
                <h4>Daily Question Allowance</h4>
                <p className="section-subtitle">Fair-usage limit for free tier access</p>
              </div>
            </div>
            <div className="quota-pill-status">
              <strong>{used} / {totalLimit}</strong> used
              <span className="quota-subtext">({remaining} remaining)</span>
            </div>
          </div>

          <div className="progress-bar-track">
            <div 
              className={`progress-bar-fill ${remaining <= 1 ? 'danger' : remaining <= 2 ? 'warning' : ''}`}
              style={{ width: `${percentUsed}%` }}
            ></div>
          </div>

          <div className="quota-footer">
            <span className="reset-note">
              <Clock size={14} /> Resets daily at 00:00 UTC
            </span>
            <span className="percent-text">{percentUsed}% used today</span>
          </div>
        </div>

        {/* 2. Learning Stats & Achievements */}
        <div className="profile-section-card">
          <div className="section-card-header">
            <div className="section-title-wrap">
              <span className="section-icon stats-icon"><TrendingUp size={20} /></span>
              <div>
                <h4>Learning Stats & Progress</h4>
                <p className="section-subtitle">Your learning milestones on MathVerse</p>
              </div>
            </div>
          </div>

          <div className="stats-metric-grid">
            <div className="stat-metric-card">
              <div className="metric-icon-bubble blue">
                <MessageSquare size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-number">{stats.total_problems}</span>
                <span className="metric-label">Problems Solved</span>
              </div>
            </div>

            <div className="stat-metric-card">
              <div className="metric-icon-bubble purple">
                <BookOpen size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-number">{stats.total_quizzes}</span>
                <span className="metric-label">Quizzes Completed</span>
              </div>
            </div>

            <div className="stat-metric-card">
              <div className="metric-icon-bubble green">
                <Award size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-number">{stats.avg_score}%</span>
                <span className="metric-label">Average Quiz Score</span>
              </div>
            </div>

            <div className="stat-metric-card">
              <div className="metric-icon-bubble amber">
                <Compass size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-number highlight">{stats.favorite_subject}</span>
                <span className="metric-label">Favorite Subject</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Study Preferences & Defaults */}
        <div className="profile-section-card">
          <div className="section-card-header">
            <div className="section-title-wrap">
              <span className="section-icon pref-icon"><Settings size={20} /></span>
              <div>
                <h4>Study Preferences & Defaults</h4>
                <p className="section-subtitle">Customize your default subject, language, and theme</p>
              </div>
            </div>
          </div>

          <div className="preferences-grid">
            {/* Default Subject */}
            <div className="pref-item">
              <label className="pref-label">Default Subject</label>
              <select 
                className="pref-select"
                value={activeTab} 
                onChange={(e) => {
                  if (setActiveTab) setActiveTab(e.target.value);
                  localStorage.setItem('preferredSubject', e.target.value);
                }}
              >
                <option value="MathGPT">MathVerse (MathGPT)</option>
                <option value="PhysicsGPT">PhysicsVerse (PhysicsGPT)</option>
                <option value="ChemGPT">ChemVerse (ChemGPT)</option>
                <option value="AccountingGPT">AccountingVerse (AccountingGPT)</option>
              </select>
            </div>

            {/* Preferred Language */}
            <div className="pref-item">
              <label className="pref-label">Response Language</label>
              <div className="pref-btn-group">
                <button 
                  className={`pref-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={() => changeLanguage && changeLanguage('en')}
                >
                  English
                </button>
                <button 
                  className={`pref-btn ${language === 'hi' ? 'active' : ''}`}
                  onClick={() => changeLanguage && changeLanguage('hi')}
                >
                  हिन्दी
                </button>
                <button 
                  className={`pref-btn ${language === 'kn' ? 'active' : ''}`}
                  onClick={() => changeLanguage && changeLanguage('kn')}
                >
                  ಕನ್ನಡ
                </button>
              </div>
            </div>

            {/* Theme Preference */}
            <div className="pref-item">
              <label className="pref-label">Theme Preference</label>
              <div className="pref-btn-group">
                <button 
                  className={`pref-btn ${!darkMode ? 'active' : ''}`}
                  onClick={() => setDarkMode && setDarkMode(false)}
                >
                  <Sun size={15} /> Light
                </button>
                <button 
                  className={`pref-btn ${darkMode ? 'active' : ''}`}
                  onClick={() => setDarkMode && setDarkMode(true)}
                >
                  <Moon size={15} /> Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Account Details & Data Management */}
        <div className="profile-details-grid">
          <div className="profile-detail-item">
            <div className="detail-icon">
              <Mail size={18} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{user.email || 'Not provided'}</span>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="detail-icon">
              <User size={18} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{user.name || 'User'}</span>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="detail-icon">
              <Shield size={18} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Authentication</span>
              <span className="detail-value">Google OAuth / Supabase</span>
            </div>
          </div>
        </div>

        {/* Account Data Management & Logout */}
        <div className="profile-actions-split">
          <button className="profile-clear-btn" onClick={() => setShowClearModal(true)}>
            <Trash2 size={16} />
            <span>Clear All Chat History</span>
          </button>

          <button className="profile-logout-btn" onClick={onLogout}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Clear History */}
      {showClearModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-box-custom">
            <div className="modal-icon-warn">
              <AlertTriangle size={28} />
            </div>
            <h3>Clear All Chat History?</h3>
            <p>
              Are you sure you want to delete all saved conversations from Supabase? This action is permanent and cannot be undone.
            </p>
            <div className="modal-actions-custom">
              <button 
                className="modal-cancel-btn"
                onClick={() => setShowClearModal(false)}
                disabled={clearing}
              >
                Cancel
              </button>
              <button 
                className="modal-confirm-delete-btn"
                onClick={handleClearHistory}
                disabled={clearing}
              >
                {clearing ? 'Clearing...' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
