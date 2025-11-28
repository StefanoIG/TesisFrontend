import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import WebLayout from '@/components/web/WebLayout';
import { apiClient } from '@/services/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TrackingWebScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTracking();
  }, []);

  const fetchTracking = async () => {
    setLoading(true);
    try {
      const data: any = await apiClient.getTracking();
      setItems(data.results || data || []);
    } catch (error) {
      console.error('Error fetching tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetalle = async (id: string) => {
    try {
      const det = await apiClient.getTrackingDetalle(id);
      alert(JSON.stringify(det, null, 2));
    } catch (error) {
      console.error('Error fetching detalle:', error);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{item.tipo || `Tracking #${item.id}`}</Text>
        <Text style={styles.subtitle}>{item.descripcion || item.creado_en}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => viewDetalle(item.id)}>
          <MaterialCommunityIcons name="eye" size={18} color={Colors.info} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <WebLayout title="Tracking" subtitle="Seguimiento de puntos y envíos">
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>
        ) : (
          <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item.id?.toString() || Math.random().toString()} contentContainerStyle={styles.list} />
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
