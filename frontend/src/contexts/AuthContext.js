import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { clearAuthToken } from '../utils/tokenStorage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await api.refresh();
      setUser(data.user);
    } catch (error) {
      setUser(null);
      clearAuthToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    // Don't set user here, let checkAuth do it
    await checkAuth(); // This will fetch full user data with isProfileComplete
    return data;
  };

  const register = async (email, password) => {
    const data = await api.register(email, password);
    // For new registrations, we know profile is incomplete
    setUser({ ...data.user, isProfileComplete: false });
    return data;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    clearAuthToken();
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};