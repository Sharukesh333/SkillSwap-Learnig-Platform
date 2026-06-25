import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // Check for stored auth data
      const storedToken = localStorage.getItem('base44_access_token');
      const storedUser = localStorage.getItem('base44_user');
      
      if (storedToken && storedUser) {
        // User is authenticated
        const user = JSON.parse(storedUser);
        setUser(user);
        setIsAuthenticated(true);
      } else {
        // User needs to authenticate
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
      
      setAppPublicSettings({ id: 'skillswap', public_settings: {} });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'auth_required',
        message: 'Authentication required'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      const storedUser = localStorage.getItem('base44_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    localStorage.removeItem('base44_access_token');
    localStorage.removeItem('base44_user');
    
    if (shouldRedirect) {
      setAuthError({
        type: 'auth_required',
        message: 'Authentication required'
      });
    }
  };

  const navigateToLogin = () => {
    setAuthError({
      type: 'auth_required',
      message: 'Authentication required'
    });
  };

  const refreshUser = async () => {
    try {
      const storedUser = localStorage.getItem('base44_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      refreshUser,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
