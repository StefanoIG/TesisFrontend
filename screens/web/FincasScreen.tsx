import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import WebLayout from '@/components/web/WebLayout';
import FincaDialog from '@/components/web/FincaDialog';
import ParcelaDialog from '@/components/web/ParcelaDialog';
import FincaMapPicker from '@/components/web/FincaMapPicker';
import { useFincaStore, useParcelaStore } from '@/store/fincaStore';
import { Finca, Parcela } from '@/types/index';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FincasScreen() {
  const { fincas, isLoading, fetchFincas, createFinca, updateFinca, deleteFinca } = useFincaStore();
  const { parcelas, fetchParcelasByFinca, createParcela, updateParcela, deleteParcela } = useParcelaStore();

  const [selectedFinca, setSelectedFinca] = useState<Finca | null>(null);
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);
  const [showFincaDialog, setShowFincaDialog] = useState(false);
  const [showParcelaDialog, setShowParcelaDialog] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPolygonData, setMapPolygonData] = useState<{
    coordinates: [number, number][];
    areaM2: number;
  } | null>(null);

  useEffect(() => {
    loadFincas();
  }, []);

  useEffect(() => {
    if (selectedFinca) {
      fetchParcelasByFinca(selectedFinca.id);
    }
  }, [selectedFinca]);

  const loadFincas = async () => {
    try {
      await fetchFincas();
    } catch (error) {
      console.error('Error loading fincas:', error);
    }
  };

  const handleCreateFinca = async (data: Partial<Finca>) => {
    try {
      const newFinca = await createFinca(data as Omit<Finca, 'id' | 'fecha_creacion'>);
      setSelectedFinca(newFinca);
      setShowFincaDialog(false);
    } catch (error: any) {
      console.error('Error creating finca:', error);
    }
  };

  const handleUpdateFinca = async (data: Partial<Finca>) => {
    if (!selectedFinca) return;
    try {
      await updateFinca(selectedFinca.id, data);
      await loadFincas();
      setShowFincaDialog(false);
    } catch (error) {
      console.error('Error updating finca:', error);
    }
  };

  const handleDeleteFinca = async (fincaId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta finca?')) return;
    try {
      await deleteFinca(fincaId);
      if (selectedFinca?.id === fincaId) {
        setSelectedFinca(null);
      }
      await loadFincas();
    } catch (error) {
      console.error('Error deleting finca:', error);
    }
  };

  const handleCreateParcela = async (data: Partial<Parcela>) => {
    try {
      const newParcela = await createParcela(data as Omit<Parcela, 'id' | 'fecha_creacion'>);
      await fetchParcelasByFinca(selectedFinca!.id);
      setShowParcelaDialog(false);
    } catch (error) {
      console.error('Error creating parcela:', error);
    }
  };

  const handleUpdateParcela = async (data: Partial<Parcela>) => {
    if (!selectedParcela) return;
    try {
      await updateParcela(selectedParcela.id, data);
      if (selectedFinca) {
        await fetchParcelasByFinca(selectedFinca.id);
      }
      setShowParcelaDialog(false);
    } catch (error) {
      console.error('Error updating parcela:', error);
    }
  };

  const handleDeleteParcela = async (parcelaId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta parcela?')) return;
    try {
      await deleteParcela(parcelaId);
      if (selectedFinca) {
        await fetchParcelasByFinca(selectedFinca.id);
      }
    } catch (error) {
      console.error('Error deleting parcela:', error);
    }
  };

  const handleMapPolygonSelect = (coordinates: [number, number][], areaM2: number) => {
    setMapPolygonData({ coordinates, areaM2 });
  };

  const useParceleMapData = async () => {
    if (!mapPolygonData || !selectedFinca) return;

    const newParcela: Partial<Parcela> = {
      nombre: `Parcela ${parcelas.length + 1}`,
      area_m2: mapPolygonData.areaM2,
      area_km2: mapPolygonData.areaM2 / 1_000_000,
      ubicacion: {
        latitud: mapPolygonData.coordinates[0][1],
        longitud: mapPolygonData.coordinates[0][0],
      },
      geometria: {
        type: 'Polygon',
        coordinates: [mapPolygonData.coordinates],
      },
      es_activa: true,
      finca_id: selectedFinca.id,
    };

    try {
      await createParcela(newParcela as Omit<Parcela, 'id' | 'fecha_creacion'>);
      await fetchParcelasByFinca(selectedFinca.id);
      setShowMapPicker(false);
      setMapPolygonData(null);
    } catch (error) {
      console.error('Error creating parcela from map:', error);
    }
  };

  return (
    <WebLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gestión de Fincas y Parcelas</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              setSelectedFinca(null);
              setShowFincaDialog(true);
            }}
          >
            <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
            <Text style={styles.createButtonText}>Nueva Finca</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {/* Lista de Fincas */}
          <View style={styles.fincasSection}>
            <Text style={styles.sectionTitle}>Fincas ({fincas.length})</Text>

            {isLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : fincas.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="home-variant" size={48} color={Colors.lightGray} />
                <Text style={styles.emptyStateText}>No hay fincas registradas</Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => setShowFincaDialog(true)}
                >
                  <Text style={styles.emptyStateButtonText}>Crear Primera Finca</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={fincas}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.fincaCard, selectedFinca?.id === item.id && styles.fincaCardActive]}
                    onPress={() => setSelectedFinca(item)}
                  >
                    <View style={styles.fincaCardHeader}>
                      <View style={styles.fincaInfo}>
                        <Text style={styles.fincaName}>{item.nombre}</Text>
                        <View style={styles.fincaMeta}>
                          <MaterialCommunityIcons name="ruler" size={14} color={Colors.gray} />
                          <Text style={styles.fincaMetaText}>
                            {item.area_km2.toFixed(2)} km² • {(item.area_km2 * 100).toFixed(0)} ha
                          </Text>
                        </View>
                      </View>
                      <View style={styles.fincaActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => {
                            setSelectedFinca(item);
                            setShowFincaDialog(true);
                          }}
                        >
                          <MaterialCommunityIcons name="pencil" size={18} color={Colors.info} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteFinca(item.id)}
                        >
                          <MaterialCommunityIcons name="delete" size={18} color={Colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {item.descripcion && (
                      <Text style={styles.fincaDescription}>{item.descripcion}</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          {/* Parcelas de la Finca Seleccionada */}
          {selectedFinca && (
            <View style={styles.parcelasSection}>
              <View style={styles.parcelasHeader}>
                <Text style={styles.sectionTitle}>Parcelas ({parcelas.length})</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => {
                    setSelectedParcela(null);
                    setShowParcelaDialog(true);
                  }}
                >
                  <MaterialCommunityIcons name="plus" size={16} color={Colors.white} />
                  <Text style={styles.createButtonSmall}>Nueva Parcela</Text>
                </TouchableOpacity>
              </View>

              {parcelas.length === 0 ? (
                <View style={styles.emptyStateParcelas}>
                  <MaterialCommunityIcons name="land-plots" size={40} color={Colors.lightGray} />
                  <Text style={styles.emptyStateText}>No hay parcelas en esta finca</Text>
                </View>
              ) : (
                <FlatList
                  data={parcelas}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.parcelaCard}>
                      <View style={styles.parcelaCardHeader}>
                        <View style={styles.parcelaInfo}>
                          <Text style={styles.parcelaName}>{item.nombre}</Text>
                          <View style={styles.parcelaMeta}>
                            <MaterialCommunityIcons name="ruler" size={13} color={Colors.gray} />
                            <Text style={styles.parcelaMetaText}>{item.area_m2.toLocaleString()} m²</Text>
                            {item.cultivo_actual && (
                              <>
                                <Text style={styles.metaDot}>•</Text>
                                <Text style={styles.parcelaMetaText}>{item.cultivo_actual}</Text>
                              </>
                            )}
                          </View>
                        </View>
                        <View style={[styles.stateBadge, item.estado === 'activa' && styles.stateBadgeActive]}>
                          <Text style={styles.stateBadgeText}>
                            {item.estado === 'activa' && 'Activa'}
                            {item.estado === 'en_descanso' && 'Descanso'}
                            {item.estado === 'preparacion' && 'Preparación'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.parcelaActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.smallActionButton]}
                          onPress={() => {
                            setSelectedParcela(item);
                            setShowParcelaDialog(true);
                          }}
                        >
                          <MaterialCommunityIcons name="pencil" size={16} color={Colors.info} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.smallActionButton]}
                          onPress={() => handleDeleteParcela(item.id)}
                        >
                          <MaterialCommunityIcons name="delete" size={16} color={Colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              )}

              {/* Botón para agregar parcela desde mapa */}
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => setShowMapPicker(true)}
              >
                <MaterialCommunityIcons name="map-plus" size={20} color={Colors.white} />
                <Text style={styles.createButtonText}>Dibujar Parcela en Mapa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Dialogs */}
      <FincaDialog
        visible={showFincaDialog}
        finca={selectedFinca}
        onClose={() => {
          setShowFincaDialog(false);
          setSelectedFinca(null);
        }}
        onSave={selectedFinca ? handleUpdateFinca : handleCreateFinca}
        isLoading={isLoading}
      />

      <ParcelaDialog
        visible={showParcelaDialog}
        fincaId={selectedFinca?.id}
        parcela={selectedParcela}
        onClose={() => {
          setShowParcelaDialog(false);
          setSelectedParcela(null);
        }}
        onSave={selectedParcela ? handleUpdateParcela : handleCreateParcela}
        isLoading={isLoading}
      />

      {/* Map Picker Modal */}
      {showMapPicker && (
        <View style={styles.mapPickerOverlay}>
          <View style={styles.mapPickerContainer}>
            <View style={styles.mapPickerHeader}>
              <Text style={styles.mapPickerTitle}>Dibujar Parcela en Mapa</Text>
              <TouchableOpacity onPress={() => setShowMapPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <FincaMapPicker onSelectPolygon={handleMapPolygonSelect} editable={true} />

            {mapPolygonData && (
              <View style={styles.mapDataInfo}>
                <Text style={styles.mapDataLabel}>Área seleccionada: {mapPolygonData.areaM2.toLocaleString()} m²</Text>
                <TouchableOpacity
                  style={styles.useMapDataButton}
                  onPress={useParceleMapData}
                >
                  <MaterialCommunityIcons name="check" size={18} color={Colors.white} />
                  <Text style={styles.createButtonText}>Crear Parcela</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  createButtonSmall: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  fincasSection: {
    flex: 0.4,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  parcelasSection: {
    flex: 0.6,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  parcelasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  fincaCard: {
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fincaCardActive: {
    backgroundColor: '#e8f5e9',
    borderColor: Colors.secondary,
  },
  fincaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fincaInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  fincaName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  fincaDescription: {
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: Spacing.sm,
  },
  fincaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  fincaMetaText: {
    fontSize: 12,
    color: Colors.gray,
  },
  fincaActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light,
  },
  smallActionButton: {
    padding: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateParcelas: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: Spacing.md,
  },
  emptyStateButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.md,
  },
  emptyStateButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  parcelaCard: {
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parcelaCardHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parcelaInfo: {
    flex: 1,
  },
  parcelaName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  parcelaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  parcelaMetaText: {
    fontSize: 12,
    color: Colors.gray,
  },
  metaDot: {
    color: Colors.gray,
  },
  stateBadge: {
    backgroundColor: Colors.light,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginHorizontal: Spacing.md,
  },
  stateBadgeActive: {
    backgroundColor: '#e8f5e9',
  },
  stateBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.darkGray,
  },
  parcelaActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.info,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    justifyContent: 'center',
  },
  mapPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  mapPickerContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    width: '80%',
    maxHeight: '85%',
    display: 'flex',
    flexDirection: 'column',
  },
  mapPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mapPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  mapDataInfo: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapDataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  useMapDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
});
