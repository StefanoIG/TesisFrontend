import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme-new';

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  submitDisabled?: boolean;
}

export default function Dialog({ 
  visible, 
  onClose, 
  title, 
  children, 
  onSubmit,
  submitText = 'Guardar',
  submitDisabled = false
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Footer */}
          {onSubmit && (
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, submitDisabled && styles.submitButtonDisabled]} 
                onPress={onSubmit}
                disabled={submitDisabled}
              >
                <Text style={styles.submitButtonText}>{submitText}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  dialog: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  cancelButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  cancelButtonText: {
    color: Colors.dark,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
