import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from './TranslationContext';
import { Download } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import './LandingPage.css';
import AuthModal from './AuthModal';
import CanvasDrawing from './CanvasDrawing';

function LandingPage({ onStartChat }) {
  const { t } = useTranslation();
  const { isInstallable, promptInstall } = usePWAInstall();
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
            <span className="nav-logo-text">{t('GanitPeak')}</span>
          </div>
          {isInstallable && (
            <div className="nav-buttons">
              <button className="nav-btn install-app-nav-btn" onClick={promptInstall}>
                <Download size={16} />
                <span>Install App</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-content">
          <div className="logo-section">
            <div className="logo-circle">
              <span className="logo-symbol">√</span>
            </div>
            <h1>{t('GanitPeak')}</h1>
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
              ✓ {t('feature1')}<br />
              ✓ {t('feature2')}<br />
              ✓ {t('feature3')}<br />
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

      {/* Crawlable Subject Capabilities Grid for SEO */}
      <section className="capabilities-section" aria-label="Subject Capabilities">
        <div className="section-header-block">
          <h2>Comprehensive AI Homework & Problem Solving on GanitPeak</h2>
          <p>Whether you know us as <strong>GanitPeak</strong> or <strong>Ganit Peak (GanitPeak AI)</strong>, explore step-by-step solutions with detailed formulas, derivations, and balance sheets across all core STEM and business disciplines.</p>
        </div>

        <div className="capabilities-grid">
          <article className="capability-card">
            <div className="capability-icon">📐</div>
            <h3>AI Math Solver</h3>
            <p>
              Master complex mathematical problems with instant, step-by-step guidance. Ganit Peak provides detailed proofs, derivations, and clear step breakdowns.
            </p>
            <ul className="capability-list">
              <li><strong>Algebra:</strong> Polynomial factorization, quadratic formulas, systems of linear equations, and inequalities.</li>
              <li><strong>Calculus:</strong> Limits, derivatives, chain rule, definite/indefinite integrals, and differential equations.</li>
              <li><strong>Geometry:</strong> Coordinate geometry, polygon areas, circle theorems, and 3D surface area calculations.</li>
              <li><strong>Trigonometry:</strong> Trigonometric identities, inverse functions, sine & cosine laws, and radian angles.</li>
            </ul>
          </article>

          <article className="capability-card">
            <div className="capability-icon">⚡</div>
            <h3>AI Physics Solver</h3>
            <p>
              Break down challenging physics principles into digestible, concept-first explanations accompanied by exact mathematical solutions.
            </p>
            <ul className="capability-list">
              <li><strong>Classical Mechanics:</strong> Newton's laws of motion, friction, momentum, energy conservation, and circular motion.</li>
              <li><strong>Kinematics:</strong> 1D and 2D projectile motion, velocity vectors, acceleration graphs, and trajectories.</li>
              <li><strong>Electromagnetism:</strong> Coulomb's law, electric fields, Gauss's law, capacitance, and magnetic flux.</li>
              <li><strong>Thermodynamics & Waves:</strong> Heat engines, entropy, wave interference, Doppler effect, and optics.</li>
            </ul>
          </article>

          <article className="capability-card">
            <div className="capability-icon">📊</div>
            <h3>AI Accounting Solver</h3>
            <p>
              Resolve complex corporate, managerial, and financial accounting problems with verified ledger equations and reporting formats.
            </p>
            <ul className="capability-list">
              <li><strong>Financial Statements:</strong> Balance sheet formulation, income statements, and cash flow statement breakdowns.</li>
              <li><strong>Bookkeeping:</strong> Debit and credit rules, double-entry journal entries, general ledger posting, and trial balance.</li>
              <li><strong>Financial Analysis:</strong> Liquidity ratios, profitability margins, debt-to-equity metrics, and return on assets.</li>
              <li><strong>Cost & Managerial:</strong> Break-even analysis, depreciation schedules (straight-line, declining), and variance analysis.</li>
            </ul>
          </article>

          <article className="capability-card">
            <div className="capability-icon">🧪</div>
            <h3>AI Chemistry Solver</h3>
            <p>
              Solve quantitative and conceptual chemistry equations with precise molecular weights and step-by-step chemical principles.
            </p>
            <ul className="capability-list">
              <li><strong>Equation Balancing:</strong> Automatic redox reaction balancing, combustion reactions, and precipitation equations.</li>
              <li><strong>Stoichiometry:</strong> Limiting reagent calculation, percent yield, mole-to-gram conversions, and Avogadro calculations.</li>
              <li><strong>Thermodynamics & Kinetics:</strong> Enthalpy change (ΔH), Gibbs free energy, Hess's law, and reaction rate laws.</li>
              <li><strong>Solutions & Acid-Base:</strong> Molarity, molality, pH/pOH scales, Henderson-Hasselbalch equation, and buffer systems.</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Crawlable FAQ Section for Search Engines & AI Overviews */}
      <section className="faq-section" aria-label="Frequently Asked Questions">
        <div className="section-header-block">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about using GanitPeak as your AI tutor and homework assistant.</p>
        </div>

        <div className="faq-grid">
          <div className="faq-item">
            <h3>How does GanitPeak solve math, physics, accounting, and chemistry problems?</h3>
            <p>
              GanitPeak uses advanced mathematical AI models to analyze your query—whether typed in text, drawn on our interactive canvas, or uploaded as a photo. It identifies the underlying concepts, solves the problem step-by-step with clear LaTeX formula rendering, and explains every transition so you can learn the methodology.
            </p>
          </div>

          <div className="faq-item">
            <h3>Which academic subjects and topics does GanitPeak support?</h3>
            <p>
              GanitPeak supports all primary STEM and commerce subjects, specifically focused on <strong>Mathematics</strong> (Algebra, Calculus, Geometry, Trigonometry), <strong>Physics</strong> (Mechanics, Kinematics, Electromagnetism), <strong>Accounting</strong> (Balance Sheets, Journal Entries, Financial Ratios), and <strong>Chemistry</strong> (Stoichiometry, Equation Balancing, Acid-Base Solutions).
            </p>
          </div>

          <div className="faq-item">
            <h3>Can I upload photos or handwritten notes of problems?</h3>
            <p>
              Yes! You can take a picture of textbook exercises or handwritten notes and upload it directly. GanitPeak's built-in optical recognition scans the formulas, diagrams, or questions and immediately provides a structured solution.
            </p>
          </div>

          <div className="faq-item">
            <h3>Is GanitPeak free to use?</h3>
            <p>
              Yes, GanitPeak provides free, unlimited access to its AI problem solvers. Students can solve as many math, physics, accounting, and chemistry questions as they need without restrictive daily limits.
            </p>
          </div>

          <div className="faq-item">
            <h3>How do I copy formulas into Word, Overleaf, or assignments?</h3>
            <p>
              Every solution generated by GanitPeak includes a one-click <strong>"Copy Solution"</strong> button. This cleanly copies the entire explanation along with proper math equations and formatting directly to your clipboard.
            </p>
          </div>
        </div>
      </section>

      {/* Semantic Single-Row Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-left">
            <span>GanitPeak — AI Math, Physics, Accounting & Chemistry Solver</span>
          </div>
          <div className="footer-right">
            <span>© 2026 GanitPeak</span>
            <span className="footer-dot">•</span>
           {/* <a href="mailto:your-email@gmail.com" className="footer-contact-link">Contact</a> */}
          </div>
        </div>
      </footer>

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
