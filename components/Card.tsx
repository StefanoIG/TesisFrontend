import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme-new';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const styles = StyleSheet.create({
    card: {
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      ...Shadows.md,
    },
  });

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};
