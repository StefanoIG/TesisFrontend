/**
 * Cliente HTTP con interceptores JWT
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Endpoints, StorageKeys } from '@/constants/theme-new';
import { router } from 'expo-router';
import { Platform } from 'react-native';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;
  private isRefreshing = false;

  constructor() {
    this.client = axios.create({
      baseURL: Endpoints.BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor de request
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(StorageKeys.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de response
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Si el error es 401 y no hemos intentado refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Si no es la ruta de login o refresh
          if (!originalRequest.url?.includes('/auth/token') && !originalRequest.url?.includes('/refresh')) {
            try {
              // Si ya hay un refresh en progreso, esperar
              if (this.refreshPromise) {
                const token = await this.refreshPromise;
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              }

              // Iniciar nuevo refresh
              this.isRefreshing = true;
              this.refreshPromise = this.refreshToken();
              const token = await this.refreshPromise;
              this.refreshPromise = null;
              this.isRefreshing = false;

              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            } catch (refreshError) {
              // Refresh falló, limpiar tokens y redirigir a login
              this.isRefreshing = false;
              this.refreshPromise = null;
              await this.clearAuthAndRedirect();
              return Promise.reject(refreshError);
            }
          } else {
            // Error en login o refresh, solo limpiar
            await AsyncStorage.removeItem(StorageKeys.ACCESS_TOKEN);
            await AsyncStorage.removeItem(StorageKeys.REFRESH_TOKEN);
            await AsyncStorage.removeItem(StorageKeys.USER);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async clearAuthAndRedirect() {
    await AsyncStorage.removeItem(StorageKeys.ACCESS_TOKEN);
    await AsyncStorage.removeItem(StorageKeys.REFRESH_TOKEN);
    await AsyncStorage.removeItem(StorageKeys.USER);
    
    // Redirigir al login según la plataforma
    try {
      if (Platform.OS === 'web') {
        router.replace('/(web)/login');
      } else {
        router.replace('/login');
      }
    } catch (e) {
      console.error('Error redirecting to login:', e);
    }
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = await AsyncStorage.getItem(StorageKeys.REFRESH_TOKEN);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post(Endpoints.REFRESH, {
      refresh: refreshToken,
    });

    const { access } = response.data;
    await AsyncStorage.setItem(StorageKeys.ACCESS_TOKEN, access);

    return access;
  }

  async login(username: string, password: string) {
    const response = await this.client.post(Endpoints.LOGIN, {
      username,
      password,
    });

    const { access, refresh, usuario } = response.data;

    await AsyncStorage.setItem(StorageKeys.ACCESS_TOKEN, access);
    await AsyncStorage.setItem(StorageKeys.REFRESH_TOKEN, refresh);
    await AsyncStorage.setItem(StorageKeys.USER, JSON.stringify(usuario));

    return response.data;
  }

  async logout() {
    await AsyncStorage.removeItem(StorageKeys.ACCESS_TOKEN);
    await AsyncStorage.removeItem(StorageKeys.REFRESH_TOKEN);
    await AsyncStorage.removeItem(StorageKeys.USER);
  }

  async getUser() {
    const userString = await AsyncStorage.getItem(StorageKeys.USER);
    return userString ? JSON.parse(userString) : null;
  }

  // Métodos genéricos
  async get<T>(endpoint: string, params?: any) {
    const response = await this.client.get<T>(endpoint, { params });
    return response.data;
  }

  async post<T>(endpoint: string, data?: any) {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any) {
    const response = await this.client.put<T>(endpoint, data);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: any) {
    const response = await this.client.patch<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string) {
    const response = await this.client.delete<T>(endpoint);
    return response.data;
  }

  // Métodos específicos
  async getEmpresas() {
    return this.get(Endpoints.EMPRESAS);
  }

  async getProductos() {
    return this.get('/trazabilidad/productos/');
  }

  async createProducto(data: any) {
    return this.post('/trazabilidad/productos/', data);
  }

  async updateProducto(id: string, data: any) {
    return this.put(`/trazabilidad/productos/${id}/`, data);
  }

  async deleteProducto(id: string) {
    return this.delete(`/trazabilidad/productos/${id}/`);
  }

  async getLotes() {
    return this.get(Endpoints.LOTES);
  }

  async createLote(data: any) {
    return this.post(Endpoints.LOTES, data);
  }

  async updateLote(id: string, data: any) {
    return this.put(`${Endpoints.LOTES}${id}/`, data);
  }

  async deleteLote(id: string) {
    return this.delete(`${Endpoints.LOTES}${id}/`);
  }

  async getEnvios() {
    return this.get(Endpoints.ENVIOS);
  }

  async createEnvio(data: any) {
    return this.post(Endpoints.ENVIOS, data);
  }

  async updateEnvio(id: string, data: any) {
    return this.put(`${Endpoints.ENVIOS}${id}/`, data);
  }

  async deleteEnvio(id: string) {
    return this.delete(`${Endpoints.ENVIOS}${id}/`);
  }

  async getVehiculos() {
    return this.get('/logistica/vehiculos/');
  }

  async getConductores() {
    return this.get('/logistica/conductores/');
  }

  async getAlertas(params?: { estado?: string; prioridad?: string }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.get(`${Endpoints.ALERTAS}${queryString ? '?' + queryString : ''}`);
  }

  async getAlertasAbiertas() {
    return this.get(`${Endpoints.ALERTAS}abiertas/`);
  }

  async getAlerta(id: string) {
    return this.get(`${Endpoints.ALERTAS}${id}/`);
  }

  async createAlerta(data: any) {
    return this.post(Endpoints.ALERTAS, data);
  }

  async resolverAlerta(id: string, data: any) {
    return this.post(`${Endpoints.ALERTAS}${id}/resolver/`, data);
  }

  // Reportes
  async getReportes() {
    return this.get('/reportes/reportes/');
  }

  async getReporte(id: string) {
    return this.get(`/reportes/reportes/${id}/`);
  }

  async createReporte(data: any) {
    return this.post('/reportes/reportes/', data);
  }

  async getNotificaciones() {
    return this.get(Endpoints.NOTIFICACIONES);
  }

  async getNotificacionesNoLeidas() {
    return this.get(Endpoints.NOTIFICACIONES_NO_LEIDAS);
  }

  async markAsRead(notificacionId: string) {
    return this.put(`${Endpoints.NOTIFICACIONES}${notificacionId}/`, {
      leida: true,
    });
  }
}

export const apiClient = new ApiClient();
