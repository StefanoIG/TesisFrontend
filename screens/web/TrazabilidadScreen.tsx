import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebLayout from '@/components/web/WebLayout';
import LoteDialog from '@/components/web/LoteDialog';
import { Card } from '@/components/Card';
import { useTrazabilidadStore } from '@/store/trazabilidadStore';
import { Colors, Spacing, Typography } from '@/constants/theme-new';

export default function TrazabilidadWebScreen() {
  const { lotes, fetchLotes, isLoading } = useTrazabilidadStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedLote, setSelectedLote] = useState<any>(null);

  useEffect(() => {
    fetchLotes();
  }, []);

  const handleCreate = () => {
    setSelectedLote(null);
    setDialogVisible(true);
  };

  const handleEdit = (lote: any) => {
    setSelectedLote(lote);
    setDialogVisible(true);
  };

  const handleSuccess = () => {
    fetchLotes();
  };

  const getStatusColor = (estado: string) => {
    const colors: Record<string, string> = {
      'ACTIVO': Colors.success,
      'COMPLETADO': Colors.info,
      'PENDIENTE': Colors.warning,
      'CANCELADO': Colors.danger,
    };
    return colors[estado] || Colors.gray;
  };

  const renderLoteCard = ({ item }: any) => (
    <Card style={styles.loteCard}>
      <View style={styles.loteHeader}>
        <View>
          <Text style={styles.loteCode}>Lote #{item.codigo_lote}</Text>
          <Text style={styles.loteProduct}>{item.producto}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.estado) }]}>
            {item.estado}
          </Text>
        </View>
      </View>
      
      <View style={styles.loteDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={16} color={Colors.gray} />
          <Text style={styles.detailText}>
            {new Date(item.fecha_creacion).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="weight-kilogram" size={16} color={Colors.gray} />
          <Text style={styles.detailText}>{item.cantidad} {item.unidad_medida}</Text>
        </View>
        
        {item.ubicacion && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={Colors.gray} />
            <Text style={styles.detailText}>{item.ubicacion}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.viewButton} onPress={() => handleEdit(item)}>
        <Text style={styles.viewButtonText}>Editar</Text>
        <MaterialCommunityIcons name="pencil" size={16} color={Colors.primary} />
      </TouchableOpacity>
    </Card>
  );

  return (
    <WebLayout title="Trazabilidad" subtitle="Gestión de lotes y productos">
      <View style={styles.content}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
            <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
            <Text style={styles.primaryButtonText}>Nuevo Lote</Text>
          </TouchableOpacity>
          
          <View style={styles.filters}>
            <TouchableOpacity style={styles.filterButton}>
              <MaterialCommunityIcons name="filter-variant" size={20} color={Colors.dark} />
              <Text style={styles.filterButtonText}>Filtros</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton}>
              <MaterialCommunityIcons name="download" size={20} color={Colors.dark} />
              <Text style={styles.filterButtonText}>Exportar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={lotes}
          renderItem={renderLoteCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={3}
          contentContainerStyle={styles.lotesGrid}
          showsVerticalScrollIndicator={false}
        />

        <LoteDialog
          visible={dialogVisible}
          onClose={() => setDialogVisible(false)}
          onSuccess={handleSuccess}
          lote={selectedLote}
        />
      </View>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  filterButtonText: {
    color: Colors.dark,
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  lotesGrid: {
    gap: Spacing.lg,
  },
  loteCard: {
    flex: 1,
    margin: Spacing.sm,
    maxWidth: '31%',
  },
  loteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  loteCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  loteProduct: {
    fontSize: 14,
    color: Colors.gray,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loteDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: Spacing.sm,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    marginTop: Spacing.sm,
  },
  viewButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: Spacing.xs,
  },
});
