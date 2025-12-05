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

  // -------------------- CLIENTES --------------------
  async getClientes(params?: any) {
    return this.get('/clientes/clientes/', params);
  }

  async getCliente(id: string) {
    return this.get(`/clientes/clientes/${id}/`);
  }

  async createCliente(data: any) {
    return this.post('/clientes/clientes/', data);
  }

  async updateCliente(id: string, data: any) {
    return this.put(`/clientes/clientes/${id}/`, data);
  }

  async deleteCliente(id: string) {
    return this.delete(`/clientes/clientes/${id}/`);
  }

  async getClientesActivos() {
    return this.get('/clientes/clientes/activos/');
  }

  async getClienteEstadisticas(id: string) {
    return this.get(`/clientes/clientes/${id}/estadisticas/`);
  }

  async getHistorialComprasCliente(id: string) {
    return this.get(`/clientes/clientes/${id}/historial-compras/`);
  }

  // -------------------- VENTAS / COTIZACIONES --------------------
  async getVentas(params?: any) {
    return this.get('/clientes/ventas/', params);
  }

  async createVenta(data: any) {
    return this.post('/clientes/ventas/', data);
  }

  async updateVenta(id: string, data: any) {
    return this.put(`/clientes/ventas/${id}/`, data);
  }

  async cambiarEstadoVenta(id: string, estado: string) {
    return this.post(`/clientes/ventas/${id}/cambiar_estado/`, { estado });
  }

  async getVentasPendientes() {
    return this.get('/clientes/ventas/pendientes/');
  }

  async getCotizaciones(params?: any) {
    return this.get('/clientes/cotizaciones/', params);
  }

  async convertirCotizacionAventa(id: string, numero_venta: string) {
    return this.post(`/clientes/cotizaciones/${id}/convertir_a_venta/`, { numero_venta });
  }

  // -------------------- DOCUMENTOS Y FOTOS --------------------
  async getDocumentos(params?: any) {
    return this.get('/documentos/documentos/', params);
  }

  async getDocumento(id: string) {
    return this.get(`/documentos/documentos/${id}/`);
  }

  async createDocumento(formData: FormData) {
    // multipart/form-data
    const response = await this.client.post('/documentos/documentos/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateDocumento(id: string, data: any) {
    return this.put(`/documentos/documentos/${id}/`, data);
  }

  async deleteDocumento(id: string) {
    return this.delete(`/documentos/documentos/${id}/`);
  }

  async validarDocumento(id: string, data: any) {
    return this.put(`/documentos/documentos/${id}/validar/`, data);
  }

  async descargarDocumento(id: string) {
    // Puede devolver URL o binary según backend
    const response = await this.client.get(`/documentos/documentos/${id}/descargar/`);
    return response.data;
  }

  async getFotos(params?: any) {
    return this.get('/documentos/fotos/', params);
  }

  async createFoto(formData: FormData) {
    const response = await this.client.post('/documentos/fotos/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getFoto(id: string) {
    return this.get(`/documentos/fotos/${id}/`);
  }

  async deleteFoto(id: string) {
    return this.delete(`/documentos/fotos/${id}/`);
  }

  // -------------------- LOGÍSTICA - TRACKING --------------------
  async getTracking(params?: any) {
    return this.get('/logistica/tracking/', params);
  }

  async createTracking(data: any) {
    return this.post('/logistica/tracking/', data);
  }

  async getTrackingDetalle(id: string) {
    return this.get(`/logistica/tracking/${id}/`);
  }

  async updateTracking(id: string, data: any) {
    return this.put(`/logistica/tracking/${id}/`, data);
  }

  async deleteTracking(id: string) {
    return this.delete(`/logistica/tracking/${id}/`);
  }

  async getEnvioTracking(envioId: string) {
    return this.get(`/logistica/envios/${envioId}/tracking/`);
  }

  // -------------------- PLANIFICACIÓN --------------------
  
  // Fincas (Granjas)
  async getFincas(params?: any) {
    return this.get('/usuarios/fincas/', params);
  }

  async getFincaById(id: string) {
    return this.get(`/usuarios/fincas/${id}/`);
  }

  async getFinca(id: string) {
    return this.get(`/usuarios/fincas/${id}/`);
  }

  async createFinca(data: any) {
    return this.post('/usuarios/fincas/', data);
  }

  async updateFinca(id: string, data: any) {
    return this.put(`/usuarios/fincas/${id}/`, data);
  }

  async deleteFinca(id: string) {
    return this.delete(`/usuarios/fincas/${id}/`);
  }

  // Estudios de Suelo
  async getEstudiosSuelo(params?: any) {
    return this.get('/planificacion/estudios-suelo/', params);
  }

  async createEstudioSuelo(formData: FormData) {
    // multipart/form-data con archivo PDF
    const response = await this.client.post('/planificacion/estudios-suelo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getEstudioSuelo(id: string) {
    return this.get(`/planificacion/estudios-suelo/${id}/`);
  }

  async updateEstudioSuelo(id: string, data: any) {
    return this.put(`/planificacion/estudios-suelo/${id}/`, data);
  }

  async deleteEstudioSuelo(id: string) {
    return this.delete(`/planificacion/estudios-suelo/${id}/`);
  }

  // Parcelas
  async getParcelas(params?: any) {
    return this.get('/planificacion/parcelas/', params);
  }

  async getParcelasByFinca(fincaId: string) {
    return this.get(`/planificacion/parcelas/por_finca/?finca_id=${fincaId}`);
  }

  async getParcela(id: string) {
    return this.get(`/planificacion/parcelas/${id}/`);
  }

  async createParcela(data: any) {
    return this.post('/planificacion/parcelas/', data);
  }

  async updateParcela(id: string, data: any) {
    return this.put(`/planificacion/parcelas/${id}/`, data);
  }

  async deleteParcela(id: string) {
    return this.delete(`/planificacion/parcelas/${id}/`);
  }

  async updateGeometriaParcela(id: string, data: { coordenadas_geojson: any; geometria_svg?: string }) {
    return this.post(`/planificacion/parcelas/${id}/actualizar_geometria/`, data);
  }

  async dividirParcela(id: string, divisiones: any[]) {
    return this.post(`/planificacion/parcelas/${id}/dividir_parcela/`, { divisiones });
  }

  // Catálogo de Cultivos
  async getCultivos(params?: any) {
    return this.get('/planificacion/catalogos-cultivos/', params);
  }

  async getCultivo(id: string) {
    return this.get(`/planificacion/catalogos-cultivos/${id}/`);
  }

  // Recomendaciones de Cultivos
  async recomendarCultivos(data: {
    parcela_ids: string[];
    prioridad?: 'rentabilidad' | 'facilidad' | 'mercado';
    cultivo_preferido?: string;
    area_geografica?: any;
  }) {
    return this.post('/planificacion/catalogos-cultivos/recomendar_cultivos/', data);
  }

  // Planes de Cultivo
  async getPlanesCultivo(params?: any) {
    return this.get('/planificacion/planes-cultivo/', params);
  }

  async getPlanCultivo(id: string) {
    return this.get(`/planificacion/planes-cultivo/${id}/`);
  }

  async createPlanCultivo(data: any) {
    return this.post('/planificacion/planes-cultivo/', data);
  }

  async createPlanAutomatico(data: {
    parcela_id: string;
    cultivo_id: string;
    fecha_inicio?: string;
    variedad?: string;
  }) {
    return this.post('/planificacion/planes-cultivo/crear_plan_automatico/', data);
  }

  async updatePlanCultivo(id: string, data: any) {
    return this.put(`/planificacion/planes-cultivo/${id}/`, data);
  }

  async deletePlanCultivo(id: string) {
    return this.delete(`/planificacion/planes-cultivo/${id}/`);
  }

  // -------------------- CERTIFICACIONES --------------------
  async getCertificaciones(params?: any) {
    return this.get('/certificaciones/certificaciones/', params);
  }

  async getCertificacion(id: string) {
    return this.get(`/certificaciones/certificaciones/${id}/`);
  }

  async createCertificacion(data: any) {
    return this.post('/certificaciones/certificaciones/', data);
  }

  async updateCertificacion(id: string, data: any) {
    return this.put(`/certificaciones/certificaciones/${id}/`, data);
  }

  async deleteCertificacion(id: string) {
    return this.delete(`/certificaciones/certificaciones/${id}/`);
  }

  // Certificaciones de Productores
  async getCertificacionesProductores(params?: any) {
    return this.get('/certificaciones/certificaciones-productores/', params);
  }

  async getCertificacionProductor(id: string) {
    return this.get(`/certificaciones/certificaciones-productores/${id}/`);
  }

  async createCertificacionProductor(data: any) {
    return this.post('/certificaciones/certificaciones-productores/', data);
  }

  async updateCertificacionProductor(id: string, data: any) {
    return this.put(`/certificaciones/certificaciones-productores/${id}/`, data);
  }

  async deleteCertificacionProductor(id: string) {
    return this.delete(`/certificaciones/certificaciones-productores/${id}/`);
  }

  async getCertificacionesPorVencer() {
    return this.get('/certificaciones/certificaciones-productores/por_vencer/');
  }

  // -------------------- ADMINISTRACIÓN --------------------
  async getConfiguracionSistema() {
    return this.get('/administracion/configuracion/');
  }

  async updateConfiguracionSistema(data: any) {
    return this.put('/administracion/configuracion/1/', data);
  }

  async getLogsAcceso(params?: any) {
    return this.get('/administracion/logs-acceso/', params);
  }

  async getLogsActividad(params?: any) {
    return this.get('/administracion/logs-actividad/', params);
  }

  async getBackups(params?: any) {
    return this.get('/administracion/backups/', params);
  }
}

export const apiClient = new ApiClient();
