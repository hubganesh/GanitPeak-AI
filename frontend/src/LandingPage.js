import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from './TranslationContext';
import './LandingPage.css';
import AuthModal from './AuthModal';
import CanvasDrawing from './CanvasDrawing';

function LandingPage({ onStartChat }) {
  const { t } = useTranslation();
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [canvasModal, setCanvasModal] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const landingRef = useRef(null);

  const openAuthModal = (mode) => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (landingRef.current) {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Calculate scroll progress (0 to 1) with smoother transition
        const maxScroll = documentHeight - windowHeight;
        let progress = Math.min(scrollTop / maxScroll, 1);
        
        // Apply easing function for more cinematic feel
        progress = progress * progress * (3 - 2 * progress); // Smoothstep function
        
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="landing-page" ref={landingRef}>
      {/* Morphing Background Layers */}
      <div className="background-morph">
        <div 
          className="bg-layer bg-layer-1"
          style={{ 
            opacity: 1 - scrollProgress,
            transform: `scale(${1 + scrollProgress * 0.05})`
          }}
        ></div>
        <div 
          className="bg-layer bg-layer-2"
          style={{ 
            opacity: scrollProgress,
            transform: `scale(${1.05 - scrollProgress * 0.05})`
          }}
        ></div>
        <div 
          className="morph-overlay"
          style={{ 
            opacity: scrollProgress * (1 - scrollProgress) * 4 // Peak at 0.5 scroll
          }}
        ></div>
      </div>
      {/* Navigation Header */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="nav-logo-symbol">√</span>
            <span className="nav-logo-text">{t('mathVerse')}</span>
          </div>
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-content">
          <div className="logo-section">
            <div className="logo-circle">
              <span className="logo-symbol">√</span>
            </div>
            <h1>{t('mathVerse')}</h1>
            <p className="tagline">{t('tagline')}</p>
          </div>
          
          <div className="hero-text">
            <h2>{t('heroTitle')}</h2>
            <p className="subtitle">
              {t('heroSubtitle')}
            </p>
          </div>

          <div className="cta-section">
            <div className="auth-buttons">
              <button className="auth-btn sign-in-btn" onClick={() => openAuthModal('login')}>
                {t('signIn')}
              </button>
              <button className="auth-btn sign-up-btn" onClick={() => openAuthModal('register')}>
                {t('signUp')}
              </button>
            </div>
            <p className="features-preview">
              ✓ {t('feature1')}<br/>
              ✓ {t('feature2')}<br/>
              ✓ {t('feature3')}<br/>
              ✓ {t('feature4')}
            </p>
          </div>
        </div>

        
      </div>

      <div className="features-section">
        <h3>{t('whyChoose')}</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧮</div>
            <h4>{t('advancedAISolver')}</h4>
            <p>{t('advancedAISolverDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📷</div>
            <h4>{t('imageRecognition')}</h4>
            <p>{t('imageRecognitionDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h4>{t('canvasDrawing')}</h4>
            <p>{t('canvasDrawingDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎥</div>
            <h4>{t('videoExplanations')}</h4>
            <p>{t('videoExplanationsDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h4>{t('interactiveQuizzes')}</h4>
            <p>{t('interactiveQuizzesDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧮</div>
            <h4>{t('builtInCalculator')}</h4>
            <p>{t('builtInCalculatorDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>{t('graphCreator')}</h4>
            <p>{t('graphCreatorDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h4>{t('studyGuide')}</h4>
            <p>{t('studyGuideDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h4>{t('performanceReports')}</h4>
            <p>{t('performanceReportsDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌙</div>
            <h4>{t('darkMode')}</h4>
            <p>{t('darkModeDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h4>{t('chatHistory')}</h4>
            <p>{t('chatHistoryDesc')}</p>
          </div>
          
        </div>
      </div>

      <div className="subjects-section">
        <h3>{t('subjectsTitle')}</h3>
        <div className="subjects-grid">
          <span className="subject-tag">{t('algebra')}</span>
          <span className="subject-tag">{t('calculus')}</span>
          <span className="subject-tag">{t('geometry')}</span>
          <span className="subject-tag">{t('trigonometry')}</span>
          <span className="subject-tag">{t('statistics')}</span>
          <span className="subject-tag">{t('physics')}</span>
          <span className="subject-tag">{t('chemistry')}</span>
          <span className="subject-tag">{t('accounting')}</span>
        </div>
      </div>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        onStartChat={onStartChat}
        initialMode={authModal.mode}
      />

      <CanvasDrawing
        isOpen={canvasModal}
        onClose={() => setCanvasModal(false)}
        onDone={(imageData) => {
          // Start chat with the drawn image
          setCanvasModal(false);
          onStartChat(imageData); // Pass the image data to start chat
        }}
      />
    </div>
  );
}

export default LandingPage;
