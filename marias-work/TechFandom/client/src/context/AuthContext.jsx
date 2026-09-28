import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fhp_token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch profile if token exists
  const fetchProfile = useCallback(async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error('Session expired');
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error('Profile fetch failed:', err.message);
      localStorage.removeItem('fhp_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  // Login
  const login = async (email, password, rememberMe = false) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('fhp_token', data.token);
    if (rememberMe) localStorage.setItem('fhp_remember', email);
    else localStorage.removeItem('fhp_remember');

    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Register
  const register = async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    localStorage.setItem('fhp_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('fhp_token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};