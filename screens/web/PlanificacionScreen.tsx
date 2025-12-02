import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import WebLayout from '@/components/web/WebLayout';
import SoilStudyUpload from '@/components/web/SoilStudyUpload';
import PlanificacionMapPicker from '@/components/web/PlanificacionMapPicker';
import { apiClient } from '@/services/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PlanificacionScreen() {
  // State para fincas y parcelas
  const [fincas, setFincas] = useState<any[]>([]);
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [selectedFinca, setSelectedFinca] = useState<any | null>(null);
  const [selectedParcelas, setSelectedParcelas] = useState<string[]>([]);
  
  // State para formulario
  const [cultivoPreferido, setCultivoPreferido] = useState('');
  const [prioridad, setPrioridad] = useState<'rentabilidad' | 'facilidad' | 'mercado'>('rentabilidad');
  const [areaGeo, setAreaGeo] = useState<any | null>(null);
  
  // State para recomendaciones
  const [recomendaciones, setRecomendaciones] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => { fetchFincas(); }, []);

  const fetchFincas = async () => {
    try {
      const data: any = await apiClient.getFincas();
      setFincas(data.results || data || []);
    } catch (err) {
      console.error('Error fetching fincas', err);
      alert('Error al cargar fincas: ' + err);
    }
  };

  const fetchParcelas = async (fincaId: string) => {
    setLoading(true);
    try {
      const data: any = await apiClient.getParcelasByFinca(fincaId);
      setParcelas(data || []);
    } catch (err) {
      console.error('Error fetching parcelas', err);
      alert('Error al cargar parcelas');
    } finally { 
      setLoading(false); 
    }
  };

  const toggleParcela = (id: string) => {
    setSelectedParcelas((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      return [...prev, id];
    });
  };

  const handleGenerateRecommendations = async () => {
    if (selectedParcelas.length === 0) {
      alert('Seleccione al menos una parcela');
      return;
    }

    setLoading(true);
    setShowResults(false);
    
    try {
      const payload: any = {
        parcela_ids: selectedParcelas,
        prioridad,
        cultivo_preferido: cultivoPreferido || undefined,
        area_geografica: areaGeo,
      };

      const result = await apiClient.recomendarCultivos(payload);
      setRecomendaciones(result);
      setShowResults(true);
    } catch (err) {
      console.error('Error generando recomendaciones', err);
      alert('Error al generar recomendaciones: ' + (err as any)?.response?.data?.error || err);
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreatePlan = async (cultivo: any) => {
    if (selectedParcelas.length === 0) {
      alert('Debe seleccionar una parcela');
      return;
    }

    const parcelaId = selectedParcelas[0]; // Usar la primera parcela seleccionada
    
    setLoading(true);
    try {
      const planData = {
        parcela_id: parcelaId,
        cultivo_id: cultivo.id,
        fecha_inicio: new Date().toISOString().split('T')[0],
        variedad: cultivo.variedad || '',
      };

      await apiClient.createPlanAutomatico(planData);
      alert(`Plan de cultivo creado para ${cultivo.nombre_comun}`);
      setShowResults(false);
      setRecomendaciones(null);
    } catch (err) {
      console.error('Error creando plan', err);
      alert('Error al crear plan: ' + (err as any)?.response?.data?.error || err);
    } finally {
      setLoading(false);
    }
  };

  const renderRecomendacion = ({ item }: any) => (
    <View style={styles.recomendacionCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cultivoNombre}>{item.cultivo.nombre_comun}</Text>
          <Text style={styles.cultivoCientifico}>{item.cultivo.nombre_cientifico}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{item.score_compatibilidad}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        {item.zona_recomendada && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={Colors.primary} />
            <Text style={styles.infoText}>Zona: {item.zona_recomendada}</Text>
          </View>
        )}

        <View style={styles.razonesContainer}>
          {item.razones.map((razon: string, idx: number) => (
            <View key={idx} style={styles.razonItem}>
              <MaterialCommunityIcons name="check-circle" size={14} color={Colors.success} />
              <Text style={styles.razonText}>{razon}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cultivoStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Días cosecha</Text>
            <Text style={styles.statValue}>{item.cultivo.dias_hasta_cosecha || 'N/A'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Dificultad</Text>
            <Text style={styles.statValue}>{item.cultivo.nivel_dificultad || 'N/A'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Demanda</Text>
            <Text style={styles.statValue}>{item.cultivo.demanda_mercado || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.createPlanButton} 
        onPress={() => handleCreatePlan(item.cultivo)}
        disabled={loading}
      >
        <MaterialCommunityIcons name="plus-circle" size={18} color={Colors.white} />
        <Text style={styles.createPlanText}>Crear plan con este cultivo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <WebLayout title="Planificación Agrícola" subtitle="Sistema inteligente de recomendación de cultivos">
      <ScrollView style={styles.container}>
        {/* Sección 1: Estudio de Suelo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="file-document" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>1. Estudio de Suelo (Opcional)</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Sube un PDF con el estudio de suelo para obtener recomendaciones más precisas
          </Text>
          <SoilStudyUpload 
            fincaId={selectedFinca?.id} 
            parcelaId={selectedParcelas[0]}
            onSuccess={() => alert('Estudio guardado. Ahora puedes generar recomendaciones.')} 
          />
        </View>

        {/* Sección 2: Selección de Finca y Parcelas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="map" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>2. Seleccionar Finca y Parcelas</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.columnLeft}>
              <Text style={styles.label}>Finca</Text>
              {fincas.length === 0 ? (
                <Text style={styles.emptyText}>No hay fincas disponibles</Text>
              ) : (
                <View style={styles.fincasList}>
                  {fincas.map((finca) => (
                    <TouchableOpacity
                      key={finca.id}
                      style={[styles.fincaItem, selectedFinca?.id === finca.id && styles.selectedItem]}
                      onPress={() => {
                        setSelectedFinca(finca);
                        setSelectedParcelas([]);
                        fetchParcelas(finca.id);
                      }}
                    >
                      <MaterialCommunityIcons 
                        name="barn" 
                        size={20} 
                        color={selectedFinca?.id === finca.id ? Colors.white : Colors.primary} 
                      />
                      <Text style={[styles.fincaText, selectedFinca?.id === finca.id && styles.selectedText]}>
                        {finca.nombre || `Finca #${finca.id}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {selectedFinca && (
                <View style={{ marginTop: Spacing.md }}>
                  <Text style={styles.label}>Parcelas Disponibles</Text>
                  {loading ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : parcelas.length === 0 ? (
                    <Text style={styles.emptyText}>No hay parcelas en esta finca</Text>
                  ) : (
                    <View>
                      {parcelas.map((parcela) => (
                        <TouchableOpacity
                          key={parcela.id}
                          style={styles.parcelaItem}
                          onPress={() => toggleParcela(parcela.id)}
                        >
                          <View>
                            <Text style={styles.parcelaName}>{parcela.nombre}</Text>
                            <Text style={styles.parcelaArea}>{parcela.area_hectareas} ha</Text>
                          </View>
                          <View style={styles.checkbox}>
                            {selectedParcelas.includes(parcela.id) && (
                              <MaterialCommunityIcons name="check" size={18} color={Colors.primary} />
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={styles.columnRight}>
              <Text style={styles.label}>Visualizar Zona (Opcional)</Text>
              <PlanificacionMapPicker onSelectArea={(g) => setAreaGeo(g)} />
            </View>
          </View>
        </View>

        {/* Sección 3: Preferencias */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="tune" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>3. Preferencias de Cultivo</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>¿Qué cultivo prefiere? (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Rosas, Cacao, Banano..."
              value={cultivoPreferido}
              onChangeText={setCultivoPreferido}
            />
            <Text style={styles.hint}>
              Si tiene un cultivo en mente, el sistema lo priorizará en las recomendaciones
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.prioridadButtons}>
              {[
                { value: 'rentabilidad', label: 'Rentabilidad', icon: 'currency-usd' },
                { value: 'facilidad', label: 'Facilidad', icon: 'hand-heart' },
                { value: 'mercado', label: 'Demanda', icon: 'cart' },
              ].map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.prioridadButton, prioridad === p.value && styles.prioridadButtonActive]}
                  onPress={() => setPrioridad(p.value as any)}
                >
                  <MaterialCommunityIcons 
                    name={p.icon as any} 
                    size={20} 
                    color={prioridad === p.value ? Colors.white : Colors.primary} 
                  />
                  <Text style={[styles.prioridadText, prioridad === p.value && styles.prioridadTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Botón para generar recomendaciones */}
        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={handleGenerateRecommendations}
          disabled={loading || selectedParcelas.length === 0}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons name="lightbulb-on" size={20} color={Colors.white} />
              <Text style={styles.generateButtonText}>Generar Recomendaciones</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Resultados */}
        {showResults && recomendaciones && (
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="chart-line" size={24} color={Colors.success} />
              <Text style={styles.sectionTitle}>Recomendaciones de Cultivos</Text>
            </View>

            {recomendaciones.tiene_estudios_suelo ? (
              <View style={styles.infoBox}>
                <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={styles.infoBoxText}>
                  Recomendaciones basadas en análisis de suelo
                </Text>
              </View>
            ) : (
              <View style={[styles.infoBox, { backgroundColor: Colors.warning + '20' }]}>
                <MaterialCommunityIcons name="alert" size={20} color={Colors.warning} />
                <Text style={styles.infoBoxText}>
                  Sin estudio de suelo. Recomendaciones basadas en {prioridad}
                </Text>
              </View>
            )}

            {recomendaciones.cultivo_preferido && (
              <View style={[styles.infoBox, { backgroundColor: Colors.info + '20' }]}>
                <MaterialCommunityIcons name="star" size={20} color={Colors.info} />
                <Text style={styles.infoBoxText}>
                  Priorizando: {recomendaciones.cultivo_preferido.nombre_comun}
                </Text>
              </View>
            )}

            <FlatList
              data={recomendaciones.recomendaciones}
              renderItem={renderRecomendacion}
              keyExtractor={(item, idx) => `${item.cultivo.id}-${idx}`}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl },
  section: { marginBottom: Spacing.xl, backgroundColor: Colors.white, padding: Spacing.lg, borderRadius: BorderRadius.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginLeft: Spacing.sm, color: Colors.dark },
  sectionDescription: { fontSize: 14, color: Colors.gray, marginBottom: Spacing.md },
  
  row: { flexDirection: 'row', gap: Spacing.lg },
  columnLeft: { flex: 1 },
  columnRight: { flex: 1 },
  
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm, color: Colors.dark },
  emptyText: { fontSize: 14, color: Colors.gray, fontStyle: 'italic' },
  hint: { fontSize: 12, color: Colors.gray, marginTop: Spacing.xs },
  
  fincasList: { gap: Spacing.sm },
  fincaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedItem: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  fincaText: { marginLeft: Spacing.sm, fontSize: 14, fontWeight: '500', color: Colors.dark },
  selectedText: { color: Colors.white },
  
  parcelaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.light,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.sm || 6,
  },
  parcelaName: { fontSize: 14, fontWeight: '500', color: Colors.dark },
  parcelaArea: { fontSize: 12, color: Colors.gray },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  formGroup: { marginBottom: Spacing.md },
  input: {
    borderWidth: 1,
    borderColor: Colors.border || Colors.lightGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 14,
    backgroundColor: Colors.white,
  },
  
  prioridadButtons: { flexDirection: 'row', gap: Spacing.sm },
  prioridadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  prioridadButtonActive: {
    backgroundColor: Colors.primary,
  },
  prioridadText: { marginLeft: Spacing.xs, fontSize: 14, fontWeight: '500', color: Colors.primary },
  prioridadTextActive: { color: Colors.white },
  
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  generateButtonDisabled: { opacity: 0.5 },
  generateButtonText: { marginLeft: Spacing.sm, color: Colors.white, fontSize: 16, fontWeight: '600' },
  
  resultsSection: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
  },
  
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.sm || 6,
    marginBottom: Spacing.md,
  },
  infoBoxText: { marginLeft: Spacing.sm, fontSize: 13, flex: 1 },
  
  recomendacionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cultivoNombre: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  cultivoCientifico: { fontSize: 13, fontStyle: 'italic', color: Colors.gray },
  scoreContainer: { alignItems: 'center' },
  scoreLabel: { fontSize: 11, color: Colors.gray },
  scoreValue: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  
  cardBody: { marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  infoText: { marginLeft: Spacing.xs, fontSize: 13, color: Colors.dark },
  
  razonesContainer: { marginTop: Spacing.sm },
  razonItem: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  razonText: { marginLeft: Spacing.xs, fontSize: 13, color: Colors.dark },
  
  cultivoStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.lightGray },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 11, color: Colors.gray },
  statValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  
  createPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  createPlanText: { marginLeft: Spacing.xs, color: Colors.white, fontWeight: '600' },
});
