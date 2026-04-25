import { create } from 'zustand';
import { Wallet, Transaction } from '../types/api';
import * as walletApi from '../services/api/wallet.api';

interface WalletState {
  wallet: Wallet | null;
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBalance: () => Promise<void>;
  fetchWallet: () => Promise<void>;
  fetchTransactions: (filters?: {
    type?: 'top_up' | 'debit' | 'refund';
    page?: number;
    limit?: number;
  }) => Promise<void>;
  initializeTopUp: (
    amount: number,
    paymentMethod: 'card' | 'bank_transfer' | 'ussd'
  ) => Promise<{ paymentUrl: string; reference: string }>;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  balance: 0,
  transactions: [],
  isLoading: false,
  error: null,

  fetchBalance: async () => {
    try {
      set({ error: null });

      const result = await walletApi.getBalance();

      set({ balance: result.balance });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch balance error:', error);
    }
  },

  fetchWallet: async () => {
    try {
      set({ isLoading: true, error: null });

      const wallet = await walletApi.getWallet();

      set({
        wallet,
        balance: Number(wallet.balance),
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  fetchTransactions: async (filters) => {
    try {
      set({ isLoading: true, error: null });

      const result = await walletApi.getTransactions(filters);

      set({
        transactions: result.transactions,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  initializeTopUp: async (amount, paymentMethod) => {
    try {
      set({ isLoading: true, error: null });

      const result = await walletApi.initializeTopUp(amount, paymentMethod);

      set({ isLoading: false });

      return {
        paymentUrl: result.paymentUrl,
        reference: result.reference,
      };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
