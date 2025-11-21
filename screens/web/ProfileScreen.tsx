import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebLayout from '@/components/web/WebLayout';
import { Card } from '@/components/Card';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing } from '@/constants/theme-new';

export default function ProfileWebScreen() {
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthStore();

  const InfoCard = ({ icon, label, value }: any) => (
    <View style={styles.infoItem}>
      <MaterialCommunityIcons name={icon} size={20} color={Colors.primary} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'No disponible'}</Text>
      </View>
    </View>
  );

  return (
    <WebLayout title="Perfil" subtitle="Configuración de cuenta y preferencias">
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>
                  {(user?.nombre_completo || user?.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.nombre_completo || 'Usuario'}</Text>
                <Text style={styles.profileEmail}>{user?.email || ''}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{(user as any)?.rol || 'Usuario'}</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.editButton}>
                <MaterialCommunityIcons name="pencil" size={20} color={Colors.white} />
                <Text style={styles.editButtonText}>Editar Perfil</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <Card style={styles.infoCard}>
            <InfoCard icon="account" label="Nombre Completo" value={user?.nombre_completo} />
            <InfoCard icon="email" label="Correo Electrónico" value={user?.email} />
            <InfoCard icon="phone" label="Teléfono" value={(user as any)?.telefono} />
            <InfoCard icon="badge-account" label="Rol" value={(user as any)?.rol} />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          <Card style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="bell" size={22} color={Colors.dark} />
                <Text style={styles.settingText}>Notificaciones</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.gray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="shield-lock" size={22} color={Colors.dark} />
                <Text style={styles.settingText}>Seguridad y Privacidad</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.gray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="palette" size={22} color={Colors.dark} />
                <Text style={styles.settingText}>Apariencia</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.gray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="help-circle" size={22} color={Colors.dark} />
                <Text style={styles.settingText}>Ayuda y Soporte</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.gray} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <MaterialCommunityIcons name="logout" size={22} color={Colors.white} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  profileSection: {
    marginBottom: Spacing.xl,
  },
  profileCard: {
    padding: Spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xl,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: Spacing.md,
  },
  infoCard: {
    padding: Spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  infoContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: Colors.dark,
    marginLeft: Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.danger,
    paddingVertical: Spacing.lg,
    borderRadius: 8,
  },
  logoutText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: Spacing.sm,
  },
});
