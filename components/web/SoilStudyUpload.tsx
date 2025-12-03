import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { apiClient } from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  fincaId?: string;
  parcelaId?: string;
  onSuccess?: () => void;
};

export default function SoilStudyUpload({ fincaId, parcelaId, onSuccess }: Props) {
  const [uploading, setUploading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    pH: '',
    textura: '',
    materia_organica_porcentaje: '',
    nitrogeno_ppm: '',
    fosforo_ppm: '',
    potasio_ppm: '',
    calcio_ppm: '',
    magnesio_ppm: '',
    azufre_ppm: '',
    hierro_ppm: '',
    zinc_ppm: '',
    cobre_ppm: '',
    manganeso_ppm: '',
    boro_ppm: '',
    conductividad_electrica: '',
    capacidad_intercambio_cationico: '',
    densidad_aparente: '',
    porosidad_porcentaje: '',
    retencion_agua_porcentaje: '',
    notas: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = () => {
    if (typeof window === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.type !== 'application/pdf') {
          alert('Solo se permiten archivos PDF');
          return;
        }
        if (file.size > 50 * 1024 * 1024) {
          alert('El archivo no debe superar los 50 MB');
          return;
        }
        setSelectedFile(file);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      alert('El nombre del estudio es obligatorio');
      return;
    }

    if (!fincaId) {
      alert('Debes seleccionar una finca primero');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('finca', fincaId);
      if (parcelaId) data.append('parcela', parcelaId);
      data.append('fecha_estudio', new Date().toISOString().split('T')[0]);

      // Campos opcionales
      if (formData.pH) data.append('pH', formData.pH);
      if (formData.textura) data.append('textura', formData.textura);
      if (formData.materia_organica_porcentaje) data.append('materia_organica_porcentaje', formData.materia_organica_porcentaje);
      if (formData.nitrogeno_ppm) data.append('nitrogeno_ppm', formData.nitrogeno_ppm);
      if (formData.fosforo_ppm) data.append('fosforo_ppm', formData.fosforo_ppm);
      if (formData.potasio_ppm) data.append('potasio_ppm', formData.potasio_ppm);
      if (formData.calcio_ppm) data.append('calcio_ppm', formData.calcio_ppm);
      if (formData.magnesio_ppm) data.append('magnesio_ppm', formData.magnesio_ppm);
      if (formData.azufre_ppm) data.append('azufre_ppm', formData.azufre_ppm);
      if (formData.hierro_ppm) data.append('hierro_ppm', formData.hierro_ppm);
      if (formData.zinc_ppm) data.append('zinc_ppm', formData.zinc_ppm);
      if (formData.cobre_ppm) data.append('cobre_ppm', formData.cobre_ppm);
      if (formData.manganeso_ppm) data.append('manganeso_ppm', formData.manganeso_ppm);
      if (formData.boro_ppm) data.append('boro_ppm', formData.boro_ppm);
      if (formData.conductividad_electrica) data.append('conductividad_electrica', formData.conductividad_electrica);
      if (formData.capacidad_intercambio_cationico) data.append('capacidad_intercambio_cationico', formData.capacidad_intercambio_cationico);
      if (formData.densidad_aparente) data.append('densidad_aparente', formData.densidad_aparente);
      if (formData.porosidad_porcentaje) data.append('porosidad_porcentaje', formData.porosidad_porcentaje);
      if (formData.retencion_agua_porcentaje) data.append('retencion_agua_porcentaje', formData.retencion_agua_porcentaje);
      if (formData.notas) data.append('notas', formData.notas);
      if (selectedFile) data.append('archivo_pdf', selectedFile);

      await apiClient.createEstudioSuelo(data);
      alert('Estudio de suelo guardado exitosamente');
      
      // Limpiar formulario
      setFormData({
        nombre: '', pH: '', textura: '', materia_organica_porcentaje: '',
        nitrogeno_ppm: '', fosforo_ppm: '', potasio_ppm: '', calcio_ppm: '',
        magnesio_ppm: '', azufre_ppm: '', hierro_ppm: '', zinc_ppm: '',
        cobre_ppm: '', manganeso_ppm: '', boro_ppm: '', conductividad_electrica: '',
        capacidad_intercambio_cationico: '', densidad_aparente: '', porosidad_porcentaje: '',
        retencion_agua_porcentaje: '', notas: '',
      });
      setSelectedFile(null);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error al guardar estudio:', error);
      alert('Error al guardar el estudio de suelo: ' + (error?.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Instrucciones */}
      <TouchableOpacity 
        style={styles.instructionsHeader}
        onPress={() => setShowInstructions(!showInstructions)}
      >
        <MaterialCommunityIcons 
          name={showInstructions ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={Colors.primary} 
        />
        <Text style={styles.instructionsTitle}>Instrucciones para completar el formulario</Text>
      </TouchableOpacity>

      {showInstructions && (
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionText}>
            📋 <Text style={styles.bold}>Complete los campos con los datos del análisis de suelo.</Text>
          </Text>
          <Text style={styles.instructionText}>
            🔍 <Text style={styles.bold}>Ubicación de los datos en el reporte:</Text>
          </Text>
          <Text style={styles.instructionSubtext}>
            • pH: Busque "pH" o "Reacción del suelo"
          </Text>
          <Text style={styles.instructionSubtext}>
            • Textura: Puede decir "Franco", "Arcilloso", "Arenoso", etc.
          </Text>
          <Text style={styles.instructionSubtext}>
            • Materia Orgánica: Generalmente expresada en porcentaje (%)
          </Text>
          <Text style={styles.instructionSubtext}>
            • Nutrientes (N, P, K, etc.): Expresados en ppm (partes por millón) o mg/kg
          </Text>
          <Text style={[styles.instructionText, { marginTop: 8 }]}>
            📄 <Text style={styles.bold}>PDF Opcional:</Text> Puede adjuntar el documento original para validar los datos ingresados.
          </Text>
        </View>
      )}

      <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
        {/* Información Básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre del Estudio <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Estudio Parcela Norte 2024"
              value={formData.nombre}
              onChangeText={(val) => handleInputChange('nombre', val)}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>pH</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 6.5"
                keyboardType="decimal-pad"
                value={formData.pH}
                onChangeText={(val) => handleInputChange('pH', val)}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
              <Text style={styles.label}>Textura</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Franco"
                value={formData.textura}
                onChangeText={(val) => handleInputChange('textura', val)}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Materia Orgánica (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 3.5"
              keyboardType="decimal-pad"
              value={formData.materia_organica_porcentaje}
              onChangeText={(val) => handleInputChange('materia_organica_porcentaje', val)}
            />
          </View>
        </View>

        {/* Macronutrientes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macronutrientes (ppm o mg/kg)</Text>
          
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Nitrógeno (N)</Text>
              <TextInput
                style={styles.input}
                placeholder="ppm"
                keyboardType="decimal-pad"
                value={formData.nitrogeno_ppm}
                onChangeText={(val) => handleInputChange('nitrogeno_ppm', val)}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
              <Text style={styles.label}>Fósforo (P)</Text>
              <TextInput
                style={styles.input}
                placeholder="ppm"
                keyboardType="decimal-pad"
                value={formData.fosforo_ppm}
                onChangeText={(val) => handleInputChange('fosforo_ppm', val)}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
              <Text style={styles.label}>Potasio (K)</Text>
              <TextInput
                style={styles.input}
                placeholder="ppm"
                keyboardType="decimal-pad"
                value={formData.potasio_ppm}
                onChangeText={(val) => handleInputChange('potasio_ppm', val)}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Calcio (Ca)</Text>
              <TextInput
                style={styles.input}
                placeholder="ppm"
                keyboardType="decimal-pad"
                value={formData.calcio_ppm}
                onChangeText={(val) => handleInputChange('calcio_ppm', val)}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
              <Text style={styles.label}>Magnesio (Mg)</Text>
              <TextInput
                style={styles.input}
                placeholder="ppm"
                keyboardType="decimal-pad"
                value={formData.magnesio_ppm}
                onChangeText={(val) => handleInputChange('magnesio_ppm', val)}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
              <Text style={styles.label}>Azufre (S)</Text>
              <TextInput
                style={styles.input}
                placeholder="ppm"
                keyboardType="decimal-pad"
                value={formData.azufre_ppm}
                onChangeText={(val) => handleInputChange('azufre_ppm', val)}
              />
            </View>
          </View>
        </View>

        {/* Micronutrientes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Micronutrientes (ppm o mg/kg)</Text>
          
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Hierro (Fe)</Text>
              <TextInput
                style={styles.input}
                placeholder="ppm"
                keyboardType="decimal-pad"
                value={formData.hierro_ppm}
                onChangeText={(val) => handleInputChange('hierro_ppm', val)}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
              <Text style={styles.label}>Zinc (Zn)</Text>
              <TextInput
                style={styles.input}
                placeholder="ppm"
                keyboardType="decimal-pad"
                value={formData.zinc_ppm}
                onChangeText={(val) => handleInputChange('zinc_ppm', val)}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Cobre (Cu)</Text>
              <TextInput
                style={styles.input}
                placeholder="ppm"
                keyboardType="decimal-pad"
                value={formData.cobre_ppm}
                onChangeText={(val) => handleInputChange('cobre_ppm', val)}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
              <Text style={styles.label}>Manganeso (Mn)</Text>
              <TextInput
                style={styles.input}
                placeholder="ppm"
                keyboardType="decimal-pad"
                value={formData.manganeso_ppm}
                onChangeText={(val) => handleInputChange('manganeso_ppm', val)}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
              <Text style={styles.label}>Boro (B)</Text>
              <TextInput
                style={styles.input}
                placeholder="ppm"
                keyboardType="decimal-pad"
                value={formData.boro_ppm}
                onChangeText={(val) => handleInputChange('boro_ppm', val)}
              />
            </View>
          </View>
        </View>

        {/* Propiedades Físicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propiedades Físicas</Text>
          
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Conductividad Eléctrica</Text>
              <TextInput
                style={styles.input}
                placeholder="dS/m"
                keyboardType="decimal-pad"
                value={formData.conductividad_electrica}
                onChangeText={(val) => handleInputChange('conductividad_electrica', val)}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
              <Text style={styles.label}>CIC (cmol/kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="cmol/kg"
                keyboardType="decimal-pad"
                value={formData.capacidad_intercambio_cationico}
                onChangeText={(val) => handleInputChange('capacidad_intercambio_cationico', val)}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Densidad Aparente</Text>
              <TextInput
                style={styles.input}
                placeholder="g/cm³"
                keyboardType="decimal-pad"
                value={formData.densidad_aparente}
                onChangeText={(val) => handleInputChange('densidad_aparente', val)}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
              <Text style={styles.label}>Porosidad (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="%"
                keyboardType="decimal-pad"
                value={formData.porosidad_porcentaje}
                onChangeText={(val) => handleInputChange('porosidad_porcentaje', val)}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
              <Text style={styles.label}>Retención Agua (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="%"
                keyboardType="decimal-pad"
                value={formData.retencion_agua_porcentaje}
                onChangeText={(val) => handleInputChange('retencion_agua_porcentaje', val)}
              />
            </View>
          </View>
        </View>

        {/* Notas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas Adicionales</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Observaciones</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notas u observaciones adicionales del estudio..."
              multiline
              numberOfLines={4}
              value={formData.notas}
              onChangeText={(val) => handleInputChange('notas', val)}
            />
          </View>
        </View>

        {/* PDF Opcional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documento PDF (Opcional)</Text>
          
          <TouchableOpacity style={styles.fileButton} onPress={handleFileSelect}>
            <MaterialCommunityIcons 
              name={selectedFile ? 'file-check' : 'file-pdf-box'} 
              size={24} 
              color={selectedFile ? Colors.success : Colors.primary} 
            />
            <Text style={styles.fileButtonText}>
              {selectedFile ? selectedFile.name : 'Seleccionar PDF del análisis'}
            </Text>
          </TouchableOpacity>
          
          {selectedFile && (
            <TouchableOpacity 
              style={styles.removeFileButton} 
              onPress={() => setSelectedFile(null)}
            >
              <MaterialCommunityIcons name="close-circle" size={16} color={Colors.danger} />
              <Text style={styles.removeFileText}>Quitar archivo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons name="content-save" size={20} color={Colors.white} />
              <Text style={styles.submitButtonText}>Guardar Estudio de Suelo</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: Colors.background || Colors.white,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.lightBackground || '#f0f0f0',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    cursor: 'pointer',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  instructionsBox: {
    backgroundColor: '#fffbea',
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning || '#f59e0b',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textDark || '#1f2937',
    marginBottom: Spacing.xs,
  },
  instructionSubtext: {
    fontSize: 13,
    color: Colors.textMuted || '#6b7280',
    marginLeft: Spacing.md,
    marginBottom: Spacing.xs,
  },
  bold: {
    fontWeight: '600',
  },
  formScroll: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border || '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark || '#111827',
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || '#e5e7eb',
    paddingBottom: Spacing.sm,
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark || '#374151',
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.danger || '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border || '#d1d5db',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.white,
    fontSize: 14,
    color: Colors.textDark || '#1f2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightBackground || '#f9fafb',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    cursor: 'pointer',
  },
  fileButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  removeFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    padding: Spacing.xs,
    cursor: 'pointer',
  },
  removeFileText: {
    fontSize: 13,
    color: Colors.danger || '#ef4444',
    marginLeft: Spacing.xs,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.lg,
    cursor: 'pointer',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
});

