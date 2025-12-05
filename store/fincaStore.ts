import { create } from 'zustand';
import { Finca, Parcela, FincaState, ParcelaState } from '@/types/index';
import { apiClient } from '@/services/api';

interface FincaStoreState extends FincaState {
  fetchFincas: () => Promise<void>;
  getFincaById: (id: string) => Promise<Finca | null>;
  createFinca: (finca: Omit<Finca, 'id' | 'fecha_creacion'>) => Promise<Finca>;
  updateFinca: (id: string, finca: Partial<Finca>) => Promise<Finca>;
  deleteFinca: (id: string) => Promise<void>;
  setCurrentFinca: (finca: Finca | null) => void;
  setError: (error: string | null) => void;
}

interface ParcelaStoreState extends ParcelaState {
  fetchParcelasByFinca: (fincaId: string) => Promise<void>;
  createParcela: (parcela: Omit<Parcela, 'id' | 'fecha_creacion'>) => Promise<Parcela>;
  updateParcela: (id: string, parcela: Partial<Parcela>) => Promise<Parcela>;
  deleteParcela: (id: string) => Promise<void>;
  setCurrentParcela: (parcela: Parcela | null) => void;
  setError: (error: string | null) => void;
}

// Store para Fincas
export const useFincaStore = create<FincaStoreState>((set) => ({
  fincas: [],
  currentFinca: null,
  isLoading: false,
  error: null,

  fetchFincas: async () => {
    set({ isLoading: true, error: null });
    try {
      const data: any = await apiClient.getFincas();
      const fincasList = data.results || data || [];
      set({ fincas: fincasList, isLoading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al cargar fincas';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  getFincaById: async (id: string) => {
    try {
      const finca = await apiClient.getFincaById(id);
      return finca;
    } catch (error: any) {
      console.error('Error fetching finca:', error);
      return null;
    }
  },

  createFinca: async (finca: Omit<Finca, 'id' | 'fecha_creacion'>) => {
    set({ isLoading: true, error: null });
    try {
      const newFinca = await apiClient.createFinca(finca);
      set((state) => ({
        fincas: [...state.fincas, newFinca],
        isLoading: false,
      }));
      return newFinca;
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al crear finca';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  updateFinca: async (id: string, finca: Partial<Finca>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedFinca = await apiClient.updateFinca(id, finca);
      set((state) => ({
        fincas: state.fincas.map((f) => (f.id === id ? updatedFinca : f)),
        currentFinca: state.currentFinca?.id === id ? updatedFinca : state.currentFinca,
        isLoading: false,
      }));
      return updatedFinca;
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al actualizar finca';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  deleteFinca: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteFinca(id);
      set((state) => ({
        fincas: state.fincas.filter((f) => f.id !== id),
        currentFinca: state.currentFinca?.id === id ? null : state.currentFinca,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al eliminar finca';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  setCurrentFinca: (finca: Finca | null) => {
    set({ currentFinca: finca });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

// Store para Parcelas
export const useParcelaStore = create<ParcelaStoreState>((set) => ({
  parcelas: [],
  currentParcela: null,
  isLoading: false,
  error: null,

  fetchParcelasByFinca: async (fincaId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data: any = await apiClient.getParcelasByFinca(fincaId);
      const parcelasList = data.results || data || [];
      set({ parcelas: parcelasList, isLoading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al cargar parcelas';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  createParcela: async (parcela: Omit<Parcela, 'id' | 'fecha_creacion'>) => {
    set({ isLoading: true, error: null });
    try {
      const newParcela = await apiClient.createParcela(parcela);
      set((state) => ({
        parcelas: [...state.parcelas, newParcela],
        isLoading: false,
      }));
      return newParcela;
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al crear parcela';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  updateParcela: async (id: string, parcela: Partial<Parcela>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedParcela = await apiClient.updateParcela(id, parcela);
      set((state) => ({
        parcelas: state.parcelas.map((p) => (p.id === id ? updatedParcela : p)),
        currentParcela: state.currentParcela?.id === id ? updatedParcela : state.currentParcela,
        isLoading: false,
      }));
      return updatedParcela;
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al actualizar parcela';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  deleteParcela: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteParcela(id);
      set((state) => ({
        parcelas: state.parcelas.filter((p) => p.id !== id),
        currentParcela: state.currentParcela?.id === id ? null : state.currentParcela,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al eliminar parcela';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  setCurrentParcela: (parcela: Parcela | null) => {
    set({ currentParcela: parcela });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
