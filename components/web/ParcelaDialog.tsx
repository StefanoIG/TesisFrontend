import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme-new';
import { Parcela } from '@/types/index';
import FormInput from './FormInput';

interface ParcelaDialogProps {
  visible: boolean;
  fincaId?: string;
  parcela?: Parcela | null;
  onClose: () => void;
  onSave: (parcela: Partial<Parcela>) => Promise<void>;
  isLoading?: boolean;
}

export default function ParcelaDialog({
  visible,
  fincaId,
  parcela,
  onClose,
  onSave,
  isLoading = false,
}: ParcelaDialogProps) {
  const [nombre, setNombre] = useState('');
  const [numeroParcela, setNumeroParcela] = useState('');
  const [areaM2, setAreaM2] = useState('');
  const [cultivoActual, setCultivoActual] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [estado, setEstado] = useState('activa');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (parcela) {
      setNombre(parcela.nombre);
      setNumeroParcela(parcela.numero_parcela || '');
      setAreaM2(String(parcela.area_m2));
      setCultivoActual(parcela.cultivo_actual || '');
      setLatitud(String(parcela.ubicacion.latitud));
      setLongitud(String(parcela.ubicacion.longitud));
      setEstado(parcela.estado || 'activa');
      setDescripcion(parcela.descripcion || '');
    } else {
      resetForm();
    }
    setError('');
  }, [parcela, visible]);

  const resetForm = () => {
    setNombre('');
    setNumeroParcela('');
    setAreaM2('');
    setCultivoActual('');
    setLatitud('');
    setLongitud('');
    setEstado('activa');
    setDescripcion('');
  };

  const validateForm = () => {
    if (!nombre.trim()) {
      setError('El nombre de la parcela es requerido');
      return false;
    }
    if (!areaM2 || isNaN(Number(areaM2)) || Number(areaM2) <= 0) {
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
      const data: Partial<Parcela> = {
        nombre: nombre.trim(),
        numero_parcela: numeroParcela.trim() || undefined,
        area_m2: Number(areaM2),
        area_km2: Number(areaM2) / 1_000_000,
        cultivo_actual: cultivoActual.trim() || undefined,
        ubicacion: {
          latitud: Number(latitud),
          longitud: Number(longitud),
        },
        estado: estado as any,
        descripcion: descripcion.trim() || undefined,
        es_activa: true,
      };

      if (fincaId && !parcela) {
        (data as any).finca_id = fincaId;
      }

      await onSave(data);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar parcela');
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <View style={styles.header}>
          <Text style={styles.title}>{parcela ? 'Editar Parcela' : 'Nueva Parcela'}</Text>
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <FormInput
            label="Nombre de la Parcela *"
            placeholder="Ej: Parcela A1"
            value={nombre}
            onChangeText={setNombre}
            editable={!isLoading}
          />

          <FormInput
            label="Número de Parcela"
            placeholder="Ej: P001"
            value={numeroParcela}
            onChangeText={setNumeroParcela}
            editable={!isLoading}
          />

          <FormInput
            label="Área (m²) *"
            placeholder="Ej: 50000"
            value={areaM2}
            onChangeText={setAreaM2}
            keyboardType="decimal-pad"
            editable={!isLoading}
          />

          <FormInput
            label="Cultivo Actual"
            placeholder="Ej: Cacao, Banana"
            value={cultivoActual}
            onChangeText={setCultivoActual}
            editable={!isLoading}
          />

          <View style={styles.stateSelector}>
            <Text style={styles.stateSelectorLabel}>Estado de la Parcela</Text>
            <View style={styles.stateButtonsContainer}>
              {['activa', 'en_descanso', 'preparacion'].map((stateOption) => (
                <TouchableOpacity
                  key={stateOption}
                  style={[
                    styles.stateButton,
                    estado === stateOption && styles.stateButtonActive,
                  ]}
                  onPress={() => setEstado(stateOption)}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.stateButtonText,
                      estado === stateOption && styles.stateButtonTextActive,
                    ]}
                  >
                    {stateOption === 'activa' && 'Activa'}
                    {stateOption === 'en_descanso' && 'En Descanso'}
                    {stateOption === 'preparacion' && 'Preparación'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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

          <FormInput
            label="Descripción"
            placeholder="Detalles adicionales de la parcela"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            editable={!isLoading}
          />

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
  stateSelector: {
    marginBottom: Spacing.md,
  },
  stateSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  stateButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stateButton: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.light,
    alignItems: 'center',
  },
  stateButtonActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  stateButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.darkGray,
  },
  stateButtonTextActive: {
    color: Colors.white,
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
