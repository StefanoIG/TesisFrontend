import React from 'react';
import { View, Text, StyleSheet, TextInput as RNTextInput, TextInputProps } from 'react-native';
import { Colors, Spacing } from '@/constants/theme-new';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export default function FormInput({ label, error, required, ...props }: FormInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <RNTextInput
        style={[styles.input, error && styles.inputError] as any}
        placeholderTextColor={Colors.gray}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.dark,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
});
