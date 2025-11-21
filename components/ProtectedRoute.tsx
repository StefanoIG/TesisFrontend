import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme-new';

export function useProtectedRoute() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(web)' && segments[1] !== 'login';
    
    if (!isAuthenticated && inAuthGroup) {
      // Si no está autenticado y está en una ruta protegida, redirigir al login
      router.replace('/(web)/login');
    } else if (isAuthenticated && segments[1] === 'login') {
      // Si está autenticado y está en login, redirigir al dashboard
      router.replace('/(web)');
    }
  }, [isAuthenticated, segments]);
}

export function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  useProtectedRoute();

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}
