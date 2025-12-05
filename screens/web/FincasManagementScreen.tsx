import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import WebLayout from '@/components/web/WebLayout';
import PlanificacionMapPicker from '@/components/web/PlanificacionMapPicker';
import { apiClient } from '@/services/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

interface Finca {
  id: string;
  nombre: string;
  codigo_finca: string;
  direccion: string;
  ciudad: string;
  coordenadas_latitud: number;
  coordenadas_longitud: number;
  tamaño_hectareas: number;
  empresa: string;
}

interface Parcela {
  id: string;
  nombre: string;
  codigo_parcela: string;
  area_hectareas: number;
  estado_parcela: string;
  finca: string;
}

export default function FincasManagementScreen() {
  const user = useAuthStore((state) => state.user);

  // State for fincas
  const [fincas, setFincas] = useState<Finca[]>([]);
  const [selectedFinca, setSelectedFinca] = useState<Finca | null>(null);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);

  // State for forms
  const [showFincaForm, setShowFincaForm] = useState(false);
  const [showParcelaForm, setShowParcelaForm] = useState(false);
  const [showMapForFinca, setShowMapForFinca] = useState(false);
  const [showMapForParcela, setShowMapForParcela] = useState(false);
  const [isEditingFinca, setIsEditingFinca] = useState(false);

  // Form data
  const [fincaForm, setFincaForm] = useState({
    nombre: '',
    codigo_finca: '',
    direccion: '',
    ciudad: '',
    coordenadas_latitud: -0.3,
    coordenadas_longitud: -78.5,
    tamaño_hectareas: '',
  });

  const [parcelaForm, setParcelaForm] = useState({
    nombre: '',
    codigo_parcela: '',
    area_hectareas: '',
    estado_parcela: 'DISPONIBLE',
  });

  // Loading states
  const [loading, setLoading] = useState(false);

  // Initialize
  useEffect(() => {
    fetchFincas();
  }, []);

  const fetchFincas = async () => {
    try {
      console.log('📍 Cargando fincas...');
      const data: any = await apiClient.getFincas();
      setFincas((data as any).results || data || []);
      console.log('✅ Fincas cargadas:', data);
    } catch (err) {
      console.error('❌ Error cargando fincas:', err);
      Alert.alert('Error', 'No se pudieron cargar las fincas');
    }
  };

  const fetchParcelas = async (fincaId: string) => {
    try {
      console.log('📍 Cargando parcelas de finca:', fincaId);
      const data: any = await apiClient.getParcelasByFinca(fincaId);
      setParcelas(data || []);
      console.log('✅ Parcelas cargadas:', data);
    } catch (err) {
      console.error('❌ Error cargando parcelas:', err);
    }
  };

  const handleSelectFinca = (finca: Finca) => {
    setSelectedFinca(finca);
    resetParcelaForm();
    fetchParcelas(finca.id);
  };

  const saveFinca = async () => {
    if (!fincaForm.nombre || !fincaForm.codigo_finca || !fincaForm.tamaño_hectareas) {
      Alert.alert('Error', 'Complete los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...fincaForm,
        tamaño_hectareas: parseFloat(fincaForm.tamaño_hectareas),
        empresa: (user as any)?.empresa_id || '',
      };

      if (isEditingFinca && selectedFinca) {
        await apiClient.updateFinca(selectedFinca.id, data);
        Alert.alert('Éxito', 'Finca actualizada');
      } else {
        await apiClient.createFinca(data);
        Alert.alert('Éxito', 'Finca creada');
      }

      setShowFincaForm(false);
      resetFincaForm();
      fetchFincas();
    } catch (err: any) {
      console.error('Error guardando finca:', err);
      Alert.alert('Error', err?.response?.data?.detail || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const saveParcela = async () => {
    if (!parcelaForm.nombre || !parcelaForm.codigo_parcela || !selectedFinca) {
      Alert.alert('Error', 'Complete los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const data: any = {
        nombre: parcelaForm.nombre,
        codigo_parcela: parcelaForm.codigo_parcela,
        area_hectareas: parseFloat(parcelaForm.area_hectareas) || 0,
        estado_parcela: parcelaForm.estado_parcela,
        finca: selectedFinca.id,
      };

      await apiClient.createParcela(data);
      Alert.alert('Éxito', 'Parcela creada');

      setShowParcelaForm(false);
      resetParcelaForm();
      fetchParcelas(selectedFinca.id);
    } catch (err: any) {
      console.error('Error guardando parcela:', err);
      Alert.alert('Error', err?.response?.data?.detail || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const resetFincaForm = () => {
    setFincaForm({
      nombre: '',
      codigo_finca: '',
      direccion: '',
      ciudad: '',
      coordenadas_latitud: -0.3,
      coordenadas_longitud: -78.5,
      tamaño_hectareas: '',
    });
    setIsEditingFinca(false);
  };

  const resetParcelaForm = () => {
    setParcelaForm({
      nombre: '',
      codigo_parcela: '',
      area_hectareas: '',
      estado_parcela: 'DISPONIBLE',
    });
  };

  return (
    <WebLayout title="Gestión de Fincas" subtitle="Administra tus fincas y parcelas">
      <View style={styles.container}>
        {/* Left Panel - Fincas List */}
        <View style={styles.leftPanel}>
          <View style={styles.panelHeader}>
            <MaterialCommunityIcons name="home-city" size={24} color={Colors.primary} />
            <Text style={styles.panelTitle}>Mis Fincas</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetFincaForm();
              setShowFincaForm(true);
            }}
          >
            <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>Nueva Finca</Text>
          </TouchableOpacity>

          {loading && fincas.length === 0 ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.xl }} />
          ) : fincas.length === 0 ? (
            <Text style={styles.emptyText}>No hay fincas registradas</Text>
          ) : (
            <FlatList
              data={fincas}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item: finca }) => (
                <TouchableOpacity
                  style={[
                    styles.fincaItemCard,
                    selectedFinca?.id === finca.id && styles.fincaItemCardSelected,
                  ]}
                  onPress={() => handleSelectFinca(finca)}
                >
                  <View style={styles.fincaItemHeader}>
                    <Text style={styles.fincaItemName}>{finca.nombre}</Text>
                    <Text style={styles.fincaItemCode}>{finca.codigo_finca}</Text>
                  </View>
                  <Text style={styles.fincaItemText}>📍 {finca.ciudad}</Text>
                  <Text style={styles.fincaItemText}>📏 {finca.tamaño_hectareas} ha</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Right Panel - Details */}
        <View style={styles.rightPanel}>
          {selectedFinca ? (
            <ScrollView style={styles.detailsContainer}>
              {/* Finca Details */}
              <View style={styles.detailsSection}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsTitle}>{selectedFinca.nombre}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setFincaForm({
                        nombre: selectedFinca.nombre,
                        codigo_finca: selectedFinca.codigo_finca,
                        direccion: selectedFinca.direccion,
                        ciudad: selectedFinca.ciudad,
                        coordenadas_latitud: selectedFinca.coordenadas_latitud,
                        coordenadas_longitud: selectedFinca.coordenadas_longitud,
                        tamaño_hectareas: selectedFinca.tamaño_hectareas.toString(),
                      });
                      setIsEditingFinca(true);
                      setShowFincaForm(true);
                    }}
                  >
                    <MaterialCommunityIcons name="pencil" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Código</Text>
                    <Text style={styles.detailValue}>{selectedFinca.codigo_finca}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Ubicación</Text>
                    <Text style={styles.detailValue}>{selectedFinca.ciudad}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Tamaño</Text>
                    <Text style={styles.detailValue}>{selectedFinca.tamaño_hectareas} ha</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Coordenadas</Text>
                    <Text style={styles.detailValue}>
                      {selectedFinca.coordenadas_latitud.toFixed(4)}, {selectedFinca.coordenadas_longitud.toFixed(4)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Parcelas Section */}
              <View style={styles.parcelasSection}>
                <View style={styles.parcelasHeader}>
                  <Text style={styles.parcelasTitle}>Parcelas ({parcelas.length})</Text>
                  <TouchableOpacity
                    style={styles.addParcelaButton}
                    onPress={() => {
                      resetParcelaForm();
                      setShowParcelaForm(true);
                    }}
                  >
                    <MaterialCommunityIcons name="plus" size={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>

                {parcelas.length === 0 ? (
                  <Text style={styles.emptyText}>No hay parcelas en esta finca</Text>
                ) : (
                  <FlatList
                    data={parcelas}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item: parcela }) => (
                      <View style={styles.parcelaCard}>
                        <View style={styles.parcelaCardHeader}>
                          <View>
                            <Text style={styles.parcelaName}>{parcela.nombre}</Text>
                            <Text style={styles.parcelaCode}>{parcela.codigo_parcela}</Text>
                          </View>
                          <View
                            style={[
                              styles.estadoBadge,
                              {
                                backgroundColor:
                                  parcela.estado_parcela === 'DISPONIBLE'
                                    ? Colors.success + '20'
                                    : Colors.warning + '20',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.estadoText,
                                {
                                  color:
                                    parcela.estado_parcela === 'DISPONIBLE'
                                      ? Colors.success
                                      : Colors.warning,
                                },
                              ]}
                            >
                              {parcela.estado_parcela}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.parcelaArea}>📏 {parcela.area_hectareas} ha</Text>
                      </View>
                    )}
                  />
                )}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="map-outline" size={64} color={Colors.light} />
              <Text style={styles.emptyStateText}>Selecciona una finca para ver los detalles</Text>
            </View>
          )}
        </View>
      </View>

      {/* Finca Form Modal */}
      <Modal visible={showFincaForm} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditingFinca ? 'Editar Finca' : 'Nueva Finca'}
              </Text>
              <TouchableOpacity onPress={() => setShowFincaForm(false)}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre de la Finca *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Finca San José"
                  value={fincaForm.nombre}
                  onChangeText={(text) => setFincaForm({ ...fincaForm, nombre: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Código de Finca *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: FSJ001"
                  value={fincaForm.codigo_finca}
                  onChangeText={(text) => setFincaForm({ ...fincaForm, codigo_finca: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Dirección completa"
                  value={fincaForm.direccion}
                  onChangeText={(text) => setFincaForm({ ...fincaForm, direccion: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ciudad"
                  value={fincaForm.ciudad}
                  onChangeText={(text) => setFincaForm({ ...fincaForm, ciudad: text })}
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Latitud</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="-0.3"
                    keyboardType="decimal-pad"
                    value={fincaForm.coordenadas_latitud.toString()}
                    onChangeText={(text) =>
                      setFincaForm({
                        ...fincaForm,
                        coordenadas_latitud: parseFloat(text) || -0.3,
                      })
                    }
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Longitud</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="-78.5"
                    keyboardType="decimal-pad"
                    value={fincaForm.coordenadas_longitud.toString()}
                    onChangeText={(text) =>
                      setFincaForm({
                        ...fincaForm,
                        coordenadas_longitud: parseFloat(text) || -78.5,
                      })
                    }
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tamaño en Hectáreas *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 150.50"
                  keyboardType="decimal-pad"
                  value={fincaForm.tamaño_hectareas}
                  onChangeText={(text) => setFincaForm({ ...fincaForm, tamaño_hectareas: text })}
                />
              </View>

              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => setShowMapForFinca(true)}
              >
                <MaterialCommunityIcons name="map" size={20} color={Colors.white} />
                <Text style={styles.mapButtonText}>Seleccionar en Mapa</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setShowFincaForm(false)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSubmit]}
                onPress={saveFinca}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Parcela Form Modal */}
      <Modal visible={showParcelaForm} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Parcela</Text>
              <TouchableOpacity onPress={() => setShowParcelaForm(false)}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre de la Parcela *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Parcela A"
                  value={parcelaForm.nombre}
                  onChangeText={(text) => setParcelaForm({ ...parcelaForm, nombre: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Código de Parcela *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: PA001"
                  value={parcelaForm.codigo_parcela}
                  onChangeText={(text) => setParcelaForm({ ...parcelaForm, codigo_parcela: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Estado</Text>
                <View style={styles.estadoButtons}>
                  {['DISPONIBLE', 'OCUPADA', 'EN_MANTENIMIENTO'].map((estado) => (
                    <TouchableOpacity
                      key={estado}
                      style={[
                        styles.estadoButton,
                        parcelaForm.estado_parcela === estado && styles.estadoButtonActive,
                      ]}
                      onPress={() => setParcelaForm({ ...parcelaForm, estado_parcela: estado })}
                    >
                      <Text
                        style={[
                          styles.estadoButtonText,
                          parcelaForm.estado_parcela === estado && styles.estadoButtonTextActive,
                        ]}
                      >
                        {estado}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Área en Hectáreas</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 25.5"
                  keyboardType="decimal-pad"
                  value={parcelaForm.area_hectareas}
                  onChangeText={(text) => setParcelaForm({ ...parcelaForm, area_hectareas: text })}
                />
              </View>

              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => setShowMapForParcela(true)}
              >
                <MaterialCommunityIcons name="map" size={20} color={Colors.white} />
                <Text style={styles.mapButtonText}>Dibujar Límites en Mapa</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setShowParcelaForm(false)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSubmit]}
                onPress={saveParcela}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Map Modal for Finca */}
      <Modal visible={showMapForFinca} animationType="fade" transparent={true}>
        <View style={styles.mapFullModal}>
          <View style={styles.mapFullModalHeader}>
            <Text style={styles.mapFullModalTitle}>Seleccionar Ubicación de Finca</Text>
            <TouchableOpacity onPress={() => setShowMapForFinca(false)}>
              <MaterialCommunityIcons name="close" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.mapFullModalBody}>
            <PlanificacionMapPicker
              onSelectArea={(geojson) => {
                if (geojson && geojson.properties) {
                  setFincaForm({
                    ...fincaForm,
                    coordenadas_latitud: geojson.properties.center[0],
                    coordenadas_longitud: geojson.properties.center[1],
                  });
                }
                setShowMapForFinca(false);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Map Modal for Parcela */}
      <Modal visible={showMapForParcela} animationType="fade" transparent={true}>
        <View style={styles.mapFullModal}>
          <View style={styles.mapFullModalHeader}>
            <Text style={styles.mapFullModalTitle}>Dibujar Límites de Parcela</Text>
            <TouchableOpacity onPress={() => setShowMapForParcela(false)}>
              <MaterialCommunityIcons name="close" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.mapFullModalBody}>
            <PlanificacionMapPicker
              onSelectArea={(geojson) => {
                if (geojson) {
                  console.log('✅ Polígono dibujado:', geojson);
                }
                setShowMapForParcela(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.white,
  },
  leftPanel: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: Colors.light,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: Spacing.md,
    color: Colors.dark,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  addButtonText: {
    marginLeft: Spacing.sm,
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  fincaItemCard: {
    backgroundColor: Colors.light,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  fincaItemCardSelected: {
    backgroundColor: Colors.primary + '15',
    borderLeftColor: Colors.primary,
  },
  fincaItemHeader: {
    marginBottom: Spacing.sm,
  },
  fincaItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark,
  },
  fincaItemCode: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  fincaItemText: {
    fontSize: 13,
    color: Colors.dark,
    marginBottom: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.gray,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: Spacing.xl,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  detailsContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  detailsSection: {
    marginBottom: Spacing.xl,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.light,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark,
  },
  parcelasSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
  },
  parcelasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  parcelasTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
  },
  addParcelaButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  parcelaCard: {
    backgroundColor: Colors.light,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  parcelaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  parcelaName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark,
  },
  parcelaCode: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  parcelaArea: {
    fontSize: 13,
    color: Colors.dark,
  },
  estadoBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 600,
    maxHeight: '90%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    color: Colors.dark,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.dark,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  formGroupHalf: {
    flex: 1,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  mapButtonText: {
    marginLeft: Spacing.sm,
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  estadoButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  estadoButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.light,
    backgroundColor: Colors.white,
  },
  estadoButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  estadoButtonText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark,
  },
  estadoButtonTextActive: {
    color: Colors.white,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: Colors.light,
  },
  buttonSubmit: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
  },
  mapFullModal: {
    flex: 1,
    backgroundColor: Colors.white,
    flexDirection: 'column',
  },
  mapFullModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
  },
  mapFullModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  mapFullModalBody: {
    flex: 1,
    backgroundColor: Colors.light,
  },
});
