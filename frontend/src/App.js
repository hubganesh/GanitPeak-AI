import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from './TranslationContext';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import './App.css';
import Quiz from './Quiz';
import PerformanceReports from './PerformanceReports';
import VideoGallery from './VideoGallery';
import LandingPage from './LandingPage';
import CanvasDrawing from './CanvasDrawing';
import MathInput from './MathInput';
import GraphCreator from './GraphCreator';
import MathStudyGuide from './MathStudyGuide';
import Calculator from './components/Calculator';
import { solveMathProblem } from './utils/mathSolver';
import API_BASE_URL from './apiConfig';
import './LandingPage.css';
import './AuthModal.css';
import './MathInput.css';
import {
  Home,
  Video,
  BookOpen,
  MessageSquare,
  PenTool,
  Edit3,
  ChevronLeft,
  Menu,
  X,
  Upload,
  Send,
  Settings,
  BarChart3,
  Book,
  Clock,
  Plus,
  LogOut,
  Moon,
  Sun,
  Calculator as CalcIcon
} from 'lucide-react'; // Add MathInput CSS

function App() {
  const { language, t, formatNumber, changeLanguage } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState('home');
  const [activeTab, setActiveTab] = useState('MathGPT');
  const [recentChats, setRecentChats] = useState([]);
  const [practiceSubMenu, setPracticeSubMenu] = useState('interactive-quizzes');
  const fileInputRef = useRef(null);
  const [showLandingPage, setShowLandingPage] = useState(true); // Add state for landing page
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Add state for sidebar collapse
  const [user, setUser] = useState(null); // Add state for user data
  const chatMessagesRef = useRef(null); // Add ref for chat messages
  const [showCanvasModal, setShowCanvasModal] = useState(false); // Add state for canvas modal
  const [showToolsDropdown, setShowToolsDropdown] = useState(false); // Add state for tools dropdown
  const [selectedTools, setSelectedTools] = useState([]); // Add state for selected tools
  const [showGraphCreator, setShowGraphCreator] = useState(false); // Add state for graph creator
  const [showStudyGuide, setShowStudyGuide] = useState(false); // Add state for study guide
  const [showCalculator, setShowCalculator] = useState(false); // Add state for calculator
  const [calcResult, setCalcResult] = useState(null);
  const [calcError, setCalcError] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false); // Add state for user dropdown
  const [darkMode, setDarkMode] = useState(false); // Add state for dark mode

  // Tab data mapping
  const tabData = {
    MathGPT: { 
      name: t('mathVerse'), 
      title: t('mathTitle'), 
      subtitle: t('askMe') 
    },
    PhysicsGPT: { 
      name: t('physicsVerse'), 
      title: t('physicsTitle'), 
      subtitle: t('askMe') 
    },
    AccountingGPT: { 
      name: t('accountingVerse'), 
      title: t('accountingTitle'), 
      subtitle: t('askMe') 
    },
    ChemGPT: { 
      name: t('chemVerse'), 
      title: t('chemTitle'), 
      subtitle: t('askMe') 
    }
  };

  // Check for existing user session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setShowLandingPage(false); // Skip landing page if user is logged in
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      setDarkMode(true);
    }
    
    fetchChatHistory();
  }, []);

  // Close tools dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showToolsDropdown && !event.target.closest('.tools-dropdown-container')) {
        setShowToolsDropdown(false);
      }
      if (showUserDropdown && !event.target.closest('.sidebar-user')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToolsDropdown, showUserDropdown]);

  // Apply dark mode class to document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Auto-scroll to bottom when messages change (ChatGPT-like behavior)
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/chat_history`, {
        headers,
      });
      const data = await response.json();
      setRecentChats(data.chats || []);
    } catch (error) {
      // Error handled silently
    }
  };

  const renderText = (text) => {
    // Split by $$ for display math and $ for inline math
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2);
        return <BlockMath key={index} math={math} />;
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = part.slice(1, -1);
        return <InlineMath key={index} math={math} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const clearChatHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat_history`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setRecentChats([]);
        setMessages([]);
        setInput('');
        setUploadedImage(null);
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat_history/${chatId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Remove the deleted chat from the local state
        setRecentChats(prev => prev.filter(chat => chat.id !== chatId));
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setInput('');
    setUploadedImage(null);
    setSelectedMenuItem('home'); // Navigate to home page
  };

  const handleStartChat = (userData) => {
    setShowLandingPage(false);
    // If userData is passed directly, use it; otherwise check localStorage
    if (userData) {
      setUser(userData);
    } else {
      const token = localStorage.getItem('token');
      const storedUserData = localStorage.getItem('user');
      if (token && storedUserData) {
        const parsedUser = JSON.parse(storedUserData);
        setUser(parsedUser);
      }
    }
    // Load chat history when user starts a chat session
    fetchChatHistory();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMessages([]);
    setRecentChats([]);
    setShowLandingPage(true);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const loadRecentChat = (chat) => {
    // Convert base64 image back to File object for display
    let imageFile = null;
    if (chat.image) {
      // Create a File object from base64 data
      const byteCharacters = atob(chat.image);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      imageFile = new File([byteArray], 'uploaded-image.png', { type: 'image/png' });
    }

    setMessages([
      { text: chat.question, sender: 'user', image: imageFile },
      { text: chat.answer, sender: 'bot' }
    ]);
    setInput('');
    setUploadedImage(null);
  };

  const sendMessage = async () => {
    if (!input.trim() && !uploadedImage) return;

    const userMessage = { text: input, sender: 'user', image: uploadedImage };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedImage(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('subject', activeTab);
    formData.append('language', language);
    if (input.trim()) {
      formData.append('question', input);
    }
    if (uploadedImage) {
      formData.append('file', uploadedImage);
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/solve`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await response.json();
      const botMessage = { text: data.answer || data.error, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
      
      // Refresh chat history from database
      fetchChatHistory();
    } catch (error) {
      const errorMessage = { text: 'Error connecting to server.', sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClickUpload = () => {
    fileInputRef.current.click();
  };

  // eslint-disable-next-line no-unused-vars
  const playNarration = (script) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      // Optional: Choose a voice
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis not supported in this browser.');
    }
  };

  const handleCanvasDone = (imageData) => {
    // Convert base64 to File object
    fetch(imageData)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'canvas-drawing.png', { type: 'image/png' });
        setUploadedImage(file);
      });
  };

  const removeTool = (toolToRemove) => {
    setSelectedTools(prev => prev.filter(tool => tool !== toolToRemove));
  };

  const handleCalcSolve = async (problem) => {
    try {
      setCalcError(null);
      const solution = solveMathProblem(problem);
      setCalcResult(solution);
    } catch (err) {
      setCalcError(err.message || 'Error solving problem');
      setCalcResult(null);
    }
  };

  const handleCalcClear = () => {
    setCalcResult(null);
    setCalcError(null);
  };

  return (
    <div className="App">
      {showLandingPage ? (
        <LandingPage onStartChat={handleStartChat} />
      ) : (
        <>
          {/* Hamburger Menu Button */}
          <button 
            className={`hamburger-menu ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
          >
            {sidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
          </button>

          {/* Backdrop for mobile sidebar */}
          {sidebarCollapsed ? null : (
            <div 
              className="sidebar-backdrop" 
              onClick={toggleSidebar}
            ></div>
          )}

          <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
            <div className="sidebar-menu">
              <div 
                className={`menu-item ${selectedMenuItem === 'home' ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedMenuItem('home');
                  if (sidebarCollapsed) setSidebarCollapsed(false);
                }}
                data-tooltip="Home"
              >
                <span className="menu-icon"><Home size={20} /></span>
                <span className="menu-text">{t('home')}</span>
              </div>
              <div 
                className={`menu-item ${selectedMenuItem === 'video-gallery' ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedMenuItem('video-gallery');
                  if (sidebarCollapsed) setSidebarCollapsed(false);
                }}
                data-tooltip="Video Gallery"
              >
                <span className="menu-icon"><Video size={20} /></span>
                <span className="menu-text">{t('videoGallery')}</span>
              </div>
              <div 
                className={`menu-item ${selectedMenuItem === 'practice-zone' ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedMenuItem('practice-zone');
                  if (sidebarCollapsed) setSidebarCollapsed(false);
                }}
                data-tooltip="Practice Zone"
              >
                <span className="menu-icon"><BookOpen size={20} /></span>
                <span className="menu-text">{t('practiceZone')}</span>
              </div>
              {selectedMenuItem === 'practice-zone' && (
                <div className="sub-menu">
                  <div 
                    className={`sub-menu-item ${practiceSubMenu === 'interactive-quizzes' ? 'selected' : ''}`}
                    onClick={() => {
                      setPracticeSubMenu('interactive-quizzes');
                      if (sidebarCollapsed) setSidebarCollapsed(false);
                    }}
                  >
                    <BookOpen size={16} /> {t('interactiveQuizzes')}
                  </div>
                  <div 
                    className={`sub-menu-item ${practiceSubMenu === 'performance-reports' ? 'selected' : ''}`}
                    onClick={() => {
                      setPracticeSubMenu('performance-reports');
                      if (sidebarCollapsed) setSidebarCollapsed(false);
                    }}
                  >
                    <BarChart3 size={16} /> {t('performanceReports')}
                  </div>
                </div>
              )}
              <div 
                className={`menu-item ${selectedMenuItem === 'new-chat' ? 'selected' : ''}`}
                onClick={() => {
                  startNewChat();
                  if (sidebarCollapsed) setSidebarCollapsed(false);
                }}
                data-tooltip="New Chat"
              >
                <span className="menu-icon"><Edit3 size={20} /></span>
                <span className="menu-text">{t('newChat')}</span>
              </div>
              <div className="sidebar-theme-toggle">
                <div 
                  className="menu-item theme-toggle-menu-item"
                  onClick={() => setDarkMode(!darkMode)}
                  data-tooltip="Toggle Theme"
                >
                  <span className="menu-icon">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</span>
                  <span className="menu-text">{t('theme')}</span>
                </div>
              </div>
              
              <div className="sidebar-language-selector">
                <div className="language-pill">
                  <button 
                    className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                    onClick={() => changeLanguage('en')}
                  >
                    English
                  </button>
                  <button 
                    className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
                    onClick={() => changeLanguage('hi')}
                  >
                    हिन्दी
                  </button>
                  <button 
                    className={`lang-btn ${language === 'kn' ? 'active' : ''}`}
                    onClick={() => changeLanguage('kn')}
                  >
                    ಕನ್ನಡ
                  </button>
                </div>
              </div>
            </div>
            
            <div className="sidebar-recent">
              <div className="recent-header">
                <h3>{t('recentChats')}</h3>
              </div>
              <div className="recent-chats">
                {recentChats.length === 0 ? (
                  <p className="no-chats">{t('noChats')}</p>
                ) : (
                  recentChats.map((chat) => (
                    <div key={chat.id} className="recent-chat-item" onClick={(e) => {
                      // Only load chat if not clicking the delete button
                      if (!e.target.closest('.delete-chat-btn')) {
                        loadRecentChat(chat);
                      }
                    }}>
                      <div className="recent-chat-content">
                        <div className="recent-chat-question">
                          {chat.image ? '📷 ' : ''}{chat.question.length > 30 ? chat.question.substring(0, 30) + '...' : chat.question}
                        </div>
                        <div className="recent-chat-time">
                          {new Date(chat.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <button 
                        className="delete-chat-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        title="Delete chat"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
                {recentChats.length > 0 && (
                  <div className="clear-all-section">
                    <button 
                      className="clear-all-btn"
                      onClick={clearChatHistory}
                      title="Clear all chat history"
                    >
                      <X size={16} /> {t('clearAll')}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* User Section - ChatGPT Style */}
            {user && (
              <div className="sidebar-user">
                <div className="sidebar-user-content">
                  <button 
                    className="sidebar-user-avatar-btn"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    title=""
                  >
                    <div className="sidebar-user-avatar">
                      <span className="user-avatar-icon">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  </button>
                  <div className="sidebar-user-info">
                    <span className="sidebar-user-name">{user.name}</span>
                  </div>
                </div>
                {showUserDropdown && (
                  <div className="user-dropdown-menu">
                    <button 
                      className="user-dropdown-option"
                      onClick={() => {
                        handleLogout();
                        setShowUserDropdown(false);
                      }}
                    >
                      <LogOut size={16} /> {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
            {selectedMenuItem === 'video-gallery' ? (
              <VideoGallery />
            ) : selectedMenuItem === 'practice-zone' ? (
              practiceSubMenu === 'interactive-quizzes' ? (
                <Quiz />
              ) : practiceSubMenu === 'performance-reports' ? (
                <PerformanceReports />
              ) : null
            ) : (
              <>
            <header className="App-header">
              <div className="header-content">
                <div className="header-main">
                  <div className="logo-circle">
                    <span className="logo-symbol">√</span>
                  </div>
                  <div className="content-section">
                    <div className="title-section">
                      <h1>{tabData[activeTab].title}</h1>
                    </div>
                  </div>
                </div>
                <div className="tabs-section">
                  <button
                    className={`tab-button ${activeTab === 'MathGPT' ? 'active' : ''}`}
                    onClick={() => setActiveTab('MathGPT')}
                  >
                    {t('mathVerse')}
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'PhysicsGPT' ? 'active' : ''}`}
                    onClick={() => setActiveTab('PhysicsGPT')}
                  >
                    {t('physicsVerse')}
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'AccountingGPT' ? 'active' : ''}`}
                    onClick={() => setActiveTab('AccountingGPT')}
                  >
                    {t('accountingVerse')}
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'ChemGPT' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ChemGPT')}
                  >
                    {t('chemVerse')}
                  </button>
                </div>
              </div>
            </header>
            <div className="main-container">
              {/* Chat History in the middle */}
              <div className="chat-container">
                <div className="chat-messages" ref={chatMessagesRef}>
                  {messages.length === 0 ? (
                    <div className="welcome-message">
                      <h2>{t('welcome')} {tabData[activeTab].name}</h2>
                      <p>{t('askMe')}</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div key={index} className={`message ${msg.sender}`}>
                        {msg.image && (
                          <div className="message-image">
                            <img src={URL.createObjectURL(msg.image)} alt="Question" />
                          </div>
                        )}
                        <div className="message-text">
                          {renderText(msg.text)}
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="message bot loading-message">
                      <div className="message-text">
                        <div className="loading-indicator">
                          <div className="loading-spinner-small"></div>
                          <span>{t('solving')}</span>
                        </div>
                        <div className="loading-skeleton">
                          <div className="skeleton-line"></div>
                          <div className="skeleton-line short"></div>
                          <div className="skeleton-line"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Container at the bottom */}
              <div className="input-container">
                {/* Drag & Drop Area */}
                <div 
                  className="drag-drop-area" 
                  onDrop={handleDrop} 
                  onDragOver={handleDragOver}
                  onClick={handleClickUpload}
                >
                  {uploadedImage ? (
                    <div className="uploaded-preview">
                      <img src={URL.createObjectURL(uploadedImage)} alt="Uploaded" />
                      <button className="remove-btn" onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}>×</button>
                    </div>
                  ) : (
                    <>
                      <div className="upload-icon"><Upload size={24} /></div>
                      <p>{t('uploadImage')}</p>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Input Area */}
                <div className="input-area">
                  <div className="dropdown-buttons">
                    <div className="tools-dropdown-container">
                      <button 
                        className={`dropdown-btn ${showToolsDropdown ? 'active' : ''}`}
                        onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                      >
                        <span className="btn-icon"><Settings size={16} /></span>
                        <span className="btn-text">{t('tools')}</span>
                        <span className="dropdown-arrow">{showToolsDropdown ? '▲' : '▼'}</span>
                      </button>
                      {showToolsDropdown && (
                        <div className="tools-dropdown-menu">
                          <button 
                            className="tools-option"
                            onClick={() => {
                              setShowCanvasModal(true);
                              setShowToolsDropdown(false);
                            }}
                          >
                            <Plus size={16} /> {t('canvas')}
                          </button>
                          <button 
                            className="tools-option"
                            onClick={() => {
                              setShowGraphCreator(true);
                              setShowToolsDropdown(false);
                            }}
                          >
                            <BarChart3 size={16} /> {t('graphCreator')}
                          </button>
                          <button 
                            className="tools-option"
                            onClick={() => {
                              setShowStudyGuide(true);
                              setShowToolsDropdown(false);
                            }}
                          >
                            <Book size={16} /> {t('studyGuide')}
                          </button>
                          <button 
                            className="tools-option"
                            onClick={() => {
                              setShowCalculator(true);
                              setShowToolsDropdown(false);
                            }}
                          >
                            <CalcIcon size={16} /> {t('calculator')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <MathInput
                    value={input}
                    onChange={setInput}
                    onKeyPress={handleKeyPress}
                    placeholder={t('placeholder')}
                    selectedTools={selectedTools}
                    onRemoveTool={removeTool}
                  />
                  
                  <button 
                    className="send-btn" 
                    onClick={sendMessage} 
                    disabled={loading || (!input.trim() && !uploadedImage)}
                  >
                    <span className="send-icon"><Send size={20} /></span>
                  </button>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
          {/* Canvas Drawing Modal */}
          <CanvasDrawing 
            isOpen={showCanvasModal}
            onClose={() => setShowCanvasModal(false)}
            onDone={handleCanvasDone}
          />
          
          {/* Graph Creator Modal */}
          {showGraphCreator && (
            <div className="modal-overlay" onClick={() => setShowGraphCreator(false)}>
              <div className="modal-content graph-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Graph Creator</h3>
                  <button 
                    className="modal-close-btn"
                    onClick={() => setShowGraphCreator(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <GraphCreator />
                </div>
              </div>
            </div>
          )}
          
          {/* Math Study Guide Modal */}
          {showStudyGuide && (
            <div className="modal-overlay" onClick={() => setShowStudyGuide(false)}>
              <div className="modal-content study-guide-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{t('studyGuide')}</h3>
                  <button 
                    className="modal-close-btn"
                    onClick={() => setShowStudyGuide(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <MathStudyGuide />
                </div>
              </div>
            </div>
          )}

          {/* Calculator Modal */}
          {showCalculator && (
            <div className="modal-overlay" onClick={() => setShowCalculator(false)}>
              <div className="modal-content calculator-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div style={{display: 'flex', alignItems: 'center', gap: '9px'}}>
                    <div className="logo-circle">
                      <span className="logo-symbol">√</span>
                    </div>
                    <h3>{t('advCalc')}</h3>
                  </div>
                  <button 
                    className="modal-close-btn"
                    onClick={() => setShowCalculator(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <Calculator onSolve={handleCalcSolve} onClear={handleCalcClear} />
                  {calcResult && (
                    <div className="calc-result-container">
                      <h4>📊{t('solution')}</h4>
                      <div className="calc-result-box">
                        <p><strong>🔹{t('problem')}:</strong> {calcResult.problem}</p>
                        <p><strong>🔹{t('modeDetected')}:</strong> {calcResult.mode}</p>
                        <div className="calc-steps">
                          <strong>🔹{t('steps')}:</strong>
                          <ul>
                            {calcResult.steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="calc-final-answer"><strong>🔹{t('finalAnswer')}:</strong> {calcResult.answer}</p>
                      </div>
                    </div>
                  )}
                  {calcError && (
                    <div className="calc-error-container">
                      <p className="calc-error-message">❌{calcError}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
