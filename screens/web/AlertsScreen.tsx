import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebLayout from '@/components/web/WebLayout';
import AlertaDialog from '@/components/web/AlertaDialog';
import { Card } from '@/components/Card';
import { apiClient } from '@/services/api';
import { Colors, Spacing } from '@/constants/theme-new';

export default function AlertsWebScreen() {
  const [alertas, setAlertas] = useState<any[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    try {
      const data: any = await apiClient.getAlertasAbiertas();
      setAlertas(data.results || data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleCreate = () => {
    setDialogVisible(true);
  };

  const handleSuccess = () => {
    fetchAlertas();
  };

  const handleResolverAlerta = async (alertaId: string) => {
    try {
      await apiClient.resolverAlerta(alertaId, {
        comentario: 'Alerta resuelta desde la interfaz web',
      });
      fetchAlertas();
    } catch (error) {
      console.error('Error resolviendo alerta:', error);
    }
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

  const getSeverityIcon = (severity: string) => {
    const icons: Record<string, string> = {
      'CRITICA': 'alert-octagon',
      'ALTA': 'alert',
      'MEDIA': 'alert-circle',
      'BAJA': 'information',
    };
    return icons[severity] || 'alert';
  };

  const renderAlertCard = ({ item }: any) => (
    <Card style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={[styles.severityIcon, { backgroundColor: getSeverityColor(item.prioridad) + '20' }]}>
          <MaterialCommunityIcons 
            name={getSeverityIcon(item.prioridad) as any} 
            size={24} 
            color={getSeverityColor(item.prioridad)} 
          />
        </View>
        <View style={styles.alertInfo}>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.prioridad) }]}>
            <Text style={styles.severityText}>{item.prioridad}</Text>
          </View>
          <Text style={styles.alertTitle}>{item.tipo_alerta}</Text>
        </View>
      </View>

      <Text style={styles.alertDescription} numberOfLines={3}>
        {item.descripcion}
      </Text>

      <View style={styles.alertFooter}>
        <View style={styles.alertMeta}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.gray} />
          <Text style={styles.alertDate}>
            {new Date(item.fecha_creacion).toLocaleString('es-ES')}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { 
          backgroundColor: item.resuelta ? Colors.success + '20' : Colors.warning + '20' 
        }]}>
          <Text style={[styles.statusText, { 
            color: item.resuelta ? Colors.success : Colors.warning 
          }]}>
            {item.resuelta ? 'Resuelta' : 'Pendiente'}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        {!item.resuelta && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.resolveButton]}
            onPress={() => handleResolverAlerta(item.id)}
          >
            <MaterialCommunityIcons name="check" size={16} color={Colors.white} />
            <Text style={styles.resolveButtonText}>Resolver</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Ver Detalles</Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <WebLayout title="Alertas" subtitle="Centro de alertas y advertencias">
      <View style={styles.content}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
            <Text style={styles.createButtonText}>Nueva Alerta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <MaterialCommunityIcons name="alert-octagon" size={32} color={Colors.danger} />
            <Text style={styles.statValue}>{alertas.filter(a => a.nivel_severidad === 'CRITICA').length}</Text>
            <Text style={styles.statLabel}>Críticas</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <MaterialCommunityIcons name="alert" size={32} color="#FF6B6B" />
            <Text style={styles.statValue}>{alertas.filter(a => a.nivel_severidad === 'ALTA').length}</Text>
            <Text style={styles.statLabel}>Altas</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <MaterialCommunityIcons name="alert-circle" size={32} color={Colors.warning} />
            <Text style={styles.statValue}>{alertas.filter(a => a.nivel_severidad === 'MEDIA').length}</Text>
            <Text style={styles.statLabel}>Medias</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <MaterialCommunityIcons name="information" size={32} color={Colors.info} />
            <Text style={styles.statValue}>{alertas.filter(a => a.nivel_severidad === 'BAJA').length}</Text>
            <Text style={styles.statLabel}>Bajas</Text>
          </Card>
        </View>

        <FlatList
          data={alertas}
          renderItem={renderAlertCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={2}
          contentContainerStyle={styles.alertsGrid}
          showsVerticalScrollIndicator={false}
        />

        <AlertaDialog
          visible={dialogVisible}
          onClose={() => setDialogVisible(false)}
          onSuccess={handleSuccess}
        />
      </View>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  toolbar: {
    marginBottom: Spacing.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark,
    marginVertical: Spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  alertsGrid: {
    gap: Spacing.lg,
  },
  alertCard: {
    flex: 1,
    margin: Spacing.sm,
    maxWidth: '48%',
  },
  alertHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  severityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  alertInfo: {
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  severityText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  alertDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertDate: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  resolveButton: {
    backgroundColor: Colors.success,
    flex: 1,
  },
  resolveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  unreadBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unreadText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: Spacing.xs,
  },
});
