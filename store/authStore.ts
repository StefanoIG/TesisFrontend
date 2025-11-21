import { create } from 'zustand';
import { User, AuthState } from '@/types/index';
import { apiClient } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '@/constants/theme-new';
import { router } from 'expo-router';
import { Platform } from 'react-native';

interface AuthStoreState extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.login(username, password);
      set({
        user: data.usuario,
        token: data.access,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    await apiClient.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
    
    // Redirigir al login
    try {
      if (Platform.OS === 'web') {
        router.replace('/(web)/login');
      } else {
        router.replace('/login');
      }
    } catch (e) {
      console.error('Error redirecting to login:', e);
    }
  },

  checkAuth: async () => {
    try {
      const user = await apiClient.getUser();
      const token = await AsyncStorage.getItem(StorageKeys.ACCESS_TOKEN);
      
      if (user && token) {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      } else {
        set({ 
          user: null,
          token: null,
          isAuthenticated: false 
        });
      }
    } catch (error) {
      set({ 
        user: null,
        token: null,
        isAuthenticated: false 
      });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
