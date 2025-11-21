/**
 * Zustand UI Store
 * Maneja estado de UI global
 */

import { create } from 'zustand';

interface UIStoreState {
  // Loading
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;

  // Modal
  isModalOpen: boolean;
  modalContent: {
    title?: string;
    message?: string;
    type?: 'info' | 'success' | 'error' | 'warning';
  };
  openModal: (title: string, message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
  closeModal: () => void;

  // Toast
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toastMessage: { message: string; type: 'success' | 'error' | 'info' } | null;
  clearToast: () => void;

  // Current tab
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  isLoading: false,
  setIsLoading: (value: boolean) => set({ isLoading: value }),

  isModalOpen: false,
  modalContent: {},
  openModal: (title: string, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    set({
      isModalOpen: true,
      modalContent: { title, message, type },
    });
  },
  closeModal: () => {
    set({ isModalOpen: false, modalContent: {} });
  },

  showToast: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    set({ toastMessage: { message, type } });
    setTimeout(() => set({ toastMessage: null }), 3000);
  },
  toastMessage: null,
  clearToast: () => set({ toastMessage: null }),

  currentTab: 'home',
  setCurrentTab: (tab: string) => set({ currentTab: tab }),
}));
