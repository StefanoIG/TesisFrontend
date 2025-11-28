import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import Dialog from './Dialog';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { apiClient } from '@/services/api';
import * as DocumentPicker from 'expo-document-picker';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  documento?: any | null;
}

export default function DocumentoDialog({ visible, onClose, onSuccess }: Props) {
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
      if (res.type === 'success') {
        setArchivo(res);
      }
    } catch (err) {
      console.error('Error picking document', err);
      alert('Error al seleccionar archivo');
    }
  };

  const handleUpload = async () => {
    if (!archivo) { alert('Seleccione un archivo'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titulo', titulo || archivo.name || 'Documento');

      // On web, DocumentPicker returns a uri we can fetch as blob
      if (Platform.OS === 'web') {
        const response = await fetch(archivo.uri);
        const blob = await response.blob();
        formData.append('archivo', blob, archivo.name);
      } else {
        // For native, use the provided uri
        // @ts-ignore
        formData.append('archivo', {
          // @ts-ignore
          uri: archivo.uri,
          // @ts-ignore
          name: archivo.name || 'file',
          // @ts-ignore
          type: archivo.mimeType || 'application/octet-stream',
        });
      }

      await apiClient.createDocumento(formData as any);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Error uploading document', err);
      alert('Error al subir documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog visible={visible} title="Subir Documento" onClose={onClose}>
      <View style={styles.container}>
        <TextInput style={styles.input} placeholder="Título" value={titulo} onChangeText={setTitulo} />

        <TouchableOpacity style={styles.fileButton} onPress={pickFile}>
          <Text style={styles.fileButtonText}>{archivo ? archivo.name : 'Seleccionar archivo'}</Text>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.save]} onPress={handleUpload}>
            <Text style={styles.saveText}>{loading ? 'Subiendo...' : 'Subir'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md },
  input: { borderWidth: 1, borderColor: '#e6e6e6', padding: 10, borderRadius: 8, marginBottom: Spacing.sm },
  fileButton: { backgroundColor: Colors.light, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: Spacing.md },
  fileButtonText: { color: Colors.dark },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
  button: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: BorderRadius.md },
  cancel: { backgroundColor: Colors.light },
  save: { backgroundColor: Colors.primary },
  cancelText: { color: Colors.dark },
  saveText: { color: Colors.white, fontWeight: '700' },
});
