import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Dialog from './Dialog';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { apiClient } from '@/services/api';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  cliente?: any | null;
}

export default function ClienteDialog({ visible, onClose, onSuccess, cliente }: Props) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) {
      setNombre(cliente.nombre_comercial || cliente.nombre || '');
      setEmail(cliente.email || '');
      setTelefono(cliente.telefono || '');
    } else {
      setNombre(''); setEmail(''); setTelefono('');
    }
  }, [cliente, visible]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { nombre_comercial: nombre, email, telefono };
      if (cliente && cliente.id) {
        await apiClient.updateCliente(cliente.id, payload);
      } else {
        await apiClient.createCliente(payload);
      }
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving cliente', err);
      alert('Error al guardar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog visible={visible} title={cliente ? 'Editar Cliente' : 'Nuevo Cliente'} onClose={onClose}>
      <View style={styles.container}>
        <TextInput style={styles.input} placeholder="Nombre o Razón social" value={nombre} onChangeText={setNombre} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} />

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.save]} onPress={handleSave}>
            <Text style={styles.saveText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md },
  input: { borderWidth: 1, borderColor: '#e6e6e6', padding: 10, borderRadius: 8, marginBottom: Spacing.sm },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginTop: Spacing.md },
  button: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: BorderRadius.md },
  cancel: { backgroundColor: Colors.light },
  save: { backgroundColor: Colors.primary },
  cancelText: { color: Colors.dark },
  saveText: { color: Colors.white, fontWeight: '700' },
});
