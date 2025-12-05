import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme-new';
import { Finca, Coordenada } from '@/types/index';
import FormInput from './FormInput';
import FormDatePicker from './FormDatePicker';

interface FincaDialogProps {
  visible: boolean;
  finca?: Finca | null;
  onClose: () => void;
  onSave: (finca: Partial<Finca>) => Promise<void>;
  isLoading?: boolean;
}

export default function FincaDialog({
  visible,
  finca,
  onClose,
  onSave,
  isLoading = false,
}: FincaDialogProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [areaKm2, setAreaKm2] = useState('');
  const [tipoCultivo, setTipoCultivo] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (finca) {
      setNombre(finca.nombre);
      setDescripcion(finca.descripcion || '');
      setAreaKm2(String(finca.area_km2));
      setTipoCultivo(finca.tipo_cultivo || '');
      setLatitud(String(finca.ubicacion.latitud));
      setLongitud(String(finca.ubicacion.longitud));
    } else {
      resetForm();
    }
    setError('');
  }, [finca, visible]);

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setAreaKm2('');
    setTipoCultivo('');
    setLatitud('');
    setLongitud('');
  };

  const validateForm = () => {
    if (!nombre.trim()) {
      setError('El nombre de la finca es requerido');
      return false;
    }
    if (!areaKm2 || isNaN(Number(areaKm2)) || Number(areaKm2) <= 0) {
      setError('El área debe ser un número válido mayor a 0');
      return false;
    }
    if (!latitud || isNaN(Number(latitud))) {
      setError('La latitud es inválida');
      return false;
    }
    if (!longitud || isNaN(Number(longitud))) {
      setError('La longitud es inválida');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const data: Partial<Finca> = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        area_km2: Number(areaKm2),
        tipo_cultivo: tipoCultivo.trim() || undefined,
        ubicacion: {
          latitud: Number(latitud),
          longitud: Number(longitud),
        },
        es_activa: true,
      };

      await onSave(data);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar finca');
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <View style={styles.header}>
          <Text style={styles.title}>{finca ? 'Editar Finca' : 'Nueva Finca'}</Text>
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <FormInput
            label="Nombre de la Finca *"
            placeholder="Ej: Finca San José"
            value={nombre}
            onChangeText={setNombre}
            editable={!isLoading}
          />

          <FormInput
            label="Descripción"
            placeholder="Descripción de la finca"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            editable={!isLoading}
          />

          <FormInput
            label="Área (km²) *"
            placeholder="Ej: 10.5"
            value={areaKm2}
            onChangeText={setAreaKm2}
            keyboardType="decimal-pad"
            editable={!isLoading}
          />

          <FormInput
            label="Tipo de Cultivo"
            placeholder="Ej: Cacao, Banana, Café"
            value={tipoCultivo}
            onChangeText={setTipoCultivo}
            editable={!isLoading}
          />

          <View style={styles.sectionTitle}>
            <MaterialCommunityIcons name="map-marker" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitleText}>Ubicación (Coordenadas)</Text>
          </View>

          <View style={styles.coordsRow}>
            <View style={styles.coordInput}>
              <FormInput
                label="Latitud *"
                placeholder="-1.0543"
                value={latitud}
                onChangeText={setLatitud}
                keyboardType="decimal-pad"
                editable={!isLoading}
              />
            </View>
            <View style={styles.coordInput}>
              <FormInput
                label="Longitud *"
                placeholder="-80.4558"
                value={longitud}
                onChangeText={setLongitud}
                keyboardType="decimal-pad"
                editable={!isLoading}
              />
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={18} color={Colors.white} />
                <Text style={styles.saveButtonText}>Guardar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    width: '90%',
    maxHeight: '90%',
    display: 'flex',
    flexDirection: 'column',
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flex: 1,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  coordInput: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cancelButton: {
    backgroundColor: Colors.secondary,
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
