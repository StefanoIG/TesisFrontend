import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme-new';

interface FormSelectProps {
  label: string;
  value?: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  zIndex?: number;
}

export default function FormSelect({ 
  label, 
  value, 
  options, 
  onSelect, 
  error, 
  required,
  placeholder = 'Seleccionar...',
  zIndex = 1
}: FormSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={[styles.container, { zIndex: isOpen ? 1000 + zIndex : zIndex }] as any}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TouchableOpacity
        style={[styles.select, error && styles.selectError] as any}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.selectText, !selectedOption && styles.placeholder]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <MaterialCommunityIcons 
          name={isOpen ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={Colors.gray} 
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                value === option.value && styles.optionSelected
              ]}
              onPress={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
            >
              <Text style={[
                styles.optionText,
                value === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
              {value === option.value && (
                <MaterialCommunityIcons name="check" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    position: 'relative',
    zIndex: 1,
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
  select: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
  },
  selectError: {
    borderColor: Colors.danger,
  },
  selectText: {
    fontSize: 16,
    color: Colors.dark,
  },
  placeholder: {
    color: Colors.gray,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  optionSelected: {
    backgroundColor: Colors.primary + '10',
  },
  optionText: {
    fontSize: 16,
    color: Colors.dark,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
});
