import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme-new';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  disabled = false,
}) => {
  const styles = StyleSheet.create({
    container: {
      marginBottom: Spacing.md,
    },
    label: {
      fontSize: Typography.caption.fontSize,
      fontWeight: '600' as const,
      color: Colors.dark,
      marginBottom: Spacing.xs,
    },
    input: {
      backgroundColor: Colors.light,
      borderWidth: 1,
      borderColor: error ? Colors.danger : Colors.lightGray,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      fontSize: 16,
      color: Colors.dark,
    },
    error: {
      fontSize: Typography.small.fontSize,
      color: Colors.danger,
      marginTop: Spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={!disabled}
        placeholderTextColor={Colors.gray}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};
