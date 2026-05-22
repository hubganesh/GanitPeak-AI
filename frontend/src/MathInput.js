import React, { useState, useRef } from 'react';
import { useTranslation } from './TranslationContext';
import './MathInput.css';
import API_BASE_URL from './apiConfig';

const MathInput = ({ value, onChange, placeholder = "Type your question here...", onKeyPress, selectedTools = [], onRemoveTool }) => {
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const recognitionRef = useRef(null);

  const insertSymbol = (symbol) => {
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newValue = value.substring(0, start) + symbol + value.substring(end);
    onChange(newValue);

    // Focus back to input and set cursor position
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    // Map internal language codes to speech recognition codes
    const langMap = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'kn': 'kn-IN'
    };
    recognitionRef.current.lang = langMap[language] || 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setFinalTranscript('');
    };

    recognitionRef.current.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setTranscript(interim);
      if (final) {
        setFinalTranscript(prev => prev + final);
      }
    };

    recognitionRef.current.onerror = (event) => {
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopVoiceRecognition = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const fullTranscript = finalTranscript + transcript;
    if (fullTranscript.trim()) {
      // Send to backend
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/voice_math`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ 
            transcript: fullTranscript.trim(),
            language: language
          })
        });

        const result = await response.json();
        
        if (result.normalizedExpression) {
          // Put the raw transcript in input field so user can edit it
          onChange(fullTranscript.trim());
          
          // Optionally show the normalized result as a suggestion or tooltip
          // For now, just let user edit the raw input
        } else if (result.error) {
          // Fall back to raw transcript if processing failed
          onChange(fullTranscript.trim());
        }
      } catch (error) {
        // Error handled silently
      }
    }

    setTranscript('');
    setFinalTranscript('');
  };

  const cancelVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setTranscript('');
    setFinalTranscript('');
  };

  // Add keyboard event listener for ESC
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isListening) {
        cancelVoiceRecognition();
      }
    };

    if (isListening) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isListening]);

  const symbolCategories = {
    'Basic Operators': [
      { symbol: '+', desc: 'Plus' },
      { symbol: '-', desc: 'Minus' },
      { symbol: '×', desc: 'Multiply' },
      { symbol: '÷', desc: 'Divide' },
      { symbol: '=', desc: 'Equals' },
      { symbol: '≠', desc: 'Not equal' },
      { symbol: '<', desc: 'Less than' },
      { symbol: '>', desc: 'Greater than' },
      { symbol: '≤', desc: 'Less or equal' },
      { symbol: '≥', desc: 'Greater or equal' },
      { symbol: '≈', desc: 'Approximately equal' },
      { symbol: '≡', desc: 'Identical to' },
      { symbol: '∝', desc: 'Proportional to' },
      { symbol: '±', desc: 'Plus-minus' },
      { symbol: '∓', desc: 'Minus-plus' },
    ],
    'Greek Letters': [
      { symbol: 'α', desc: 'Alpha' },
      { symbol: 'β', desc: 'Beta' },
      { symbol: 'γ', desc: 'Gamma' },
      { symbol: 'Γ', desc: 'Capital Gamma' },
      { symbol: 'δ', desc: 'Delta' },
      { symbol: 'Δ', desc: 'Capital Delta' },
      { symbol: 'ε', desc: 'Epsilon' },
      { symbol: 'ζ', desc: 'Zeta' },
      { symbol: 'η', desc: 'Eta' },
      { symbol: 'θ', desc: 'Theta' },
      { symbol: 'Θ', desc: 'Capital Theta' },
      { symbol: 'ι', desc: 'Iota' },
      { symbol: 'κ', desc: 'Kappa' },
      { symbol: 'λ', desc: 'Lambda' },
      { symbol: 'Λ', desc: 'Capital Lambda' },
      { symbol: 'μ', desc: 'Mu' },
      { symbol: 'ν', desc: 'Nu' },
      { symbol: 'ξ', desc: 'Xi' },
      { symbol: 'Ξ', desc: 'Capital Xi' },
      { symbol: 'π', desc: 'Pi' },
      { symbol: 'Π', desc: 'Capital Pi' },
      { symbol: 'ρ', desc: 'Rho' },
      { symbol: 'σ', desc: 'Sigma' },
      { symbol: 'Σ', desc: 'Capital Sigma' },
      { symbol: 'τ', desc: 'Tau' },
      { symbol: 'υ', desc: 'Upsilon' },
      { symbol: 'φ', desc: 'Phi' },
      { symbol: 'Φ', desc: 'Capital Phi' },
      { symbol: 'χ', desc: 'Chi' },
      { symbol: 'ψ', desc: 'Psi' },
      { symbol: 'Ψ', desc: 'Capital Psi' },
      { symbol: 'ω', desc: 'Omega' },
      { symbol: 'Ω', desc: 'Capital Omega' },
    ],
    'Superscripts & Subscripts': [
      { symbol: '⁰', desc: 'Superscript 0' },
      { symbol: '¹', desc: 'Superscript 1' },
      { symbol: '²', desc: 'Superscript 2' },
      { symbol: '³', desc: 'Superscript 3' },
      { symbol: '⁴', desc: 'Superscript 4' },
      { symbol: '⁵', desc: 'Superscript 5' },
      { symbol: '⁶', desc: 'Superscript 6' },
      { symbol: '⁷', desc: 'Superscript 7' },
      { symbol: '⁸', desc: 'Superscript 8' },
      { symbol: '⁹', desc: 'Superscript 9' },
      { symbol: 'ⁿ', desc: 'Superscript n' },
      { symbol: 'ⁱ', desc: 'Superscript i' },
      { symbol: '₀', desc: 'Subscript 0' },
      { symbol: '₁', desc: 'Subscript 1' },
      { symbol: '₂', desc: 'Subscript 2' },
      { symbol: '₃', desc: 'Subscript 3' },
      { symbol: '₄', desc: 'Subscript 4' },
      { symbol: '₅', desc: 'Subscript 5' },
      { symbol: '₆', desc: 'Subscript 6' },
      { symbol: '₇', desc: 'Subscript 7' },
      { symbol: '₈', desc: 'Subscript 8' },
      { symbol: '₉', desc: 'Subscript 9' },
      { symbol: '₊', desc: 'Subscript +' },
      { symbol: '₋', desc: 'Subscript -' },
      { symbol: '₌', desc: 'Subscript =' },
      { symbol: '₍', desc: 'Subscript (' },
      { symbol: '₎', desc: 'Subscript )' },
    ],
    'Calculus & Analysis': [
      { symbol: '∫', desc: 'Integral' },
      { symbol: '∬', desc: 'Double integral' },
      { symbol: '∭', desc: 'Triple integral' },
      { symbol: '∮', desc: 'Contour integral' },
      { symbol: '∂', desc: 'Partial derivative' },
      { symbol: '∇', desc: 'Nabla (gradient)' },
      { symbol: '∆', desc: 'Delta (difference)' },
      { symbol: 'δ', desc: 'Small delta' },
      { symbol: 'ε', desc: 'Epsilon (limit)' },
      { symbol: '∞', desc: 'Infinity' },
      { symbol: '∑', desc: 'Summation' },
      { symbol: '∏', desc: 'Product' },
      { symbol: '∐', desc: 'Coproduct' },
      { symbol: 'lim', desc: 'Limit' },
      { symbol: '→', desc: 'Approaches' },
      { symbol: 'd/dx', desc: 'Derivative' },
      { symbol: 'dy/dx', desc: 'Derivative' },
      { symbol: '∫dx', desc: 'Indefinite integral' },
    ],
    'Functions & Trigonometry': [
      { symbol: 'sin(', desc: 'Sine' },
      { symbol: 'cos(', desc: 'Cosine' },
      { symbol: 'tan(', desc: 'Tangent' },
      { symbol: 'cot(', desc: 'Cotangent' },
      { symbol: 'sec(', desc: 'Secant' },
      { symbol: 'csc(', desc: 'Cosecant' },
      { symbol: 'sinh(', desc: 'Hyperbolic sine' },
      { symbol: 'cosh(', desc: 'Hyperbolic cosine' },
      { symbol: 'tanh(', desc: 'Hyperbolic tangent' },
      { symbol: 'log(', desc: 'Logarithm' },
      { symbol: 'ln(', desc: 'Natural log' },
      { symbol: 'lg(', desc: 'Common log' },
      { symbol: 'exp(', desc: 'Exponential' },
      { symbol: '√(', desc: 'Square root' },
      { symbol: '∛(', desc: 'Cube root' },
      { symbol: '∜(', desc: 'Fourth root' },
      { symbol: '∜(', desc: 'Fourth root' },
      { symbol: 'f(', desc: 'Function f' },
      { symbol: 'g(', desc: 'Function g' },
      { symbol: 'h(', desc: 'Function h' },
    ],
    'Relations & Logic': [
      { symbol: '∈', desc: 'Element of' },
      { symbol: '∉', desc: 'Not element of' },
      { symbol: '⊂', desc: 'Subset' },
      { symbol: '⊆', desc: 'Subset or equal' },
      { symbol: '⊃', desc: 'Superset' },
      { symbol: '⊇', desc: 'Superset or equal' },
      { symbol: '∪', desc: 'Union' },
      { symbol: '∩', desc: 'Intersection' },
      { symbol: '∅', desc: 'Empty set' },
      { symbol: '∀', desc: 'For all' },
      { symbol: '∃', desc: 'Exists' },
      { symbol: '∄', desc: 'Does not exist' },
      { symbol: '∧', desc: 'Logical and' },
      { symbol: '∨', desc: 'Logical or' },
      { symbol: '¬', desc: 'Logical not' },
      { symbol: '⇒', desc: 'Implies' },
      { symbol: '⇔', desc: 'If and only if' },
      { symbol: '⊥', desc: 'Perpendicular' },
      { symbol: '∥', desc: 'Parallel' },
      { symbol: '∠', desc: 'Angle' },
    ],
    'Arrows & Symbols': [
      { symbol: '→', desc: 'Right arrow' },
      { symbol: '←', desc: 'Left arrow' },
      { symbol: '↑', desc: 'Up arrow' },
      { symbol: '↓', desc: 'Down arrow' },
      { symbol: '↔', desc: 'Left-right arrow' },
      { symbol: '↕', desc: 'Up-down arrow' },
      { symbol: '⇒', desc: 'Right double arrow' },
      { symbol: '⇐', desc: 'Left double arrow' },
      { symbol: '⇔', desc: 'Double arrow' },
      { symbol: '↗', desc: 'North east arrow' },
      { symbol: '↘', desc: 'South east arrow' },
      { symbol: '↙', desc: 'South west arrow' },
      { symbol: '↖', desc: 'North west arrow' },
      { symbol: '⟶', desc: 'Long right arrow' },
      { symbol: '⟵', desc: 'Long left arrow' },
      { symbol: '⟷', desc: 'Long double arrow' },
      { symbol: '↺', desc: 'Clockwise arrow' },
      { symbol: '↻', desc: 'Counterclockwise arrow' },
    ],
    'Fractions & Structures': [
      { symbol: '(', desc: 'Left parenthesis' },
      { symbol: ')', desc: 'Right parenthesis' },
      { symbol: '[', desc: 'Left bracket' },
      { symbol: ']', desc: 'Right bracket' },
      { symbol: '{', desc: 'Left brace' },
      { symbol: '}', desc: 'Right brace' },
      { symbol: '|', desc: 'Absolute value' },
      { symbol: '||', desc: 'Norm' },
      { symbol: '⌊', desc: 'Floor' },
      { symbol: '⌋', desc: 'Floor' },
      { symbol: '⌈', desc: 'Ceiling' },
      { symbol: '⌉', desc: 'Ceiling' },
      { symbol: '⟨', desc: 'Bra' },
      { symbol: '⟩', desc: 'Ket' },
      { symbol: '⟪', desc: 'Double bra' },
      { symbol: '⟫', desc: 'Double ket' },
      { symbol: '¯', desc: 'Overline' },
      { symbol: '~', desc: 'Tilde' },
      { symbol: '⋅', desc: 'Dot product' },
      { symbol: '×', desc: 'Cross product' },
    ],
    'Matrices & Vectors': [
      { symbol: '⎛', desc: 'Left matrix bracket' },
      { symbol: '⎜', desc: 'Middle matrix bracket' },
      { symbol: '⎝', desc: 'Bottom matrix bracket' },
      { symbol: '⎞', desc: 'Right matrix bracket' },
      { symbol: '⎟', desc: 'Middle matrix bracket' },
      { symbol: '⎠', desc: 'Bottom matrix bracket' },
      { symbol: '→', desc: 'Vector arrow' },
      { symbol: '⃗', desc: 'Vector arrow above' },
      { symbol: '̂', desc: 'Vector hat' },
      { symbol: '⃗', desc: 'Vector tilde' },
      { symbol: 'î', desc: 'i unit vector' },
      { symbol: 'ĵ', desc: 'j unit vector' },
      { symbol: 'k̂', desc: 'k unit vector' },
      { symbol: '×', desc: 'Cross product' },
      { symbol: '⋅', desc: 'Dot product' },
      { symbol: '⊗', desc: 'Tensor product' },
    ],
    'Special Characters': [
      { symbol: '°', desc: 'Degree' },
      { symbol: '′', desc: 'Prime' },
      { symbol: '″', desc: 'Double prime' },
      { symbol: '‴', desc: 'Triple prime' },
      { symbol: 'ℝ', desc: 'Real numbers' },
      { symbol: 'ℂ', desc: 'Complex numbers' },
      { symbol: 'ℚ', desc: 'Rational numbers' },
      { symbol: 'ℤ', desc: 'Integers' },
      { symbol: 'ℕ', desc: 'Natural numbers' },
      { symbol: 'ℙ', desc: 'Primes' },
      { symbol: '∴', desc: 'Therefore' },
      { symbol: '∵', desc: 'Because' },
      { symbol: '⊕', desc: 'Direct sum' },
      { symbol: '⊗', desc: 'Tensor product' },
      { symbol: '⊙', desc: 'Hadamard product' },
      { symbol: '⊠', desc: 'Boxed times' },
      { symbol: '△', desc: 'Triangle' },
      { symbol: '□', desc: 'Square' },
      { symbol: '○', desc: 'Circle' },
      { symbol: '◇', desc: 'Diamond' },
    ]
  };

  return (
    <div className="math-input-container">
      <div className="math-input-wrapper">
        {isListening && (
          <div className="voice-overlay">
            <div className="voice-modal">
              <div className="voice-header">
                <div className="voice-waveform">
                  <div className="waveform-bars">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="voice-transcript">
                <div className="transcript-display">
                  <div className="final-transcript">{finalTranscript}</div>
                  <div className="interim-transcript">{transcript}</div>
                </div>
              </div>
              <div className="voice-controls">
                <button 
                  className="voice-btn cancel-btn" 
                  onClick={cancelVoiceRecognition}
                  title="Cancel (ESC)"
                >
                  ✕ Cancel
                </button>
                <button 
                  className="voice-btn done-btn" 
                  onClick={stopVoiceRecognition}
                  title="Done (Stop Recording)"
                >
                  ✓ Done
                </button>
              </div>
            </div>
          </div>
        )}
        {selectedTools.length > 0 && (
          <div className="tool-chips">
            {selectedTools.map((tool, index) => (
              <span key={index} className="tool-chip">
                {tool}
                <button 
                  type="button" 
                  className="chip-remove-btn"
                  onClick={() => onRemoveTool && onRemoveTool(tool)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="input-with-mic">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
            className="math-input-field"
          />
          <button
            type="button"
            onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            title="Voice Math"
            aria-label="Voice Math"
          >
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="2" height="8" fill="currentColor"/>
              <rect x="6" y="4" width="2" height="12" fill="currentColor"/>
              <rect x="10" y="2" width="2" height="16" fill="currentColor"/>
              <rect x="14" y="4" width="2" height="12" fill="currentColor"/>
              <rect x="18" y="6" width="2" height="8" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`math-input-dropdown-btn ${isOpen ? 'active' : ''}`}
          title="Math Symbols"
        >
          Math Input ▼
        </button>
      </div>

      {isOpen && (
        <div className="math-symbols-dropdown">
          {Object.entries(symbolCategories).map(([category, symbols]) => (
            <div key={category} className="math-symbols-category">
              <h4 className="math-symbols-category-title">{category}</h4>
              <div className="math-symbols-grid">
                {symbols.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertSymbol(item.symbol)}
                    className="math-symbol-btn"
                    title={item.desc}
                  >
                    {item.symbol}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MathInput;
