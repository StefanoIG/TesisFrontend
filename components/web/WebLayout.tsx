import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing, Typography } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WebLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function WebLayout({ children, title, subtitle }: WebLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthStore();

  const menuItems = [
    { id: 'dashboard', icon: 'view-dashboard', label: 'Dashboard', path: '/(web)' },
    { id: 'trazabilidad', icon: 'package-variant', label: 'Trazabilidad', path: '/(web)/trazabilidad' },
    { id: 'products', icon: 'fruit-grapes', label: 'Productos', path: '/(web)/products' },
    { id: 'shipments', icon: 'truck', label: 'Envíos', path: '/(web)/shipments' },
    { id: 'alerts', icon: 'alert', label: 'Alertas', path: '/(web)/alerts' },
    { id: 'reports', icon: 'chart-bar', label: 'Reportes', path: '/(web)/reports' },
    { id: 'notifications', icon: 'bell', label: 'Notificaciones', path: '/(web)/notifications' },
    { id: 'profile', icon: 'account', label: 'Perfil', path: '/(web)/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/(web)') {
      return pathname === '/(web)' || pathname === '/(web)/';
    }
    return pathname.startsWith(path);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="leaf" size={32} color={Colors.white} />
          </View>
          <Text style={styles.appName}>Trazabilidad</Text>
          <Text style={styles.appSubtitle}>Agroindustrial</Text>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, isActive(item.path) && styles.menuItemActive]}
              onPress={() => router.push(item.path as any)}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={22}
                color={isActive(item.path) ? Colors.white : Colors.lightGray}
              />
              <Text style={[styles.menuText, isActive(item.path) && styles.menuTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sidebarFooter}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {(user?.nombre_completo || user?.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.nombre_completo || 'Usuario'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || ''}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <MaterialCommunityIcons name="logout" size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.pageTitle}>{title}</Text>
            {subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons name="magnify" size={24} color={Colors.dark} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={Colors.dark} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.light,
    overflow: 'hidden',
  },
  sidebar: {
    width: 260,
    backgroundColor: Colors.dark,
    borderRightWidth: 1,
    borderRightColor: Colors.lightGray,
    height: '100%',
    position: 'relative',
    zIndex: 10,
  },
  sidebarHeader: {
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: Colors.lightGray,
  },
  menu: {
    flex: 1,
    paddingVertical: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.md,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: Colors.primary,
  },
  menuText: {
    marginLeft: Spacing.md,
    fontSize: 15,
    color: Colors.lightGray,
    fontWeight: '500',
  },
  menuTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  sidebarFooter: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  userAvatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    color: Colors.lightGray,
    fontSize: 12,
  },
  logoutButton: {
    padding: Spacing.sm,
  },
  mainContent: {
    flex: 1,
    backgroundColor: Colors.light,
    position: 'relative',
    zIndex: 1,
  },
  topBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    zIndex: 5,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Colors.gray,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
