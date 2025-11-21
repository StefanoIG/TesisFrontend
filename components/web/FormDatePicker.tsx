import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme-new';

interface FormDatePickerProps {
  label: string;
  value?: string;
  onChange: (date: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

export default function FormDatePicker({ 
  label, 
  value, 
  onChange, 
  error, 
  required,
  placeholder = 'Seleccionar fecha',
  minDate,
  maxDate
}: FormDatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || '');
  const [selectedYear, setSelectedYear] = useState(
    value ? parseInt(value.split('-')[0]) : new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    value ? parseInt(value.split('-')[1]) - 1 : new Date().getMonth()
  );

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const month = (selectedMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `${selectedYear}-${month}-${dayStr}`;
    setTempDate(dateStr);
  };

  const handleConfirm = () => {
    if (tempDate) {
      onChange(tempDate);
      setShowPicker(false);
    }
  };

  const handleClear = () => {
    setTempDate('');
    onChange('');
    setShowPicker(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days = [];

    // Espacios vacíos para los días anteriores
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = tempDate === `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const isToday = 
        new Date().getDate() === day && 
        new Date().getMonth() === selectedMonth && 
        new Date().getFullYear() === selectedYear;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            styles.dayButton,
            isSelected && styles.selectedDay,
            isToday && !isSelected && styles.todayDay,
          ]}
          onPress={() => handleDateSelect(day)}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            isToday && !isSelected && styles.todayDayText,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const displayValue = value ? 
    new Date(value + 'T00:00:00').toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TouchableOpacity
        style={[styles.input, error && styles.inputError] as any}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {displayValue || placeholder}
        </Text>
        <MaterialCommunityIcons name="calendar" size={20} color={Colors.primary} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Calendar Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            {/* Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => setSelectedYear(selectedYear - 1)}
                style={styles.navButton}
              >
                <MaterialCommunityIcons name="chevron-left" size={24} color={Colors.dark} />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <TouchableOpacity
                  style={styles.monthYearButton}
                  onPress={() => setSelectedMonth((selectedMonth - 1 + 12) % 12)}
                >
                  <MaterialCommunityIcons name="chevron-left" size={20} color={Colors.primary} />
                </TouchableOpacity>
                
                <Text style={styles.headerText}>
                  {months[selectedMonth]} {selectedYear}
                </Text>
                
                <TouchableOpacity
                  style={styles.monthYearButton}
                  onPress={() => setSelectedMonth((selectedMonth + 1) % 12)}
                >
                  <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedYear(selectedYear + 1)}
                style={styles.navButton}
              >
                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={styles.weekDays}>
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
                <View key={index} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>

            {/* Footer */}
            <View style={styles.calendarFooter}>
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </TouchableOpacity>
              
              <View style={styles.footerButtons}>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleConfirm}
                  style={[styles.confirmButton, !tempDate && styles.confirmButtonDisabled]}
                  disabled={!tempDate}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  inputError: {
    borderColor: Colors.danger,
  },
  inputText: {
    fontSize: 16,
    color: Colors.dark,
    flex: 1,
  },
  placeholder: {
    color: Colors.gray,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  calendarContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  navButton: {
    padding: Spacing.xs,
  },
  monthYearButton: {
    padding: Spacing.xs,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    minWidth: 180,
    textAlign: 'center',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
  },
  dayButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: Colors.primary,
  },
  todayDay: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: Colors.dark,
  },
  selectedDayText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  todayDayText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  clearButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  clearButtonText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  cancelButtonText: {
    color: Colors.dark,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
