import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Dev: empty base URL → Vite proxies /api to the backend. Prod: set VITE_API_BASE_URL.
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Auto-inject JWT token to all requests if present
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error("Token verification failed", err);
          logout(); // Clear token on failure
        }
      }
      setLoading(false);
    };
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      if (!err.response) {
        return {
          success: false,
          error: 'Cannot reach the server. Start the backend (port 8000) and try again.',
        };
      }
      const detail = err.response?.data?.detail;
      const errorMsg =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg).join(', ')
            : 'Invalid email or password';
      return { success: false, error: errorMsg };
    }
  };

  const signup = async (fullName, email, phoneNumber, password, confirmPassword) => {
    try {
      const res = await axios.post('/api/auth/signup', {
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        password,
        confirm_password: confirmPassword
      });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Signup failed. Please try again.";
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  // Axios interceptor to catch unauthorized API response triggers
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContext;
