import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useTrazabilidadStore } from '@/store/trazabilidadStore';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { lotes, fetchLotes, isLoading } = useTrazabilidadStore();
  const { logout } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchLotes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLotes();
    setRefreshing(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light,
    },
    header: {
      backgroundColor: Colors.primary,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      paddingTop: Spacing.xl,
    },
    greeting: {
      fontSize: Typography.subtitle.fontSize,
      fontWeight: '600' as const,
      color: Colors.white,
      marginBottom: Spacing.sm,
    },
    username: {
      fontSize: Typography.body.fontSize,
      color: Colors.lightGray,
    },
    content: {
      padding: Spacing.lg,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: Colors.white,
      padding: Spacing.md,
      borderRadius: 12,
      marginHorizontal: Spacing.sm / 2,
      alignItems: 'center',
      ...Shadows.sm,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: Colors.secondary,
    },
    statLabel: {
      fontSize: Typography.small.fontSize,
      color: Colors.gray,
      marginTop: Spacing.xs,
    },
    sectionTitle: {
      fontSize: Typography.subtitle.fontSize,
      fontWeight: '600' as const,
      color: Colors.dark,
      marginBottom: Spacing.md,
      marginTop: Spacing.lg,
    },
    lotesContainer: {
      marginBottom: Spacing.lg,
    },
    loteItem: {
      marginBottom: Spacing.md,
    },
    loteName: {
      fontSize: Typography.body.fontSize,
      fontWeight: '600' as const,
      color: Colors.dark,
      marginBottom: Spacing.xs,
    },
    loteInfo: {
      fontSize: Typography.small.fontSize,
      color: Colors.gray,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.lg,
    },
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.username}>{user?.nombre_completo || user?.email}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{lotes.length}</Text>
            <Text style={styles.statLabel}>Active Lots</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Shipments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>

        {/* Recent Lots */}
        <Text style={styles.sectionTitle}>Recent Lots</Text>
        <View style={styles.lotesContainer}>
          {lotes.slice(0, 3).map((lote) => (
            <Card key={lote.id} style={styles.loteItem}>
              <Text style={styles.loteName}>{lote.numero_lote}</Text>
              <Text style={styles.loteInfo}>
                Status: {lote.estado} • {lote.cantidad} {lote.unidad_medida}
              </Text>
            </Card>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button title="View All Lots" variant="secondary" onPress={() => {}} />
          <Button title="Logout" variant="danger" onPress={logout} />
        </View>
      </View>
    </ScrollView>
  );
}
