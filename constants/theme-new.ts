/**
 * Paleta de colores minimalista para Trazabilidad Agroindustrial
 * Diseño limpio y profesional con enfoque en legibilidad
 */

export const Colors = {
  // Colores principales
  primary: '#1F2937',     // Gris oscuro profesional
  secondary: '#059669',   // Verde bosque (agroindustrial)
  accent: '#F59E0B',      // Ámbar cálido

  // Estados
  success: '#10B981',     // Verde claro
  warning: '#F59E0B',     // Ámbar
  danger: '#EF4444',      // Rojo
  info: '#3B82F6',        // Azul

  // Grises neutrales
  white: '#FFFFFF',
  light: '#F3F4F6',       // Gris muy claro
  lightGray: '#E5E7EB',   // Gris claro
  gray: '#9CA3AF',        // Gris medio
  darkGray: '#6B7280',    // Gris oscuro
  dark: '#1F2937',        // Muy oscuro
  border: '#E5E7EB',      // Color de bordes

  // Transparentes
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const Shadows = {
  sm: {
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const StatusColors = {
  // Estados de lotes
  ACTIVO: Colors.success,
  COMPLETADO: Colors.info,
  CANCELADO: Colors.danger,
  PENDIENTE: Colors.warning,
  EN_PROCESO: Colors.secondary,
  
  // Estados de envios
  PREPARANDO: Colors.warning,
  EN_TRANSITO: Colors.info,
  ENTREGADO: Colors.success,
  DEVUELTO: Colors.danger,
  RETENIDO: Colors.warning,
};

export const Endpoints = {
  BASE_URL: 'http://localhost:8000/api/v1',
  
  // Auth
  LOGIN: '/auth/token/',
  REFRESH: '/auth/refresh/',
  
  // Usuarios
  EMPRESAS: '/usuarios/empresas/',
  FINCAS: '/usuarios/fincas/',
  PERMISOS: '/usuarios/permisos/',
  
  // Trazabilidad
  LOTES: '/trazabilidad/lotes/',
  EVENTOS: '/trazabilidad/eventos/',
  PRODUCTOS: '/trazabilidad/productos/',
  
  // Logística
  ENVIOS: '/logistica/envios/',
  VEHICULOS: '/logistica/vehiculos/',
  CONDUCTORES: '/logistica/conductores/',
  
  // Procesamiento
  PROCESAMIENTO: '/procesamiento/',
  
  // Reportes
  REPORTES: '/reportes/',
  
  // Documentos
  DOCUMENTOS: '/documentos/',
  
  // Notificaciones
  NOTIFICACIONES: '/notificaciones/notificaciones/',
  NOTIFICACIONES_NO_LEIDAS: '/notificaciones/no-leidas/',
  PREFERENCIAS: '/notificaciones/preferencias/',
  
  // Alertas
  ALERTAS: '/alertas/',
  
  // Sincronización
  SINCRONIZACION: '/sincronizacion/',
  
  // Administración
  ADMINISTRACION: '/administracion/',
};

export const StorageKeys = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
};
