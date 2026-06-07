// API Configuration - Dynamically resolves local, separate, or unified hosting URLs
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    // Dynamic path for Vercel monorepo deployment
    return window.location.origin + '/api';
  }
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;
