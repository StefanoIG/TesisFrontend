/**
 * Zustand Trazabilidad Store
 * Maneja datos de lotes, eventos y trazabilidad
 */

import { create } from 'zustand';
import { Lote, Evento, LoteState } from '@/types/index';
import { apiClient } from '@/services/api';

interface TrazabilidadStoreState extends LoteState {
  currentEvento: Evento | null;
  eventos: Evento[];

  fetchLotes: () => Promise<void>;
  setCurrentLote: (lote: Lote | null) => void;
  createLote: (data: any) => Promise<Lote>;
  updateLote: (id: string, data: any) => Promise<Lote>;
  deleteLote: (id: string) => Promise<void>;

  fetchEventos: (loteId: string) => Promise<void>;
  createEvento: (data: any) => Promise<Evento>;
}

export const useTrazabilidadStore = create<TrazabilidadStoreState>((set, get) => ({
  lotes: [],
  currentLote: null,
  eventos: [],
  currentEvento: null,
  isLoading: false,
  error: null,

  fetchLotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.getLotes();
      const lotes = data.results || data;
      set({ lotes, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error fetching lotes',
        isLoading: false,
      });
    }
  },

  setCurrentLote: (lote: Lote | null) => {
    set({ currentLote: lote });
  },

  createLote: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const newLote = await apiClient.createLote(data);
      const lotes = [...get().lotes, newLote];
      set({ lotes, isLoading: false });
      return newLote;
    } catch (error: any) {
      set({
        error: error.message || 'Error creating lote',
        isLoading: false,
      });
      throw error;
    }
  },

  updateLote: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const updatedLote = await apiClient.put(`/trazabilidad/lotes/${id}/`, data);
      const lotes = get().lotes.map((l) => (l.id === id ? updatedLote : l));
      set({ lotes, isLoading: false });
      return updatedLote;
    } catch (error: any) {
      set({
        error: error.message || 'Error updating lote',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteLote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/trazabilidad/lotes/${id}/`);
      const lotes = get().lotes.filter((l) => l.id !== id);
      set({ lotes, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error deleting lote',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchEventos: async (loteId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.get(`/trazabilidad/lotes/${loteId}/eventos/`);
      const eventos = data.results || data;
      set({ eventos, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error fetching eventos',
        isLoading: false,
      });
    }
  },

  createEvento: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const newEvento = await apiClient.post(`/trazabilidad/lotes/${data.lote_id}/eventos/`, data);
      const eventos = [...get().eventos, newEvento];
      set({ eventos, isLoading: false });
      return newEvento;
    } catch (error: any) {
      set({
        error: error.message || 'Error creating evento',
        isLoading: false,
      });
      throw error;
    }
  },
}));
