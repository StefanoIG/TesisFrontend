import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme-new';

export default function Index() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth().finally(() => setIsChecking(false));
  }, []);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    if (Platform.OS === 'web') {
      return <Redirect href="/(web)/login" />;
    }
    return <Redirect href="/login" />;
  }

  // Si está autenticado, redirigir según la plataforma
  if (Platform.OS === 'web') {
    return <Redirect href="/(web)" />;
  }
  return <Redirect href="/(tabs)" />;
}
