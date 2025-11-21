import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme-new';

interface FormCheckboxProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

export default function FormCheckbox({ label, value, onChange, description }: FormCheckboxProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => onChange(!value)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, value && styles.checkboxChecked]}>
          {value && (
            <MaterialCommunityIcons name="check" size={18} color={Colors.white} />
          )}
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 4,
  },
});
