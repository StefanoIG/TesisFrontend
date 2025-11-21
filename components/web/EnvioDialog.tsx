import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import Dialog from '@/components/web/Dialog';
import FormInput from '@/components/web/FormInput';
import FormSelect from '@/components/web/FormSelect';
import FormDatePicker from '@/components/web/FormDatePicker';
import { apiClient } from '@/services/api';

interface EnvioDialogProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  envio?: any;
}

export default function EnvioDialog({ visible, onClose, onSuccess, envio }: EnvioDialogProps) {
  const [loading, setLoading] = useState(false);
  const [lotes, setLotes] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [conductores, setConductores] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    lote: '',
    nombre_origen: '',
    nombre_destino: '',
    latitud_origen: '',
    longitud_origen: '',
    latitud_destino: '',
    longitud_destino: '',
    vehiculo: '',
    conductor: '',
    fecha_salida: '',
    fecha_llegada_estimada: '',
    estado: 'PENDIENTE',
    observaciones: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      fetchData();
      if (envio) {
        setFormData({
          lote: envio.lote || '',
          nombre_origen: envio.nombre_origen || '',
          nombre_destino: envio.nombre_destino || '',
          latitud_origen: envio.latitud_origen?.toString() || '',
          longitud_origen: envio.longitud_origen?.toString() || '',
          latitud_destino: envio.latitud_destino?.toString() || '',
          longitud_destino: envio.longitud_destino?.toString() || '',
          vehiculo: envio.vehiculo || '',
          conductor: envio.conductor || '',
          fecha_salida: envio.fecha_salida?.split('T')[0] || '',
          fecha_llegada_estimada: envio.fecha_llegada_estimada?.split('T')[0] || '',
          estado: envio.estado || 'PENDIENTE',
          observaciones: envio.observaciones || '',
        });
      }
    }
  }, [visible, envio]);

  const fetchData = async () => {
    try {
      const [lotesData, vehiculosData, conductoresData]: any[] = await Promise.all([
        apiClient.getLotes(),
        apiClient.getVehiculos(),
        apiClient.getConductores(),
      ]);
      setLotes(lotesData.results || lotesData || []);
      setVehiculos(vehiculosData.results || vehiculosData || []);
      setConductores(conductoresData.results || conductoresData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.lote) {
      newErrors.lote = 'El lote es requerido';
    }
    if (!formData.nombre_origen.trim()) {
      newErrors.nombre_origen = 'El origen es requerido';
    }
    if (!formData.nombre_destino.trim()) {
      newErrors.nombre_destino = 'El destino es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        lote: formData.lote,
        nombre_origen: formData.nombre_origen,
        nombre_destino: formData.nombre_destino,
        latitud_origen: formData.latitud_origen ? parseFloat(formData.latitud_origen) : undefined,
        longitud_origen: formData.longitud_origen ? parseFloat(formData.longitud_origen) : undefined,
        latitud_destino: formData.latitud_destino ? parseFloat(formData.latitud_destino) : undefined,
        longitud_destino: formData.longitud_destino ? parseFloat(formData.longitud_destino) : undefined,
        vehiculo: formData.vehiculo || undefined,
        conductor: formData.conductor || undefined,
        fecha_salida: formData.fecha_salida || undefined,
        fecha_llegada_estimada: formData.fecha_llegada_estimada || undefined,
        estado: formData.estado,
        observaciones: formData.observaciones || undefined,
      };

      if (envio) {
        await apiClient.updateEnvio(envio.id, payload);
      } else {
        await apiClient.createEnvio(payload);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving envio:', error);
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
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'En Tránsito', value: 'EN_TRANSITO' },
    { label: 'Entregado', value: 'ENTREGADO' },
    { label: 'Cancelado', value: 'CANCELADO' },
    { label: 'Devuelto', value: 'DEVUELTO' },
  ];

  const lotesOptions = lotes.map(l => ({
    label: `${l.codigo_lote} - ${l.producto_detalle?.nombre || 'Producto'}`,
    value: l.id
  }));

  const vehiculosOptions = vehiculos.map(v => ({
    label: `${v.placa} - ${v.marca} ${v.modelo}`,
    value: v.id
  }));

  const conductoresOptions = conductores.map(c => ({
    label: c.usuario_nombre || c.numero_licencia,
    value: c.id
  }));

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={envio ? 'Editar Envío' : 'Crear Nuevo Envío'}
      onSubmit={handleSubmit}
      submitText={envio ? 'Actualizar' : 'Crear'}
      submitDisabled={loading}
    >
      <View>
        <FormSelect
          label="Lote"
          value={formData.lote}
          options={lotesOptions}
          onSelect={(value) => setFormData({ ...formData, lote: value })}
          error={errors.lote}
          required
          zIndex={10}
        />

        <FormInput
          label="Origen"
          value={formData.nombre_origen}
          onChangeText={(text) => setFormData({ ...formData, nombre_origen: text })}
          placeholder="Ej: Finca La Esperanza, Quito"
          error={errors.nombre_origen}
          required
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <FormInput
              label="Latitud Origen"
              value={formData.latitud_origen}
              onChangeText={(text) => setFormData({ ...formData, latitud_origen: text })}
              placeholder="-0.1807"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormInput
              label="Longitud Origen"
              value={formData.longitud_origen}
              onChangeText={(text) => setFormData({ ...formData, longitud_origen: text })}
              placeholder="-78.4678"
              keyboardType="numeric"
            />
          </View>
        </View>

        <FormInput
          label="Destino"
          value={formData.nombre_destino}
          onChangeText={(text) => setFormData({ ...formData, nombre_destino: text })}
          placeholder="Ej: Centro de Acopio, Guayaquil"
          error={errors.nombre_destino}
          required
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <FormInput
              label="Latitud Destino"
              value={formData.latitud_destino}
              onChangeText={(text) => setFormData({ ...formData, latitud_destino: text })}
              placeholder="-2.1709"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormInput
              label="Longitud Destino"
              value={formData.longitud_destino}
              onChangeText={(text) => setFormData({ ...formData, longitud_destino: text })}
              placeholder="-79.9224"
              keyboardType="numeric"
            />
          </View>
        </View>

        <FormSelect
          label="Vehículo"
          value={formData.vehiculo}
          options={vehiculosOptions}
          onSelect={(value) => setFormData({ ...formData, vehiculo: value })}
          placeholder="Seleccionar vehículo (opcional)"
          zIndex={9}
        />

        <FormSelect
          label="Conductor"
          value={formData.conductor}
          options={conductoresOptions}
          onSelect={(value) => setFormData({ ...formData, conductor: value })}
          placeholder="Seleccionar conductor (opcional)"
          zIndex={8}
        />

        <FormDatePicker
          label="Fecha de Salida"
          value={formData.fecha_salida}
          onChange={(value) => setFormData({ ...formData, fecha_salida: value })}
          placeholder="Seleccionar fecha (opcional)"
        />

        <FormDatePicker
          label="Fecha Estimada de Llegada"
          value={formData.fecha_llegada_estimada}
          onChange={(value) => setFormData({ ...formData, fecha_llegada_estimada: value })}
          placeholder="Seleccionar fecha (opcional)"
          minDate={formData.fecha_salida}
        />

        <FormSelect
          label="Estado"
          value={formData.estado}
          options={estadosOptions}
          onSelect={(value) => setFormData({ ...formData, estado: value })}
          required
          zIndex={7}
        />

        <FormInput
          label="Observaciones"
          value={formData.observaciones}
          onChangeText={(text) => setFormData({ ...formData, observaciones: text })}
          placeholder="Notas adicionales (opcional)"
          multiline
          numberOfLines={3}
        />
      </View>
    </Dialog>
  );
}
