import React, { useState, useEffect } from 'react';
import { useTranslation } from './TranslationContext';
import { BlockMath, InlineMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from './apiConfig';
import { 
  BookOpen, 
  Settings, 
  Layers, 
  ChevronRight, 
  Plus, 
  Minus, 
  UploadCloud, 
  Check, 
  X, 
  Clock, 
  Zap, 
  Activity, 
  Swords, 
  Hash, 
  Play,
  FileText,
  HelpCircle,
  Trophy,
  RefreshCcw,
  ArrowRight,
  Eye // eslint-disable-line no-unused-vars
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import './QuizGenerator.css';

const Quiz = () => {
  const { language, t, formatNumber } = useTranslation();
  const subjects = [
    { id: 'Mathematics', label: t('mathematics'), icon: <BookOpen size={18} /> },
    { id: 'Physics', label: t('physics'), icon: <Zap size={18} /> },
    { id: 'Chemistry', label: t('chemistry'), icon: <Activity size={18} /> },
    { id: 'Accounting', label: t('accounting'), icon: <Layers size={18} /> }
  ];


  // State
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState(['multiple_choice']);
  const [subtopics, setSubtopics] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [enableTimer, setEnableTimer] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showHint, setShowHint] = useState(false);

  // Difficulty Mapping
  const difficultyOptions = [
    { id: 'easy', label: 'Easy', icon: <Zap size={14} /> },
    { id: 'medium', label: 'Medium', icon: <Activity size={14} /> },
    { id: 'hard', label: 'Hard', icon: <Swords size={14} /> }
  ];

  // Question Types
  const questionTypeOptions = [
    { id: 'multiple_choice', label: 'Multiple Choice' },
    { id: 'true_false', label: 'True/False' },
    { id: 'fill_in', label: 'Fill-in-the-Blank' }
  ];

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      handleAnswerSubmit('timeout');
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleTypeToggle = (id) => {
    setSelectedTypes(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setSubtopics(prev => [...new Set([...prev, tagInput.trim()])]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setSubtopics(prev => prev.filter(t => t !== tag));
  };

  const getDifficultyLabel = (id) => {
    switch (id) {
      case 'easy': return t('easy');
      case 'medium': return t('medium');
      case 'hard': return t('hard');
      default: return id;
    }
  };

  const getQuestionTypeLabel = (id) => {
    switch (id) {
      case 'multiple_choice': return t('multipleChoice');
      case 'true_false': return t('trueFalse');
      case 'fill_in': return t('fillIn');
      default: return id;
    }
  };

  const renderText = (text) => {
    if (!text) return '';
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return <BlockMath key={index} math={part.slice(2, -2)} />;
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        return <InlineMath key={index} math={part.slice(1, -1)} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const saveQuizResults = async (score, total) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const percentage = ((score / total) * 100);
      
      await fetch(`${API_BASE_URL}/quiz_history`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject,
          topic: topic || 'Custom Quiz',
          score,
          total,
          percentage
        }),
      });
    } catch (error) {
      // Error handled silently
    }
  };

  useEffect(() => {
    if (quizCompleted && quizData) {
      saveQuizResults(correctCount, quizData.questions.length);
    }
  }, [quizCompleted]);

  const handleStartQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('topic', topic);
      formData.append('difficulty', difficulty);
      formData.append('num_questions', numQuestions);
      formData.append('question_types', selectedTypes.join(','));
      formData.append('language', language);
      if (subtopics.length > 0) {
        subtopics.forEach(st => formData.append('subtopics[]', st));
      }
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }

      const response = await fetch(`${API_BASE_URL}/generate_quiz`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to generate quiz');
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.questions && data.questions.length > 0) {
        setQuizData(data);
        setCurrentQuestion(0);
        setUserAnswers(new Array(data.questions.length).fill(''));
        setCorrectCount(0);
        setWrongCount(0);
        setQuizCompleted(false);
        setShowFeedback(false);
        if (enableTimer) {
          setTimeLeft(20);
          setTimerActive(true);
        }
      } else {
        throw new Error('No questions were generated. Please try a different topic.');
      }
    } catch (error) {
      alert('Error generating quiz: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (answer) => {
    if (showFeedback) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);

    const isCorrect = answer.toLowerCase() === quizData.questions[currentQuestion].correct_answer.toLowerCase();
    if (isCorrect) setCorrectCount(prev => prev + 1);
    else setWrongCount(prev => prev + 1);

    setShowFeedback(true);
    setTimerActive(false);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowFeedback(false);
      setShowHint(false);
      if (enableTimer) {
        setTimeLeft(20);
        setTimerActive(true);
      }
    } else {
      setQuizCompleted(true);
    }
  };

  // Rendering Quiz View
  if (quizData && !quizCompleted) {
    const question = quizData.questions[currentQuestion];
    // eslint-disable-next-line no-unused-vars
    const isCorrect = showFeedback && question.correct_answer.toLowerCase() === userAnswers[currentQuestion].toLowerCase();

    return (
      <div className="quiz-dashboard-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="quiz-section-card"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="text-indigo-600" />
                {subjects.find(s => s.id === subject)?.label || subject}: {topic || t('customQuiz')}
              </h2>
              <p className="text-sm text-slate-500">{t('questionOf', { current: currentQuestion + 1, total: quizData.questions.length })}</p>
            </div>
            {enableTimer && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
                <Clock size={18} />
                {formatNumber(timeLeft)}s
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
            <div className="text-lg font-medium leading-relaxed">
              {renderText(question.text)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((opt, i) => {
              const isOptionCorrect = showFeedback && opt.toLowerCase() === question.correct_answer.toLowerCase();
              const isSelected = showFeedback && opt.toLowerCase() === userAnswers[currentQuestion].toLowerCase();
              
              return (
                <button
                  key={i}
                  onClick={() => handleAnswerSubmit(opt)}
                  disabled={showFeedback}
                  className={`p-4 rounded-xl text-left border-2 transition-all flex items-center justify-between
                    ${!showFeedback ? 'border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 active:scale-[0.98]' : ''}
                    ${isOptionCorrect ? 'border-green-500 bg-green-50 text-green-700' : ''}
                    ${isSelected && !isOptionCorrect ? 'border-red-500 bg-red-50 text-red-700' : ''}
                    ${showFeedback && !isSelected && !isOptionCorrect ? 'border-slate-100 opacity-60' : ''}
                  `}
                >
                  <span>{renderText(opt)}</span>
                  {isOptionCorrect && <Check size={20} className="text-green-600" />}
                  {isSelected && !isOptionCorrect && <X size={20} className="text-red-600" />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 pt-8 border-t border-slate-100"
              >
                <div className="bg-indigo-50 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <HelpCircle size={18} />
                    {t('explanation')}
                  </h4>
                  <div className="text-indigo-800 leading-relaxed">
                    {renderText(question.explanation)}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    {currentQuestion < quizData.questions.length - 1 ? t('nextQuestion') : t('finishQuiz')}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // Quiz Results Summary
  if (quizCompleted) {
    const total = quizData.questions.length;
    const percentage = ((correctCount / total) * 100).toFixed(0);

    return (
      <div className="quiz-dashboard-container">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="quiz-section-card text-center"
        >
          <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-extrabold mb-2">{t('quizCompleted')}</h2>
          <p className="text-slate-500 mb-8">{t('greatJob')}</p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-4xl font-black text-indigo-600 mb-1">{formatNumber(percentage)}%</div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('overallScore')}</div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-4xl font-black text-slate-800 mb-1">{formatNumber(correctCount)}/{formatNumber(total)}</div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('correctAnswers')}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => { setQuizData(null); setQuizCompleted(false); }}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <RefreshCcw size={18} />
              {t('tryAnother')}
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              {t('backToHome')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard / Setup View
  return (
    <div className="quiz-dashboard-container animate-fade-in">
      <header className="quiz-header">
        <h1>{t('interactiveQuizGenerator')}</h1>
        <p>{t('quizSubtitle')}</p>
      </header>

      {/* Quiz Setup Section */}
      <section className="quiz-section-card">
        <h3 className="section-title">
          <BookOpen size={20} />
          {t('quizSetup')}
        </h3>
        
        <div className="quiz-grid">
          <div className="form-field">
            <label className="form-label">{t('subject')}</label>
            <div className="input-wrapper">
              <div className="input-icon">
                {subjects.find(s => s.id === subject)?.icon || <BookOpen size={18} />}
              </div>
              <select 
                className="quiz-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">{t('topic')}</label>
            <div className="input-wrapper">
              <div className="input-icon"><ArrowRight size={18} /></div>
              <input 
                type="text" 
                className="quiz-input" 
                placeholder={t('topicPlaceholder')} 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>
            {!topic.trim() && <span className="error-text">{t('topicRequired')}</span>}
          </div>
        </div>

        <div className="mt-8">
          <label className="form-label mb-3 block">{t('extractFile')}</label>
          <div 
            className={`drop-zone ${uploadedFile ? 'border-indigo-600 bg-indigo-50' : ''}`}
            onClick={() => document.getElementById('fileUpload').click()}
          >
            <UploadCloud className="drop-zone-icon" />
            <div className="font-bold text-slate-800">
              {uploadedFile ? uploadedFile.name : t('dragDrop')}
            </div>
            <p className="text-xs text-slate-500 mt-1">{t('fileSupport')}</p>
            <input 
              id="fileUpload"
              type="file" 
              className="hidden" 
              onChange={(e) => setUploadedFile(e.target.files[0])}
            />
          </div>
        </div>
      </section>

      {/* Question Configuration Section */}
      <section className="quiz-section-card">
        <h3 className="section-title">
          <Settings size={20} />
          {t('configuration')}
        </h3>

        <div className="quiz-grid">
          <div className="form-field">
            <label className="form-label">{t('difficultyLevel')}</label>
            <div className="segmented-control">
              {difficultyOptions.map(opt => (
                <div 
                  key={opt.id}
                  className={`segment-item flex items-center justify-center gap-2 ${difficulty === opt.id ? 'active' : ''}`}
                  onClick={() => setDifficulty(opt.id)}
                >
                  {opt.icon}
                  {getDifficultyLabel(opt.id)}
                </div>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">{t('numQuestions')}</label>
            <div className="stepper-input">
              <button className="step-btn" onClick={() => setNumQuestions(Math.max(1, numQuestions - 1))}>
                <Minus size={18} />
              </button>
              <div className="step-value">{formatNumber(numQuestions)}</div>
              <button className="step-btn" onClick={() => setNumQuestions(Math.min(50, numQuestions + 1))}>
                <Plus size={18} />
              </button>
            </div>
            <span className="helper-text">{t('recommended')}</span>
          </div>
        </div>

        <div className="mt-8">
          <label className="form-label mb-3 block">{t('questionTypes')}</label>
          <div className="chips-container">
            {questionTypeOptions.map(type => (
              <div 
                key={type.id}
                className={`chip ${selectedTypes.includes(type.id) ? 'active' : ''}`}
                onClick={() => handleTypeToggle(type.id)}
              >
                {getQuestionTypeLabel(type.id)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Options Section */}
      <section className="quiz-section-card">
        <h3 className="section-title">
          <Layers size={20} />
          {t('advancedOptions')}
        </h3>

        <div className="form-field mb-8">
          <label className="form-label flex items-center gap-2">
            <Hash size={16} />
            {t('subtopicsLabel')}
          </label>
          <div className="tag-input-wrapper">
            {subtopics.map(tag => (
              <div key={tag} className="tag-item">
                {tag}
                <X size={14} className="tag-remove" onClick={() => removeTag(tag)} />
              </div>
            ))}
            <input 
              type="text" 
              className="tag-input-field"
              placeholder={t('subtopicsPlaceholder')}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
          <span className="helper-text italic">{t('subtopicsHelper')}</span>
        </div>

        <div className="switch-container p-4 bg-slate-50 rounded-xl">
          <div>
            <div className="font-bold flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              {t('enableTimer')}
            </div>
            <p className="text-xs text-slate-500">{t('timerHelper')}</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={enableTimer} onChange={(e) => setEnableTimer(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>
      </section>

      {/* Sample Preview Mockup */}
      <div className="flex items-center gap-2 text-slate-400 mb-6 justify-center">
        <span className="text-sm font-medium">{t('previewGeneration')}</span>
      </div>

      <button 
        className="start-quiz-btn"
        disabled={loading || !topic.trim()}
        onClick={handleStartQuiz}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {t('generatingQuiz')}
          </>
        ) : (
          <>
            <Play fill="currentColor" size={20} />
            {t('generateStart')}
          </>
        )}
      </button>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">
          {t('poweredByGemini')}
        </p>
      </div>
    </div>
  );
};

export default Quiz;
