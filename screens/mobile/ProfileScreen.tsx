import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Colors, Spacing, Typography } from '@/constants/theme-new';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

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
      alignItems: 'center',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: Colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: '700' as const,
      color: Colors.white,
    },
    userName: {
      fontSize: Typography.subtitle.fontSize,
      fontWeight: '600' as const,
      color: Colors.white,
      marginBottom: Spacing.xs,
    },
    userEmail: {
      fontSize: Typography.body.fontSize,
      color: Colors.lightGray,
    },
    content: {
      padding: Spacing.lg,
    },
    section: {
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      fontSize: Typography.body.fontSize,
      fontWeight: '600' as const,
      color: Colors.dark,
      marginBottom: Spacing.md,
    },
    infoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: Colors.lightGray,
    },
    infoLabel: {
      fontSize: Typography.body.fontSize,
      color: Colors.gray,
    },
    infoValue: {
      fontSize: Typography.body.fontSize,
      fontWeight: '600' as const,
      color: Colors.dark,
    },
  });

  const initials = user?.nombre_completo
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.nombre_completo}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Account Info */}
        <Card>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Roles</Text>
            <Text style={styles.infoValue}>{user?.roles?.join(', ') || 'User'}</Text>
          </View>
        </Card>

        {/* Settings */}
        <Card>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Notifications</Text>
            <Text style={styles.infoValue}>Enabled</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Language</Text>
            <Text style={styles.infoValue}>English</Text>
          </View>
        </Card>

        {/* Actions */}
        <Button
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}
