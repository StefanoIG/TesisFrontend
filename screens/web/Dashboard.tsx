import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useTrazabilidadStore } from '@/store/trazabilidadStore';
import WebLayout from '@/components/web/WebLayout';
import { Card } from '@/components/Card';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function WebDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { lotes, fetchLotes, isLoading } = useTrazabilidadStore();

  useEffect(() => {
    fetchLotes();
  }, []);

  // Calcular estadísticas
  const produccionLots = lotes.filter(l => l.estado === 'PRODUCCION').length;
  const almacenadoLots = lotes.filter(l => l.estado === 'ALMACENADO').length;
  const transitoLots = lotes.filter(l => l.estado === 'TRANSITO').length;
  const recentLots = lotes.slice(0, 5);

  const StatCard = ({ icon, value, label, color, trend }: any) => (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={32} color={color} />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <MaterialCommunityIcons 
              name={trend > 0 ? "trending-up" : "trending-down"} 
              size={16} 
              color={trend > 0 ? Colors.success : Colors.danger} 
            />
            <Text style={[styles.trendText, { color: trend > 0 ? Colors.success : Colors.danger }]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );

  const QuickActionCard = ({ icon, title, onPress, color }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <WebLayout title="Dashboard" subtitle={`Bienvenido, ${user?.nombre_completo || 'Usuario'}`}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="package-variant"
              value={produccionLots}
              label="En Producción"
              color={Colors.success}
              trend={12}
            />
            <StatCard
              icon="warehouse"
              value={almacenadoLots}
              label="Almacenados"
              color={Colors.info}
              trend={8}
            />
            <StatCard
              icon="truck-delivery"
              value={transitoLots}
              label="En Tránsito"
              color={Colors.warning}
              trend={-5}
            />
            <StatCard
              icon="archive"
              value={lotes.length}
              label="Total Lotes"
              color={Colors.info}
              trend={15}
            />
          </View>

          {/* Quick Actions */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <View style={styles.quickActionsGrid}>
              <QuickActionCard
                icon="plus-circle"
                title="Nuevo Lote"
                color={Colors.secondary}
                onPress={() => router.push('/(web)/trazabilidad')}
              />
              <QuickActionCard
                icon="truck"
                title="Nuevo Envío"
                color={Colors.info}
                onPress={() => router.push('/(web)/shipments')}
              />
              <QuickActionCard
                icon="qrcode-scan"
                title="Escanear QR"
                color={Colors.accent}
                onPress={() => {}}
              />
              <QuickActionCard
                icon="chart-line"
                title="Ver Reportes"
                color={Colors.primary}
                onPress={() => router.push('/(web)/reports')}
              />
            </View>
          </Card>

          {/* Recent Lots Table */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lotes Recientes</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            
            {recentLots.length > 0 ? (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, styles.tableCell1]}>Lote</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableCell2]}>Estado</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableCell3]}>Cantidad</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableCell4]}>Fecha Siembra</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableCell5]}>Acciones</Text>
                </View>
                {recentLots.map((lote, index) => (
                  <View key={lote.id} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                    <Text style={[styles.tableCell, styles.tableCell1, styles.loteName]}>
                      {lote.codigo_lote}
                    </Text>
                    <View style={styles.tableCell2}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              lote.estado === 'PRODUCCION'
                                ? Colors.success + '20'
                                : lote.estado === 'ALMACENADO'
                                  ? Colors.info + '20'
                                  : lote.estado === 'TRANSITO'
                                    ? Colors.warning + '20'
                                    : Colors.secondary + '20',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                lote.estado === 'PRODUCCION'
                                  ? Colors.success
                                  : lote.estado === 'ALMACENADO'
                                    ? Colors.info
                                    : lote.estado === 'TRANSITO'
                                      ? Colors.warning
                                      : Colors.secondary,
                            },
                          ]}
                        >
                          {lote.estado}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.tableCell, styles.tableCell3]}>
                      {lote.cantidad} {lote.unidad_medida}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCell4]}>
                      {new Date(lote.fecha_produccion).toLocaleDateString('es-ES')}
                    </Text>
                    <View style={[styles.tableCell5, styles.actionButtons]}>
                      <TouchableOpacity style={styles.actionButton}>
                        <MaterialCommunityIcons name="eye" size={18} color={Colors.info} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <MaterialCommunityIcons name="pencil" size={18} color={Colors.secondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="archive-off" size={64} color={Colors.lightGray} />
                <Text style={styles.emptyText}>No hay lotes registrados</Text>
              </View>
            )}
          </Card>
        </ScrollView>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
    padding: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    padding: Spacing.lg,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.xs / 2,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
  },
  viewAllLink: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  quickAction: {
    flex: 1,
    minWidth: 140,
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.md,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
  },
  table: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.light,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRowEven: {
    backgroundColor: '#fafafa',
  },
  tableCell: {
    fontSize: 14,
    color: Colors.dark,
  },
  tableCell1: {
    flex: 2,
  },
  tableCell2: {
    flex: 1.5,
    justifyContent: 'center',
  },
  tableCell3: {
    flex: 1.5,
  },
  tableCell4: {
    flex: 1.5,
  },
  tableCell5: {
    flex: 1,
    justifyContent: 'center',
  },
  loteName: {
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: Spacing.md,
  },
});
