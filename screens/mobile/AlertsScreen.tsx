import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { apiClient } from '@/services/api';
import { Card } from '@/components/Card';
import { Colors, Spacing, Typography } from '@/constants/theme-new';

export default function AlertsScreen() {
  const [alertas, setAlertas] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    try {
      const data = await apiClient.getAlertas();
      setAlertas(data.results || data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlertas();
    setRefreshing(false);
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'CRITICA': Colors.danger,
      'ALTA': '#FF6B6B',
      'MEDIA': Colors.warning,
      'BAJA': Colors.info,
    };
    return colors[severity] || Colors.gray;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light,
    },
    header: {
      backgroundColor: Colors.danger,
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
    alertCard: {
      marginBottom: Spacing.md,
      borderLeftWidth: 4,
    },
    alertTitle: {
      fontSize: Typography.body.fontSize,
      fontWeight: '600' as const,
      color: Colors.dark,
      marginBottom: Spacing.xs,
    },
    alertDescription: {
      fontSize: Typography.small.fontSize,
      color: Colors.gray,
    },
    severityBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: 16,
      marginTop: Spacing.sm,
    },
    severityText: {
      color: Colors.white,
      fontSize: Typography.small.fontSize,
      fontWeight: '600' as const,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
      </View>

      <FlatList
        data={alertas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={[
              styles.alertCard,
              { borderLeftColor: getSeverityColor(item.severidad) },
            ]}
          >
            <Text style={styles.alertTitle}>{item.titulo}</Text>
            <Text style={styles.alertDescription}>{item.descripcion}</Text>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(item.severidad) },
              ]}
            >
              <Text style={styles.severityText}>{item.severidad}</Text>
            </View>
          </Card>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
            <Text style={{ fontSize: Typography.body.fontSize, color: Colors.gray }}>
              No alerts
            </Text>
          </View>
        }
      />
    </View>
  );
}
