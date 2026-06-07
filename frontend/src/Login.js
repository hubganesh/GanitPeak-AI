import React, { useState } from 'react';
import './Login.css';
import API_BASE_URL from './apiConfig';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: data.user_id,
          name: data.name,
          email: data.email,
        };
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        onLogin(userData);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Video/Animation */}
      <div className="login-background">
        <div className="hud-circle"></div>
        <div className="hud-ring"></div>
        <div className="grid-overlay"></div>
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>
      </div>

      {/* Glassmorphic Login Card */}
      <div className="login-card">
        <div className="card-glow"></div>
        
        <h1 className="login-title">Login</h1>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="email" className="input-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="gradient-button"
            disabled={loading}
          >
            {loading ? (
              <span className="button-loading">
                <span className="spinner"></span>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="login-footer">
          <a href="#forgot" className="footer-link">Forgot password?</a>
          <span className="footer-divider">•</span>
          <button onClick={onSwitchToRegister} className="footer-link-button">
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
