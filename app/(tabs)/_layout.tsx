import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme-new';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.gray,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.lightGray,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 90 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />

      {/* Trazabilidad Tab */}
      <Tabs.Screen
        name="trazabilidad"
        options={{
          title: 'Trazabilidad',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="archive" color={color} size={size} />
          ),
        }}
      />

      {/* Shipments Tab */}
      <Tabs.Screen
        name="shipments"
        options={{
          title: 'Envíos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="truck" color={color} size={size} />
          ),
        }}
      />

      {/* Alerts Tab */}
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="alert-circle" color={color} size={size} />
          ),
        }}
      />

      {/* Notifications Tab */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notificaciones',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
