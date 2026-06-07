import React, { useState } from 'react';
import './AuthModal.css';
import API_BASE_URL from './apiConfig';

function AuthModal({ isOpen, onClose, onStartChat, initialMode = 'login' }) {
  // state for login or register
  const [state, setState] = useState(initialMode);

  // state for input value
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // state for loading
  const [loading, setLoading] = useState(false);

  // Update state when initialMode changes
  React.useEffect(() => {
    setState(initialMode);
  }, [initialMode]);

  // handle change input value
  const onChangeHandler = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (state === "login") {
        // Login logic
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          // Store user data in localStorage
          const userData = {
            id: result.user_id,
            name: result.name,
            email: result.email,
          };
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', result.access_token);

          // Close modal and start chat with user data
          onClose();
          onStartChat(userData);
        } else {
          alert(result.message || 'Login failed');
        }
      } else {
        // Register logic
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          alert('Registration successful! Please login.');
          setState("login");
          setData({ name: "", email: "", password: "" });
        } else {
          alert(result.message || 'Registration failed');
        }
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>

        <form onSubmit={handleSubmit} className="auth-form">
          <h1 className="auth-title">
            {state === "login" ? "Login" : "Register"}
          </h1>
          <p className="auth-subtitle">
            Please {state === "login" ? "sign in" : "sign up"} to continue
          </p>

          {state !== "login" && (
            <div className="input-group">
              <div className="input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon" viewBox="0 0 24 24">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  placeholder="Name"
                  className="auth-input"
                  name="name"
                  value={data.name}
                  onChange={onChangeHandler}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <div className="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon" viewBox="0 0 24 24">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                type="email"
                placeholder="Email id"
                className="auth-input"
                name="email"
                value={data.email}
                onChange={onChangeHandler}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon" viewBox="0 0 24 24">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                placeholder="Password"
                className="auth-input"
                name="password"
                value={data.password}
                onChange={onChangeHandler}
                required
              />
            </div>
          </div>

          {state === "login" && (
            <div className="forgot-password">
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : (state === "login" ? "Login" : "Create Account")}
          </button>

          <p className="auth-toggle">
            {state === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              className="auth-toggle-btn"
              onClick={() => setState((prev) => prev === "login" ? "register" : "login")}
            >
              {state === "login" ? "Register" : "Login"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
