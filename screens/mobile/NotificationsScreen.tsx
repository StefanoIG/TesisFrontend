import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Shadows, BorderRadius } from '@/constants/theme-new';
import { Notificacion } from '@/types/index';
import { apiClient } from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NotificationsScreen = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const response: any = await apiClient.getNotificaciones();
      if (response && Array.isArray(response)) {
        setNotificaciones(response);
      } else if (response && response.results && Array.isArray(response.results)) {
        setNotificaciones(response.results);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotificaciones();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.markAsRead(id);
      // Update local state
      setNotificaciones(prev =>
        prev.map(n => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (error) {
      console.error('Error marking as read:', error);
      Alert.alert('Error', 'No se pudo marcar como leída');
    }
  };

  const filteredNotificaciones = notificaciones.filter(notif => {
    if (filter === 'unread') return !notif.leida;
    if (filter === 'read') return notif.leida;
    return true;
  });

  const getNotificationIcon = (tipo: string) => {
    const iconMap: { [key: string]: string } = {
      ALERTA: 'alert-circle',
      INFORMACION: 'information',
      ADVERTENCIA: 'alert',
      CONFIRMACION: 'check-circle',
      ENVIO: 'package-variant',
      LOTE: 'archive',
      SISTEMA: 'cog',
    };
    return iconMap[tipo] || 'bell';
  };

  const getNotificationColor = (tipo: string): string => {
    const colorMap: { [key: string]: string } = {
      ALERTA: Colors.danger,
      INFORMACION: Colors.info,
      ADVERTENCIA: Colors.warning,
      CONFIRMACION: Colors.success,
      ENVIO: Colors.info,
      LOTE: Colors.secondary,
      SISTEMA: Colors.gray,
    };
    return colorMap[tipo] || Colors.primary;
  };

  const renderNotification = ({ item }: { item: Notificacion }) => {
    const notificationType = item.tipo || 'SISTEMA';
    const iconColor = getNotificationColor(notificationType);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.leida && styles.unreadCard,
        ]}
        onPress={() => {
          if (!item.leida) {
            handleMarkAsRead(item.id);
          }
        }}
      >
        {/* Left indicator */}
        <View
          style={[
            styles.leftBorder,
            { backgroundColor: iconColor },
          ]}
        />

        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getNotificationIcon(notificationType) as any}
            size={24}
            color={iconColor}
          />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <ThemedText
              style={[
                styles.title,
                !item.leida && styles.unreadText,
              ]}
              numberOfLines={1}
            >
              {item.titulo}
            </ThemedText>
            {!item.leida && (
              <View style={styles.unreadDot} />
            )}
          </View>

          <ThemedText
            style={styles.message}
            numberOfLines={2}
          >
            {item.mensaje}
          </ThemedText>

          <View style={styles.footerRow}>
            <ThemedText style={styles.type}>
              {notificationType}
            </ThemedText>
            <ThemedText style={styles.date}>
              {new Date(item.fecha_creacion).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>

        {/* Action button */}
        {!item.leida && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMarkAsRead(item.id)}
          >
            <MaterialCommunityIcons
              name="check"
              size={18}
              color={Colors.secondary}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="bell-off"
        size={64}
        color={Colors.lightGray}
      />
      <ThemedText style={styles.emptyText}>
        No hay notificaciones
      </ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Aquí aparecerán tus notificaciones
      </ThemedText>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>
          Notificaciones
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {filteredNotificaciones.length} notificaciones
        </ThemedText>
      </View>

      {/* Filter buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(['all', 'unread', 'read'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <ThemedText
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'all'
                ? 'Todas'
                : f === 'unread'
                  ? 'No leídas'
                  : 'Leídas'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications list */}
      <FlatList
        data={filteredNotificaciones}
        renderItem={renderNotification}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.secondary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.gray,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  filterButtonActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray,
  },
  filterTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  unreadCard: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  leftBorder: {
    width: 4,
    height: '100%',
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  unreadText: {
    fontWeight: '700',
    color: Colors.secondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    marginLeft: Spacing.sm,
  },
  message: {
    fontSize: 13,
    color: Colors.gray,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.darkGray,
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 11,
    color: Colors.gray,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
