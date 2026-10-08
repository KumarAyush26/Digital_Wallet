import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { walletService } from '../services/walletService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const fetchWallet = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await walletService.getWallet();
      if (data.success) {
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet, user]);

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden((prev) => !prev);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // ignore
    }
  };

  const addMoney = async (amount, paymentMethod) => {
    try {
      const res = await walletService.addMoney(amount, paymentMethod);
      if (res.success) {
        setWallet(res.wallet);
        triggerConfetti();
        toast.success(res.message || 'Money added successfully!');
        return res;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add money.';
      toast.error(msg);
      throw error;
    }
  };

  const withdrawMoney = async (payload) => {
    try {
      const res = await walletService.withdrawMoney(payload);
      if (res.success) {
        setWallet(res.wallet);
        toast.success(res.message || 'Withdrawal processed successfully!');
        return res;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Withdrawal failed.';
      toast.error(msg);
      throw error;
    }
  };

  const transferMoney = async (payload) => {
    try {
      const res = await walletService.transferMoney(payload);
      if (res.success) {
        setWallet(res.wallet);
        triggerConfetti();
        toast.success(res.message || 'Payment transferred successfully!');
        return res;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Transfer failed.';
      toast.error(msg);
      throw error;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        loading,
        isBalanceHidden,
        toggleBalanceVisibility,
        fetchWallet,
        setWallet,
        addMoney,
        withdrawMoney,
        transferMoney
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
