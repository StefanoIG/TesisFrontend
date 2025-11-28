
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import WebLayout from '@/components/web/WebLayout';
import { apiClient } from '@/services/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DocumentosWebScreen() {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchDocumentos = async () => {
    setLoading(true);
    try {
      const data: any = await apiClient.getDocumentos();
      setDocumentos(data.results || data || []);
    } catch (error) {
      console.error('Error fetching documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async (doc: any) => {
    try {
      await apiClient.validarDocumento(doc.id, { estado: 'VALIDADO' });
      fetchDocumentos();
    } catch (error) {
      console.error('Error validating documento:', error);
      alert('Error al validar documento');
    }
  };

  const handleDescargar = async (doc: any) => {
    try {
      const data: any = await apiClient.descargarDocumento(doc.id);
      // If backend returns a URL
      if (typeof data === 'string') {
        // open in new tab (web)
        try {
          window.open(data, '_blank');
        } catch (e) {
          console.log('Unable to open url', e);
        }
      } else {
        alert('Documento descargado (ver backend)');
      }
    } catch (error) {
      console.error('Error downloading documento:', error);
      alert('Error al descargar documento');
    }
  };

  const renderDocumento = ({ item }: any) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{item.tipo || item.nombre || `Documento #${item.id}`}</Text>
        <Text style={styles.subtitle}>{item.descripcion || item.creado_en}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDescargar(item)}>
          <MaterialCommunityIcons name="download" size={18} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} onPress={() => handleValidar(item)}>
          <MaterialCommunityIcons name="check" size={18} color={Colors.success} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <WebLayout title="Documentos" subtitle="Gestión y verificación de documentos">
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>
        ) : (
          <FlatList data={documentos} renderItem={renderDocumento} keyExtractor={(item) => item.id?.toString() || Math.random().toString()} contentContainerStyle={styles.list} />
        )}
      </View>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { gap: Spacing.sm },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm },
  title: { fontSize: 16, fontWeight: '600', color: Colors.dark },
  subtitle: { fontSize: 13, color: Colors.gray },
  actions: { flexDirection: 'row' },
  iconBtn: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light },
});
