import { create } from 'zustand';
import { User } from '../types/api';
import {
  saveToken,
  saveRefreshToken,
  saveUser,
  getToken,
  getRefreshToken,
  getUser,
  clearStorage,
} from '../services/storage/secureStorage';
import * as authApi from '../services/api/auth.api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (phoneNumber: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  register: (data: {
    phoneNumber: string;
    fullName: string;
    email?: string;
    password?: string;
    role: 'consumer' | 'rider';
  }) => Promise<void>;
  registerWithPassword: (data: {
    phoneNumber: string;
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => {
    set({ user });
    saveUser(user);
  },

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken, isAuthenticated: true });
    saveToken(accessToken);
    saveRefreshToken(refreshToken);
  },

  login: async (phoneNumber) => {
    try {
      set({ isLoading: true, error: null });

      const result = await authApi.login(phoneNumber);

      set({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Save to secure storage
      await saveToken(result.accessToken);
      await saveRefreshToken(result.refreshToken);
      await saveUser(result.user);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  loginWithPassword: async (email, password) => {
    try {
      set({ isLoading: true, error: null });

      const result = await authApi.loginWithPassword(email, password);

      set({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Save to secure storage
      await saveToken(result.accessToken);
      await saveRefreshToken(result.refreshToken);
      await saveUser(result.user);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const result = await authApi.register(data);

      set({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Save to secure storage
      await saveToken(result.accessToken);
      await saveRefreshToken(result.refreshToken);
      await saveUser(result.user);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  registerWithPassword: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const result = await authApi.registerWithPassword({
        ...data,
        role: 'consumer', // Default to consumer for the consumer app
      });

      set({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Save to secure storage
      await saveToken(result.accessToken);
      await saveRefreshToken(result.refreshToken);
      await saveUser(result.user);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = get().refreshToken;
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
      await clearStorage();
    }
  },

  loadStoredAuth: async () => {
    try {
      set({ isLoading: true });

      const [token, refreshToken, user] = await Promise.all([
        getToken(),
        getRefreshToken(),
        getUser(),
      ]);

      if (token && user) {
        set({
          user,
          accessToken: token,
          refreshToken,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
