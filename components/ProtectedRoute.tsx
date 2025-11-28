import { useEffect } from 'react';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme-new';

export function useProtectedRoute() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Use pathname for more reliable checks (avoids segment ordering ambiguities)
    if (!pathname) return;

    const inWebGroup = pathname.startsWith('/(web)');
    const isLoginPath = pathname.startsWith('/(web)/login') || pathname === '/(web)/login';

    if (!isAuthenticated && inWebGroup && !isLoginPath) {
      // Si no está autenticado y está en una ruta protegida, redirigir al login
      // Defer navigation to avoid attempting navigation before root layout mounts
      setTimeout(() => router.replace('/(web)/login'), 0);
    } else if (isAuthenticated && isLoginPath) {
      // Si está autenticado y está en login, redirigir al dashboard
      setTimeout(() => router.replace('/(web)'), 0);
    }
  }, [isAuthenticated, segments]);
}

export function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  useProtectedRoute();

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}
