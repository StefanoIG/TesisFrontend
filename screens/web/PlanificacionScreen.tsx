import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import WebLayout from '@/components/web/WebLayout';
import SoilStudyUpload from '@/components/web/SoilStudyUpload';
import PlanificacionMapPicker from '@/components/web/PlanificacionMapPicker';
import { apiClient } from '@/services/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';

export default function PlanificacionScreen() {
  const [granjas, setGranjas] = useState<any[]>([]);
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [selectedGranja, setSelectedGranja] = useState<any | null>(null);
  const [selectedParcelas, setSelectedParcelas] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [areaGeo, setAreaGeo] = useState<any | null>(null);

  useEffect(() => { fetchGranjas(); }, []);

  const fetchGranjas = async () => {
    try {
      const data: any = await apiClient.getGranjas();
      setGranjas(data.results || data || []);
    } catch (err) {
      console.error('Error fetching granjas', err);
    }
  };

  const fetchParcelas = async (granjaId: number) => {
    setLoading(true);
    try {
      const data: any = await apiClient.getParcelasByGranja(granjaId);
      setParcelas(data.results || data || []);
    } catch (err) {
      console.error('Error fetching parcelas', err);
    } finally { setLoading(false); }
  };

  const toggleParcela = (id: number) => {
    setSelectedParcelas((p) => ({ ...p, [id]: !p[id] }));
  };

  const handleGeneratePlan = async () => {
    const selectedIds = Object.keys(selectedParcelas).filter((k) => selectedParcelas[k]);
    if (!selectedGranja) return alert('Seleccione una granja');
    setLoading(true);
    try {
      const payload = {
        granja: selectedGranja.id,
        parcelas: selectedIds,
        area: areaGeo,
      };
      // backend auto: recomendar_cultivos or generar plan
      await apiClient.recomendarCultivos(payload);
      alert('Solicitud enviada. Revisa resultados en el API.');
    } catch (err) {
      console.error('Error generando plan', err);
      alert('Error generando plan');
    } finally { setLoading(false); }
  };

  return (
    <WebLayout title="Planificación" subtitle="Sube estudios, selecciona parcela y genera planes automáticos">
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1) Subir estudio de suelo</Text>
          <SoilStudyUpload onSuccess={() => alert('Estudio recibido')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2) Seleccionar granja y zona</Text>
          <View style={styles.row}>
            <View style={styles.columnLeft}>
              <Text style={styles.label}>Granja</Text>
              {granjas.length === 0 ? (
                <Text>No hay granjas disponibles</Text>
              ) : (
                <FlatList
                  data={granjas}
                  keyExtractor={(i) => i.id?.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.granjaItem, selectedGranja?.id === item.id && styles.selectedItem]} onPress={() => { setSelectedGranja(item); fetchParcelas(item.id); }}>
                      <Text>{item.nombre || item.nombre_granja || `Granja #${item.id}`}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>

            <View style={styles.columnRight}>
              <PlanificacionMapPicker onSelectArea={(g) => setAreaGeo(g)} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3) Seleccionar parcelas</Text>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            <FlatList
              data={parcelas}
              keyExtractor={(i) => i.id?.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.parcelaItem} onPress={() => toggleParcela(item.id)}>
                  <Text>{item.nombre || `Parcela ${item.id}`}</Text>
                  <Text>{selectedParcelas[item.id] ? '✓' : ''}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <View style={{ marginTop: Spacing.md }}>
          <TouchableOpacity style={styles.generateBtn} onPress={handleGeneratePlan}>
            <Text style={{ color: Colors.white }}>Generar plan automático</Text>
          </TouchableOpacity>
        </View>
      </View>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.md },
  columnLeft: { flex: 1, maxWidth: 320 },
  columnRight: { flex: 2 },
  granjaItem: { padding: Spacing.sm, borderRadius: BorderRadius.sm || 6, backgroundColor: Colors.white, marginBottom: Spacing.sm },
  selectedItem: { borderColor: Colors.primary, borderWidth: 2 },
  label: { marginBottom: Spacing.xs },
  parcelaItem: { padding: Spacing.sm, backgroundColor: Colors.white, marginBottom: Spacing.xs, flexDirection: 'row', justifyContent: 'space-between' },
  generateBtn: { backgroundColor: Colors.primary, padding: 12, borderRadius: BorderRadius.md, alignItems: 'center' }
});
