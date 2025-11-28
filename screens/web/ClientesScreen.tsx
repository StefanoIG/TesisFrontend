import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import WebLayout from '@/components/web/WebLayout';
import { apiClient } from '@/services/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ClienteDialog from '@/components/web/ClienteDialog';

export default function ClientesWebScreen() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const data: any = await apiClient.getClientes();
      setClientes(data.results || data || []);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // kept for compatibility but replaced by dialog flow
    setSelectedCliente(null);
    setDialogVisible(true);
  };

  const handleDelete = async (cliente: any) => {
    if (confirm(`¿Eliminar cliente ${cliente.nombre || cliente.email}?`)) {
      try {
        await apiClient.deleteCliente(cliente.id);
        fetchClientes();
      } catch (error) {
        console.error('Error deleting cliente:', error);
        alert('Error al eliminar cliente');
      }
    }
  };

  const handleEdit = (cliente: any) => {
    setSelectedCliente(cliente);
    setDialogVisible(true);
  };

  const renderCliente = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.nombre || item.email || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.nombre || item.razon_social || item.email}</Text>
          <Text style={styles.cardSubtitle}>{item.email || item.telefono || 'Sin contacto'}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => alert(JSON.stringify(item, null, 2))}>
          <MaterialCommunityIcons name="eye" size={18} color={Colors.info} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { marginLeft: 8 }]} onPress={() => handleDelete(item)}>
          <MaterialCommunityIcons name="delete" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <WebLayout title="Clientes" subtitle="Gestión de clientes y contactos">
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>{clientes.length} cliente{clientes.length !== 1 ? 's' : ''}</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <MaterialCommunityIcons name="plus" size={18} color={Colors.white} />
            <Text style={styles.createButtonText}>Nuevo Cliente</Text>
          </TouchableOpacity>
        </View>
        

        {loading ? (
          <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>
        ) : (
          <FlatList data={clientes} renderItem={renderCliente} keyExtractor={(item) => item.id?.toString() || Math.random().toString()} contentContainerStyle={styles.list} />
        )}
        <ClienteDialog visible={dialogVisible} onClose={() => setDialogVisible(false)} onSuccess={fetchClientes} cliente={selectedCliente} />
      </View>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  toolbarTitle: { color: Colors.gray, fontSize: 14 },
  createButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.md },
  createButtonText: { color: Colors.white, marginLeft: 8, fontWeight: '600' },
  form: { backgroundColor: Colors.white, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  input: { borderWidth: 1, borderColor: Colors.lightGray, padding: 10, borderRadius: 6, marginBottom: Spacing.sm },
  submitButton: { backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  submitButtonText: { color: Colors.white, fontWeight: '600' },
  list: { gap: Spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  cardInfo: {},
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  cardSubtitle: { fontSize: 13, color: Colors.gray },
  cardActions: { flexDirection: 'row' },
  actionButton: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
