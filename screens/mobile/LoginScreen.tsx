import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Colors, Spacing, Typography } from '@/constants/theme-new';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const { login, isLoading } = useAuthStore();
  const { showToast } = useUIStore();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(username, password);
      showToast('Login successful!', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please try again.';
      Alert.alert('Login Error', errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.xl,
    },
    header: {
      marginBottom: Spacing.xl,
      alignItems: 'center',
    },
    title: {
      fontSize: Typography.title.fontSize,
      fontWeight: '700' as const,
      color: Colors.primary,
      marginBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: Typography.body.fontSize,
      color: Colors.darkGray,
      textAlign: 'center',
    },
    formContainer: {
      marginBottom: Spacing.xl,
    },
    footerText: {
      textAlign: 'center',
      fontSize: Typography.small.fontSize,
      color: Colors.gray,
      marginTop: Spacing.lg,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Trazabilidad</Text>
          <Text style={styles.subtitle}>Agroindustrial</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) setErrors({ ...errors, username: undefined });
            }}
            error={errors.username}
            disabled={isLoading}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            secureTextEntry
            error={errors.password}
            disabled={isLoading}
          />

          <Button
            title={isLoading ? 'Signing in...' : 'Sign In'}
            onPress={handleLogin}
            isLoading={isLoading}
            disabled={isLoading}
            fullWidth
          />
        </View>

        <Text style={styles.footerText}>
          Secure access to your agricultural traceability data
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
