/**
 * AuthContext - Gestion de l'authentification
 * Réplique la logique de l'application web
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import ApiService from '../services';
import StorageService from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await StorageService.getAuthToken();
      const savedUser = await StorageService.getAuthUser();

      if (token && savedUser) {
        setAuthToken(token);
        setUser(savedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('[AuthContext] 🔐 Login attempt for:', username);
      const response = await ApiService.login(username, password);

      // Le backend retourne { valid, user, token, message }
      if (response.valid && response.token) {
        console.log('[AuthContext] ✅ Login successful, updating context');
        setAuthToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      }

      console.log('[AuthContext] ❌ Login failed:', response.message);
      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      console.error('[AuthContext] ❌ Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      setUser({ ...user, ...userData });
      await StorageService.saveAuthUser({ ...user, ...userData });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const value = {
    user,
    authToken,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
