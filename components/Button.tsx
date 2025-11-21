import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme-new';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.lightGray;
    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.secondary;
      case 'danger':
        return Colors.danger;
      case 'ghost':
        return 'transparent';
      default:
        return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'ghost') return Colors.primary;
    return Colors.white;
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return Spacing.sm;
      case 'md':
        return Spacing.md;
      case 'lg':
        return Spacing.lg;
      default:
        return Spacing.md;
    }
  };

  const styles = StyleSheet.create({
    button: {
      backgroundColor: getBackgroundColor(),
      paddingVertical: getPadding(),
      paddingHorizontal: getPadding() * 2,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      width: fullWidth ? '100%' : 'auto',
      ...(variant === 'ghost' && { borderWidth: 1, borderColor: Colors.primary }),
      ...Shadows.sm,
    },
    text: {
      color: getTextColor(),
      fontSize: 16,
      fontWeight: '600',
      marginLeft: isLoading ? Spacing.sm : 0,
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading && <ActivityIndicator color={getTextColor()} />}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};
