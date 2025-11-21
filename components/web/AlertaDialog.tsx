import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import Dialog from '@/components/web/Dialog';
import FormInput from '@/components/web/FormInput';
import FormSelect from '@/components/web/FormSelect';
import { apiClient } from '@/services/api';

interface AlertaDialogProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AlertaDialog({ visible, onClose, onSuccess }: AlertaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [lotes, setLotes] = useState<any[]>([]);
  const [envios, setEnvios] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    tipo_alerta: 'CALIDAD',
    prioridad: 'MEDIA',
    descripcion: '',
    lote: '',
    envio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  const fetchData = async () => {
    try {
      const [lotesData, enviosData]: any[] = await Promise.all([
        apiClient.getLotes(),
        apiClient.getEnvios(),
      ]);
      setLotes(lotesData.results || lotesData || []);
      setEnvios(enviosData.results || enviosData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        tipo_alerta: formData.tipo_alerta,
        prioridad: formData.prioridad,
        descripcion: formData.descripcion,
        lote: formData.lote || undefined,
        envio: formData.envio || undefined,
      };

      await apiClient.createAlerta(payload);

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        tipo_alerta: 'CALIDAD',
        prioridad: 'MEDIA',
        descripcion: '',
        lote: '',
        envio: '',
      });
    } catch (error: any) {
      console.error('Error creating alerta:', error);
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

  const tipoAlertaOptions = [
    { label: 'Calidad', value: 'CALIDAD' },
    { label: 'Logística', value: 'LOGISTICA' },
    { label: 'Procesamiento', value: 'PROCESAMIENTO' },
    { label: 'Sincronización', value: 'SINCRONIZACION' },
  ];

  const prioridadOptions = [
    { label: 'Baja', value: 'BAJA' },
    { label: 'Media', value: 'MEDIA' },
    { label: 'Alta', value: 'ALTA' },
    { label: 'Crítica', value: 'CRITICA' },
  ];

  const lotesOptions = lotes.map(l => ({
    label: `${l.codigo_lote} - ${l.producto_detalle?.nombre || 'Producto'}`,
    value: l.id
  }));

  const enviosOptions = envios.map(e => ({
    label: `Envío #${e.numero_guia || e.id} - ${e.lote_codigo}`,
    value: e.id
  }));

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title="Crear Nueva Alerta"
      onSubmit={handleSubmit}
      submitText="Crear Alerta"
      submitDisabled={loading}
    >
      <View>
        <FormSelect
          label="Tipo de Alerta"
          value={formData.tipo_alerta}
          options={tipoAlertaOptions}
          onSelect={(value) => setFormData({ ...formData, tipo_alerta: value })}
          required
          zIndex={10}
        />

        <FormSelect
          label="Prioridad"
          value={formData.prioridad}
          options={prioridadOptions}
          onSelect={(value) => setFormData({ ...formData, prioridad: value })}
          required
          zIndex={9}
        />

        <FormInput
          label="Descripción"
          value={formData.descripcion}
          onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
          placeholder="Describe el problema o situación..."
          error={errors.descripcion}
          required
          multiline
          numberOfLines={4}
        />

        <FormSelect
          label="Lote (Opcional)"
          value={formData.lote}
          options={lotesOptions}
          onSelect={(value) => setFormData({ ...formData, lote: value })}
          placeholder="Seleccionar lote relacionado"
          zIndex={8}
        />

        <FormSelect
          label="Envío (Opcional)"
          value={formData.envio}
          options={enviosOptions}
          onSelect={(value) => setFormData({ ...formData, envio: value })}
          placeholder="Seleccionar envío relacionado"
          zIndex={7}
        />
      </View>
    </Dialog>
  );
}
