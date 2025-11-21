import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { useProtectedRoute } from '@/components/ProtectedRoute';

export default function WebLayout() {
  useProtectedRoute();
  
  return (
    <View style={styles.container}>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
