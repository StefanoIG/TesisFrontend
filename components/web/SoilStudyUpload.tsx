import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { apiClient } from '@/services/api';

type Props = {
  fincaId?: string;
  parcelaId?: string;
  onSuccess?: () => void;
};

export default function SoilStudyUpload({ fincaId, parcelaId, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileClick = () => {
    if (typeof window === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
      }
    };
    input.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor seleccione un archivo');
      return;
    }

    if (!fincaId) {
      alert('Debe seleccionar una finca primero');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('archivo_pdf', selectedFile);
      fd.append('finca', fincaId);
      if (parcelaId) {
        fd.append('parcela', parcelaId);
      }
      fd.append('nombre', nombre || `Estudio de suelo - ${new Date().toLocaleDateString()}`);
      fd.append('fecha_estudio', new Date().toISOString().split('T')[0]);

      await apiClient.createEstudioSuelo(fd);
      setSelectedFile(null);
      setNombre('');
      if (onSuccess) onSuccess();
      alert('Estudio subido correctamente');
    } catch (err) {
      console.error('Error subiendo estudio', err);
      alert('Error subiendo estudio: ' + (err as any)?.response?.data?.error || err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre del estudio (opcional)"
        value={nombre}
        onChangeText={setNombre}
        editable={!uploading}
      />

      <TouchableOpacity style={styles.button} onPress={handleFileClick} disabled={uploading}>
        <Text style={styles.buttonText}>
          {selectedFile ? `Archivo: ${selectedFile.name}` : 'Seleccionar archivo PDF'}
        </Text>
      </TouchableOpacity>

      {selectedFile && (
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={uploading}>
          <Text style={styles.buttonText}>{uploading ? 'Subiendo...' : 'Subir estudio'}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.hint}>Formato aceptado: PDF, DOC, imágenes. El estudio ayudará a recomendar cultivos óptimos.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  input: {
    borderWidth: 1,
    borderColor: Colors.border || Colors.gray,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.white,
  },
  button: { 
    backgroundColor: Colors.secondary, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderRadius: BorderRadius.md, 
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  buttonText: { color: Colors.white, fontWeight: '600' },
  hint: { marginTop: Spacing.sm, color: Colors.gray, fontSize: 12 },
});
