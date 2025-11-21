import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, setError, isAuthenticated } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ username?: string; password?: string }>({});

  useEffect(() => {
    // Si ya está autenticado, redirigir
    if (isAuthenticated) {
      if (Platform.OS === 'web') {
        router.replace('/(web)');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated]);

  const validate = () => {
    const errors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      errors.username = 'El usuario es requerido';
    }

    if (!password) {
      errors.password = 'La contraseña es requerida';
    } else if (password.length < 4) {
      errors.password = 'La contraseña debe tener al menos 4 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    setError(null);
    
    if (!validate()) {
      return;
    }

    try {
      await login(username, password);
      // El redirect se maneja en el useEffect cuando isAuthenticated cambie
    } catch (err: any) {
      // El error ya está manejado en el store
      console.error('Login error:', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Left Panel - Branding */}
      <View style={styles.leftPanel}>
        <View style={styles.brandingContent}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="leaf" size={80} color={Colors.white} />
          </View>
          <Text style={styles.brandTitle}>Trazabilidad Agroindustrial</Text>
          <Text style={styles.brandSubtitle}>
            Sistema integral de seguimiento y control de productos agrícolas desde el cultivo hasta la distribución
          </Text>
          <View style={styles.features}>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="check-circle" size={24} color={Colors.white} />
              <Text style={styles.featureText}>Control de calidad en tiempo real</Text>
            </View>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="check-circle" size={24} color={Colors.white} />
              <Text style={styles.featureText}>Rastreo completo de lotes</Text>
            </View>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="check-circle" size={24} color={Colors.white} />
              <Text style={styles.featureText}>Gestión de envíos y logística</Text>
            </View>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="check-circle" size={24} color={Colors.white} />
              <Text style={styles.featureText}>Reportes y análisis detallados</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Right Panel - Login Form */}
      <View style={styles.rightPanel}>
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Usuario</Text>
              <View style={[styles.inputContainer, validationErrors.username && styles.inputError] as any}>
                <MaterialCommunityIcons name="account" size={20} color={Colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setValidationErrors({ ...validationErrors, username: undefined });
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {validationErrors.username && (
                <Text style={styles.validationError}>{validationErrors.username}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputContainer, validationErrors.password && styles.inputError] as any}>
                <MaterialCommunityIcons name="lock" size={20} color={Colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setValidationErrors({ ...validationErrors, password: undefined });
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  disabled={isLoading}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={Colors.gray}
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.password && (
                <Text style={styles.validationError}>{validationErrors.password}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 Trazabilidad Agroindustrial. Todos los derechos reservados.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  brandingContent: {
    maxWidth: 500,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  brandSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    marginBottom: Spacing.xxl,
  },
  features: {
    gap: Spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureText: {
    fontSize: 15,
    color: Colors.white,
    flex: 1,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  formContainer: {
    width: '100%',
    maxWidth: 450,
  },
  formHeader: {
    marginBottom: Spacing.xxl,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
    outlineStyle: 'none',
  } as any,
  eyeIcon: {
    padding: Spacing.xs,
  },
  validationError: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    ...Shadows.md,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  footer: {
    marginTop: Spacing.xxl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  footerText: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
});
