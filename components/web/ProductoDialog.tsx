import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import Dialog from '@/components/web/Dialog';
import FormInput from '@/components/web/FormInput';
import FormSelect from '@/components/web/FormSelect';
import { apiClient } from '@/services/api';

interface ProductoDialogProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  producto?: any;
}

export default function ProductoDialog({ visible, onClose, onSuccess, producto }: ProductoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo_producto: 'FRUTA',
    descripcion: '',
    unidad_medida: 'kg',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      if (producto) {
        setFormData({
          nombre: producto.nombre || '',
          tipo_producto: producto.tipo_producto || 'FRUTA',
          descripcion: producto.descripcion || '',
          unidad_medida: producto.unidad_medida || 'kg',
        });
      } else {
        // Reset form
        setFormData({
          nombre: '',
          tipo_producto: 'FRUTA',
          descripcion: '',
          unidad_medida: 'kg',
        });
      }
      setErrors({});
    }
  }, [visible, producto]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        nombre: formData.nombre,
        tipo_producto: formData.tipo_producto,
        descripcion: formData.descripcion || undefined,
        unidad_medida: formData.unidad_medida,
      };

      if (producto) {
        await apiClient.updateProducto(producto.id, payload);
      } else {
        await apiClient.createProducto(payload);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving producto:', error);
      if (error.response?.data) {
        const apiErrors: Record<string, string> = {};
        Object.keys(error.response.data).forEach(key => {
          apiErrors[key] = Array.isArray(error.response.data[key]) 
            ? error.response.data[key][0] 
            : error.response.data[key];
        });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const tipoProductoOptions = [
    { label: 'Fruta', value: 'FRUTA' },
    { label: 'Verdura', value: 'VERDURA' },
    { label: 'Tubérculo', value: 'TUBÉRCULO' },
    { label: 'Grano', value: 'GRANO' },
    { label: 'Procesado', value: 'PROCESADO' },
  ];

  const unidadesMedida = [
    { label: 'Kilogramos (kg)', value: 'kg' },
    { label: 'Gramos (g)', value: 'g' },
    { label: 'Toneladas (t)', value: 't' },
    { label: 'Libras (lb)', value: 'lb' },
    { label: 'Unidades', value: 'unidades' },
    { label: 'Cajas', value: 'cajas' },
  ];

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={producto ? 'Editar Producto' : 'Crear Nuevo Producto'}
      onSubmit={handleSubmit}
      submitText={producto ? 'Actualizar' : 'Crear'}
      submitDisabled={loading}
    >
      <View>
        <FormInput
          label="Nombre del Producto"
          value={formData.nombre}
          onChangeText={(text) => setFormData({ ...formData, nombre: text })}
          placeholder="Ej: Tomate Riñón"
          error={errors.nombre}
          required
        />

        <FormSelect
          label="Tipo de Producto"
          value={formData.tipo_producto}
          options={tipoProductoOptions}
          onSelect={(value) => setFormData({ ...formData, tipo_producto: value })}
          required
          zIndex={10}
        />

        <FormSelect
          label="Unidad de Medida"
          value={formData.unidad_medida}
          options={unidadesMedida}
          onSelect={(value) => setFormData({ ...formData, unidad_medida: value })}
          required
          zIndex={9}
        />

        <FormInput
          label="Descripción"
          value={formData.descripcion}
          onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
          placeholder="Descripción opcional del producto"
          multiline
          numberOfLines={3}
        />
      </View>
    </Dialog>
  );
}
