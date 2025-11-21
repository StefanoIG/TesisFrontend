import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import Dialog from '@/components/web/Dialog';
import FormInput from '@/components/web/FormInput';
import FormSelect from '@/components/web/FormSelect';
import FormDatePicker from '@/components/web/FormDatePicker';
import FormCheckbox from '@/components/web/FormCheckbox';
import { apiClient } from '@/services/api';

interface LoteDialogProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lote?: any;
}

export default function LoteDialog({ visible, onClose, onSuccess, lote }: LoteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [tieneFechaVencimiento, setTieneFechaVencimiento] = useState(true);
  const [formData, setFormData] = useState({
    codigo_lote: '',
    producto: '',
    cantidad: '',
    unidad_medida: 'kg',
    fecha_produccion: '',
    fecha_empaque: '',
    fecha_vencimiento: '',
    estado: 'PRODUCCION',
    latitud_origen: '',
    longitud_origen: '',
    nombre_ubicacion_origen: '',
    es_organico: false,
    temperatura_almacenamiento: '',
    humedad_almacenamiento: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      fetchProductos();
      if (lote) {
        setFormData({
          codigo_lote: lote.codigo_lote || '',
          producto: lote.producto || '',
          cantidad: lote.cantidad?.toString() || '',
          unidad_medida: lote.unidad_medida || 'kg',
          fecha_produccion: lote.fecha_produccion?.split('T')[0] || '',
          fecha_empaque: lote.fecha_empaque?.split('T')[0] || '',
          fecha_vencimiento: lote.fecha_vencimiento?.split('T')[0] || '',
          estado: lote.estado || 'PRODUCCION',
          latitud_origen: lote.latitud_origen?.toString() || '',
          longitud_origen: lote.longitud_origen?.toString() || '',
          nombre_ubicacion_origen: lote.nombre_ubicacion_origen || '',
          es_organico: lote.es_organico || false,
          temperatura_almacenamiento: lote.temperatura_almacenamiento?.toString() || '',
          humedad_almacenamiento: lote.humedad_almacenamiento?.toString() || '',
        });
      }
    }
  }, [visible, lote]);

  const fetchProductos = async () => {
    try {
      const data: any = await apiClient.getProductos();
      setProductos(data.results || data || []);
    } catch (error) {
      console.error('Error fetching productos:', error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo_lote.trim()) {
      newErrors.codigo_lote = 'El código de lote es requerido';
    }
    if (!formData.producto) {
      newErrors.producto = 'El producto es requerido';
    }
    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }
    if (!formData.fecha_produccion) {
      newErrors.fecha_produccion = 'La fecha de producción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        codigo_lote: formData.codigo_lote,
        producto: formData.producto,
        cantidad: parseFloat(formData.cantidad),
        unidad_medida: formData.unidad_medida,
        fecha_produccion: formData.fecha_produccion,
        fecha_empaque: formData.fecha_empaque || undefined,
        fecha_vencimiento: formData.fecha_vencimiento || undefined,
        estado: formData.estado,
        latitud_origen: formData.latitud_origen ? parseFloat(formData.latitud_origen) : undefined,
        longitud_origen: formData.longitud_origen ? parseFloat(formData.longitud_origen) : undefined,
        nombre_ubicacion_origen: formData.nombre_ubicacion_origen || undefined,
        es_organico: formData.es_organico,
        temperatura_almacenamiento: formData.temperatura_almacenamiento ? parseFloat(formData.temperatura_almacenamiento) : undefined,
        humedad_almacenamiento: formData.humedad_almacenamiento ? parseFloat(formData.humedad_almacenamiento) : undefined,
      };

      if (lote) {
        await apiClient.updateLote(lote.id, payload);
      } else {
        await apiClient.createLote(payload);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving lote:', error);
      if (error.response?.data) {
        const apiErrors: Record<string, string> = {};
        Object.keys(error.response.data).forEach(key => {
          apiErrors[key] = error.response.data[key][0];
        });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const estadosOptions = [
    { label: 'Producción', value: 'PRODUCCION' },
    { label: 'Almacenado', value: 'ALMACENADO' },
    { label: 'En Tránsito', value: 'TRANSITO' },
    { label: 'Procesamiento', value: 'PROCESAMIENTO' },
    { label: 'Calidad Pendiente', value: 'CALIDAD_PENDIENTE' },
    { label: 'Calidad Rechazado', value: 'CALIDAD_RECHAZADO' },
    { label: 'Exportación', value: 'EXPORTACION' },
    { label: 'Entregado', value: 'ENTREGADO' },
    { label: 'Cancelado', value: 'CANCELADO' },
  ];

  const unidadesMedida = [
    { label: 'Kilogramos (kg)', value: 'kg' },
    { label: 'Gramos (g)', value: 'g' },
    { label: 'Toneladas (t)', value: 't' },
    { label: 'Libras (lb)', value: 'lb' },
    { label: 'Unidades', value: 'unidades' },
    { label: 'Cajas', value: 'cajas' },
  ];

  const productosOptions = productos.map(p => ({
    label: p.nombre,
    value: p.id
  }));

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={lote ? 'Editar Lote' : 'Crear Nuevo Lote'}
      onSubmit={handleSubmit}
      submitText={lote ? 'Actualizar' : 'Crear'}
      submitDisabled={loading}
    >
      <View>
        <FormInput
          label="Código de Lote"
          value={formData.codigo_lote}
          onChangeText={(text) => setFormData({ ...formData, codigo_lote: text })}
          placeholder="Ej: LOTE-2025-001"
          error={errors.codigo_lote}
          required
          editable={!lote}
        />

        <FormSelect
          label="Producto"
          value={formData.producto}
          options={productosOptions}
          onSelect={(value) => setFormData({ ...formData, producto: value })}
          error={errors.producto}
          required
          zIndex={15}
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 2 }}>
            <FormInput
              label="Cantidad"
              value={formData.cantidad}
              onChangeText={(text) => setFormData({ ...formData, cantidad: text })}
              placeholder="0.00"
              keyboardType="numeric"
              error={errors.cantidad}
              required
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormSelect
              label="Unidad"
              value={formData.unidad_medida}
              options={unidadesMedida}
              onSelect={(value) => setFormData({ ...formData, unidad_medida: value })}
              required
              zIndex={14}
            />
          </View>
        </View>

        <FormDatePicker
          label="Fecha de Producción"
          value={formData.fecha_produccion}
          onChange={(value) => setFormData({ ...formData, fecha_produccion: value })}
          error={errors.fecha_produccion}
          required
          maxDate={new Date().toISOString().split('T')[0]}
        />

        <FormDatePicker
          label="Fecha de Empaque"
          value={formData.fecha_empaque}
          onChange={(value) => setFormData({ ...formData, fecha_empaque: value })}
          minDate={formData.fecha_produccion}
        />

        <FormCheckbox
          label="¿Tiene fecha de vencimiento?"
          value={tieneFechaVencimiento}
          onChange={(value) => {
            setTieneFechaVencimiento(value);
            if (!value) {
              setFormData({ ...formData, fecha_vencimiento: '' });
            }
          }}
          description="Desmarque si el producto no tiene fecha de vencimiento (ej: productos no perecederos)"
        />

        {tieneFechaVencimiento && (
          <FormDatePicker
            label="Fecha de Vencimiento"
            value={formData.fecha_vencimiento}
            onChange={(value) => setFormData({ ...formData, fecha_vencimiento: value })}
            minDate={formData.fecha_empaque || formData.fecha_produccion}
          />
        )}

        <FormSelect
          label="Estado"
          value={formData.estado}
          options={estadosOptions}
          onSelect={(value) => setFormData({ ...formData, estado: value })}
          required
          zIndex={8}
        />

        <FormInput
          label="Ubicación de Origen"
          value={formData.nombre_ubicacion_origen}
          onChangeText={(text) => setFormData({ ...formData, nombre_ubicacion_origen: text })}
          placeholder="Ej: Finca La Esperanza, Sector Norte"
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <FormInput
              label="Latitud"
              value={formData.latitud_origen}
              onChangeText={(text) => setFormData({ ...formData, latitud_origen: text })}
              placeholder="-0.1807"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormInput
              label="Longitud"
              value={formData.longitud_origen}
              onChangeText={(text) => setFormData({ ...formData, longitud_origen: text })}
              placeholder="-78.4678"
              keyboardType="numeric"
            />
          </View>
        </View>

        <FormCheckbox
          label="Es Orgánico"
          value={formData.es_organico}
          onChange={(value) => setFormData({ ...formData, es_organico: value })}
          description="Marque si el lote es de producción orgánica certificada"
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <FormInput
              label="Temperatura (°C)"
              value={formData.temperatura_almacenamiento}
              onChangeText={(text) => setFormData({ ...formData, temperatura_almacenamiento: text })}
              placeholder="Ej: 4.5"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormInput
              label="Humedad (%)"
              value={formData.humedad_almacenamiento}
              onChangeText={(text) => setFormData({ ...formData, humedad_almacenamiento: text })}
              placeholder="Ej: 65"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </Dialog>
  );
}
