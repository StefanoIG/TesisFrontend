/**
 * Tipos e interfaces para toda la aplicación
 */

// ============ AUTH ============
export interface User {
  id: string;
  email: string;
  nombre_completo: string;
  roles: string[];
}

export interface AuthResponse {
  access: string;
  refresh: string;
  usuario: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// ============ USUARIOS ============
export interface Empresa {
  id: string;
  nombre: string;
  tipo_empresa: 'PRODUCTOR' | 'ACOPIO' | 'TRANSFORMACION' | 'EXPORTADOR' | 'DISTRIBUIDOR' | 'ASOCIACION';
  registro_nacional: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  pais: string;
  es_activa: boolean;
  certificaciones: string[];
  creado_en: string;
  actualizado_en: string;
}

export interface Coordenada {
  latitud: number;
  longitud: number;
}

export interface Finca {
  id: string;
  empresa_id: string;
  nombre: string;
  ubicacion: Coordenada;
  area_km2: number;
  area_hectareas?: number; // para compatibilidad
  descripcion?: string;
  tipo_cultivo?: string;
  fecha_creacion: string;
  es_activa: boolean;
  actualizado_en?: string;
  geometria?: {
    type: string;
    coordinates: [number, number][];
  };
}

export interface Parcela {
  id: string;
  finca_id: string;
  nombre: string;
  numero_parcela?: string;
  area_m2: number;
  area_km2?: number;
  ubicacion: Coordenada;
  geometria?: {
    type: string;
    coordinates: [number, number][];
  };
  cultivo_actual?: string;
  fecha_siembra?: string;
  estado?: 'activa' | 'en_descanso' | 'preparacion';
  descripcion?: string;
  fecha_creacion: string;
  es_activa: boolean;
  actualizado_en?: string;
}

// ============ TRAZABILIDAD ============
export interface Producto {
  id: string;
  nombre: string;
  codigo_sku: string;
  descripcion: string;
  tipo_producto: string;
  unidad_medida: string;
  activo: boolean;
}

export interface Lote {
  id: string;
  codigo_lote: string;
  producto: string;
  producto_detalle?: {
    nombre: string;
    tipo_producto: string;
  };
  cantidad: string | number;
  unidad_medida: string;
  fecha_produccion: string;
  estado: 'PRODUCCION' | 'ALMACENADO' | 'TRANSITO' | 'ENTREGADO' | 'CANCELADO';
  es_organico: boolean;
  // Campos opcionales para compatibilidad
  finca_id?: string;
  producto_id?: string;
  numero_lote?: string;
  fecha_siembra?: string;
  fecha_cosecha?: string;
  observaciones?: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  creado_en?: string;
  actualizado_en?: string;
}

export interface Evento {
  id: string;
  lote_id: string;
  tipo_evento: string;
  descripcion: string;
  fecha: string;
  usuario_id: string;
  archivo_url?: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
}

// ============ LOGÍSTICA ============
export interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  año: number;
  capacidad_kg: number;
  tipo_vehiculo: string;
  es_activo: boolean;
}

export interface Conductor {
  id: string;
  nombre: string;
  licencia: string;
  telefono: string;
  empresa_id: string;
  es_activo: boolean;
}

export interface Envio {
  id: string;
  lote_id: string;
  vehiculo_id: string;
  conductor_id: string;
  destino: string;
  estado: 'PREPARANDO' | 'EN_TRANSITO' | 'ENTREGADO' | 'DEVUELTO' | 'RETENIDO';
  fecha_salida: string;
  fecha_llegada_estimada: string;
  fecha_llegada_real?: string;
  ubicacion_actual?: {
    latitud: number;
    longitud: number;
    timestamp: string;
  };
  observaciones: string;
}

// ============ NOTIFICACIONES ============
export interface Notificacion {
  id: string;
  usuario_destinatario_id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fecha_creacion: string;
  fecha_lectura?: string;
}

export interface PreferenciaNotificacion {
  id: string;
  usuario_id: string;
  tipo_notificacion: string;
  habilitado: boolean;
  canal: 'email' | 'push' | 'app';
}

// ============ ALERTAS ============
export interface Alerta {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  leida: boolean;
  fecha_creacion: string;
  lote_id?: string;
  envio_id?: string;
}

// ============ REPORTES ============
export interface Reporte {
  id: string;
  titulo: string;
  tipo: string;
  fecha_generacion: string;
  fecha_inicio: string;
  fecha_fin: string;
  datos: Record<string, any>;
  usuario_id: string;
}

// ============ API RESPONSE ============
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// ============ STATE ============
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoteState {
  lotes: Lote[];
  currentLote: Lote | null;
  isLoading: boolean;
  error: string | null;
}

export interface EnvioState {
  envios: Envio[];
  currentEnvio: Envio | null;
  isLoading: boolean;
  error: string | null;
}

export interface NotificacionState {
  notificaciones: Notificacion[];
  noLeidasCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface FincaState {
  fincas: Finca[];
  currentFinca: Finca | null;
  isLoading: boolean;
  error: string | null;
}

export interface ParcelaState {
  parcelas: Parcela[];
  currentParcela: Parcela | null;
  isLoading: boolean;
  error: string | null;
}
