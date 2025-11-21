import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { apiClient } from '@/services/api';
import { Card } from '@/components/Card';
import { Colors, Spacing, Typography, StatusColors } from '@/constants/theme-new';

export default function ShipmentsScreen() {
  const [envios, setEnvios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEnvios();
  }, []);

  const fetchEnvios = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getEnvios();
      setEnvios(data.results || data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEnvios();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'EN_TRANSITO': Colors.info,
      'ENTREGADO': Colors.success,
      'PREPARANDO': Colors.warning,
      'RETENIDO': Colors.danger,
      'DEVUELTO': Colors.danger,
    };
    return colors[status] || Colors.gray;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light,
    },
    header: {
      backgroundColor: Colors.accent,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      paddingTop: Spacing.xl,
    },
    title: {
      fontSize: Typography.subtitle.fontSize,
      fontWeight: '600' as const,
      color: Colors.white,
    },
    content: {
      padding: Spacing.lg,
    },
    shipmentCard: {
      marginBottom: Spacing.md,
    },
    shipmentName: {
      fontSize: Typography.body.fontSize,
      fontWeight: '600' as const,
      color: Colors.dark,
      marginBottom: Spacing.xs,
    },
    shipmentInfo: {
      fontSize: Typography.small.fontSize,
      color: Colors.gray,
      marginBottom: Spacing.xs,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: 16,
      marginTop: Spacing.sm,
    },
    statusText: {
      color: Colors.white,
      fontSize: Typography.small.fontSize,
      fontWeight: '600' as const,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shipments</Text>
      </View>

      <FlatList
        data={envios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.shipmentCard}>
            <Text style={styles.shipmentName}>Shipment {item.id?.slice(0, 8)}</Text>
            <Text style={styles.shipmentInfo}>Destination: {item.destino}</Text>
            <Text style={styles.shipmentInfo}>
              Departure: {new Date(item.fecha_salida).toLocaleDateString()}
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}
            >
              <Text style={styles.statusText}>{item.estado}</Text>
            </View>
          </Card>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
            <Text style={{ fontSize: Typography.body.fontSize, color: Colors.gray }}>
              No shipments available
            </Text>
          </View>
        }
      />
    </View>
  );
}
