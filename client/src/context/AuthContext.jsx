// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useLang } from './LangContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { changeLanguage } = useLang();

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('nr_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');
        const userData = response.data?.user || response.user;
        const profileData = response.data?.profile || response.profile;
        if (userData) {
          setUser(userData);
          setProfile(profileData || null);
          if (userData.preferredLang) {
            changeLanguage(userData.preferredLang);
          }
        }
      } catch (err) {
        localStorage.removeItem('nr_token');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const resData = res.data || res;
    if (resData?.token) {
      localStorage.setItem('nr_token', resData.token);
      setUser(resData.user);
      setProfile(resData.profile || null);
      if (resData.user?.preferredLang) {
        changeLanguage(resData.user.preferredLang);
      }
      return resData;
    }
  };

  const register = async (payload) => {
    const res = await apiClient.post('/auth/register', payload);
    const resData = res.data || res;
    if (resData?.token) {
      localStorage.setItem('nr_token', resData.token);
      setUser(resData.user);
      setProfile(resData.profile || null);
      if (resData.user?.preferredLang) {
        changeLanguage(resData.user.preferredLang);
      }
      return resData;
    }
  };

  const logout = () => {
    localStorage.removeItem('nr_token');
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  const updateProfile = (updatedUser, updatedProfile) => {
    if (updatedUser) setUser(updatedUser);
    if (updatedProfile) setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        role: user?.role || null,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
