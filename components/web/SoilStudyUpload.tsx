import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { apiClient } from '@/services/api';

type Props = {
  onSuccess?: () => void;
};

export default function SoilStudyUpload({ onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileClick = () => {
    if (typeof window === 'undefined') return;
    if (!inputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,image/*';
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
      };
      input.click();
      return;
    }
    inputRef.current.click();
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      // backend endpoint: createEstudioSuelo (implement on backend)
      await apiClient.createEstudioSuelo(fd);
      if (onSuccess) onSuccess();
      alert('Estudio subido correctamente');
    } catch (err) {
      console.error('Error subiendo estudio', err);
      alert('Error subiendo estudio');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        style={{ display: 'none' }}
        onChange={async (e: any) => {
          const file = e.target.files?.[0];
          if (file) await uploadFile(file);
        }}
      />

      <TouchableOpacity style={styles.button} onPress={handleFileClick} disabled={uploading}>
        <Text style={styles.buttonText}>{uploading ? 'Subiendo...' : 'Subir estudio de suelo'}</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>Formato aceptado: PDF, DOC, imagenes. (Web)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  button: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: BorderRadius.md, alignItems: 'center' },
  buttonText: { color: Colors.white, fontWeight: '600' },
  hint: { marginTop: Spacing.sm, color: Colors.gray, fontSize: 13 },
});
