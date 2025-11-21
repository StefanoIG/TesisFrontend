import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, RefreshControl, Modal, Alert } from 'react-native';
import { useTrazabilidadStore } from '@/store/trazabilidadStore';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Colors, Spacing, Typography, StatusColors, Shadows, BorderRadius } from '@/constants/theme-new';

export default function TrazabilidadScreen() {
  const { lotes, fetchLotes, isLoading, createLote } = useTrazabilidadStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLote, setNewLote] = useState({
    numero_lote: '',
    cantidad: '',
    estado: 'PENDIENTE',
  });

  useEffect(() => {
    fetchLotes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLotes();
    setRefreshing(false);
  };

  const handleCreateLote = async () => {
    if (!newLote.numero_lote || !newLote.cantidad) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await createLote({
        numero_lote: newLote.numero_lote,
        cantidad: parseInt(newLote.cantidad),
        estado: newLote.estado,
      });
      setIsModalOpen(false);
      setNewLote({ numero_lote: '', cantidad: '', estado: 'PENDIENTE' });
    } catch (error) {
      Alert.alert('Error', 'Failed to create lot');
    }
  };

  const getStatusColor = (status: string) => {
    return StatusColors[status as keyof typeof StatusColors] || Colors.gray;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light,
    },
    header: {
      backgroundColor: Colors.secondary,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      paddingTop: Spacing.xl,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: Typography.subtitle.fontSize,
      fontWeight: '600' as const,
      color: Colors.white,
    },
    content: {
      padding: Spacing.lg,
    },
    loteCard: {
      marginBottom: Spacing.md,
    },
    loteName: {
      fontSize: Typography.body.fontSize,
      fontWeight: '600' as const,
      color: Colors.dark,
      marginBottom: Spacing.xs,
    },
    loteInfo: {
      fontSize: Typography.small.fontSize,
      color: Colors.gray,
      marginBottom: Spacing.xs,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: 16,
      marginTop: Spacing.sm,
    },
    statusText: {
      color: Colors.white,
      fontSize: Typography.small.fontSize,
      fontWeight: '600' as const,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: Spacing.xl * 2,
    },
    emptyText: {
      fontSize: Typography.body.fontSize,
      color: Colors.gray,
    },
    modal: {
      flex: 1,
      backgroundColor: Colors.overlay,
      justifyContent: 'center',
      padding: Spacing.lg,
    },
    modalContent: {
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
    },
    modalTitle: {
      fontSize: Typography.subtitle.fontSize,
      fontWeight: '600' as const,
      color: Colors.dark,
      marginBottom: Spacing.md,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.lg,
    },
  });

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No lots available</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Traceability</Text>
        <Button
          title="+ New"
          variant="ghost"
          size="sm"
          onPress={() => setIsModalOpen(true)}
        />
      </View>

      <FlatList
        data={lotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.loteCard}>
            <Text style={styles.loteName}>{item.numero_lote}</Text>
            <Text style={styles.loteInfo}>Quantity: {item.cantidad} {item.unidad_medida}</Text>
            <Text style={styles.loteInfo}>
              Planting: {new Date(item.fecha_siembra).toLocaleDateString()}
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}
            >
              <Text style={styles.statusText}>{item.estado}</Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
        scrollEnabled={true}
      />

      {/* Create Lot Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Lot</Text>

            <Input
              label="Lot Number"
              placeholder="Enter lot number"
              value={newLote.numero_lote}
              onChangeText={(text) => setNewLote({ ...newLote, numero_lote: text })}
            />

            <Input
              label="Quantity"
              placeholder="Enter quantity"
              value={newLote.cantidad}
              onChangeText={(text) => setNewLote({ ...newLote, cantidad: text })}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsModalOpen(false)}
                fullWidth
              />
              <Button
                title="Create"
                variant="secondary"
                onPress={handleCreateLote}
                isLoading={isLoading}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
