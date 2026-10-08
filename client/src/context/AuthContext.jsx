import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from token on initial app mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('wallet_token');
      if (token) {
        try {
          const data = await authService.getProfile();
          if (data.success) {
            setUser(data.user);
          }
        } catch (error) {
          console.error('Session restore failed:', error);
          localStorage.removeItem('wallet_token');
          localStorage.removeItem('wallet_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, otp = null) => {
    try {
      const res = await authService.login({ email, password, otp });
      if (res.requireTwoFactor) {
        return { requireTwoFactor: true, message: res.message };
      }

      if (res.token) {
        localStorage.setItem('wallet_token', res.token);
        localStorage.setItem('wallet_user', JSON.stringify(res.user));
        setUser(res.user);
        toast.success(`Welcome back, ${res.user.name}!`);
        return { success: true, user: res.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      if (res.token) {
        localStorage.setItem('wallet_token', res.token);
        localStorage.setItem('wallet_user', JSON.stringify(res.user));
        setUser(res.user);
        toast.success(res.message || 'Account registered successfully!');
        return { success: true, user: res.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('wallet_token');
    localStorage.removeItem('wallet_user');
    setUser(null);
    toast.success('Logged out successfully.');
  };

  const updateProfile = async (data) => {
    try {
      const res = await authService.updateProfile(data);
      if (res.success) {
        setUser((prev) => ({ ...prev, ...res.user }));
        toast.success(res.message || 'Profile updated successfully.');
        return res;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Update failed.';
      toast.error(msg);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
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
