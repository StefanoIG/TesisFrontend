import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebLayout from '@/components/web/WebLayout';
import { Card } from '@/components/Card';
import { apiClient } from '@/services/api';
import { Colors, Spacing } from '@/constants/theme-new';

export default function NotificationsWebScreen() {
  const [notificaciones, setNotificaciones] = useState<any[]>([]);

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      const data: any = await apiClient.getNotificaciones();
      setNotificaciones(data.results || data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getTypeIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      'INFO': 'information',
      'EXITO': 'check-circle',
      'ADVERTENCIA': 'alert',
      'ERROR': 'alert-circle',
    };
    return icons[tipo] || 'bell';
  };

  const getTypeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'INFO': Colors.info,
      'EXITO': Colors.success,
      'ADVERTENCIA': Colors.warning,
      'ERROR': Colors.danger,
    };
    return colors[tipo] || Colors.gray;
  };

  const renderNotificationCard = ({ item }: any) => (
    <Card style={[styles.notificationCard, !item.leida && styles.unreadCard] as any}>
      <View style={styles.notificationHeader}>
        <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.tipo) + '20' }]}>
          <MaterialCommunityIcons 
            name={getTypeIcon(item.tipo) as any} 
            size={22} 
            color={getTypeColor(item.tipo)} 
          />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.titulo}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.mensaje}
          </Text>
          
          <View style={styles.notificationFooter}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.gray} />
            <Text style={styles.notificationDate}>
              {new Date(item.fecha_creacion).toLocaleString()}
            </Text>
          </View>
        </View>
        
        {!item.leida && (
          <View style={styles.unreadDot} />
        )}
      </View>
    </Card>
  );

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  return (
    <WebLayout title="Notificaciones" subtitle={`${unreadCount} notificaciones sin leer`}>
      <View style={styles.content}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.markAllButton}>
            <MaterialCommunityIcons name="check-all" size={20} color={Colors.primary} />
            <Text style={styles.markAllText}>Marcar todas como leídas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.filterButton}>
            <MaterialCommunityIcons name="filter-variant" size={20} color={Colors.dark} />
            <Text style={styles.filterText}>Filtrar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={notificaciones}
          renderItem={renderNotificationCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
  },
  markAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.white,
  },
  filterText: {
    color: Colors.dark,
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  list: {
    gap: Spacing.md,
  },
  notificationCard: {
    backgroundColor: Colors.white,
  } as any,
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  } as any,
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: Spacing.xs,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: Spacing.xs,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
  },
});
