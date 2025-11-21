import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme-new';
import WebLayout from '@/components/web/WebLayout';
import { apiClient } from '@/services/api';

export default function ReportsScreen() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingReportId, setGeneratingReportId] = useState<string | null>(null);

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      setLoading(true);
      const data: any = await apiClient.getReportes();
      setReportes(data.results || data);
    } catch (error) {
      console.error('Error fetching reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (tipoReporte: string, formato: string = 'PDF') => {
    try {
      setGeneratingReportId(tipoReporte);
      const fechaActual = new Date();
      const fechaInicio = new Date(fechaActual);
      fechaInicio.setMonth(fechaInicio.getMonth() - 1); // Último mes

      await apiClient.createReporte({
        tipo_reporte: tipoReporte,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaActual.toISOString().split('T')[0],
        formato: formato,
        incluir_graficos: true,
      });

      alert(`Reporte ${tipoReporte} generado exitosamente`);
      fetchReportes();
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      setGeneratingReportId(null);
    }
  };
  const reportCategories = [
    {
      id: 'trazabilidad',
      title: 'Reportes de Trazabilidad',
      icon: 'map-marker-path',
      color: Colors.info,
      tipo_reporte: 'TRAZABILIDAD',
      description: 'Reportes completos de trazabilidad de productos y lotes',
    },
    {
      id: 'calidad',
      title: 'Reportes de Calidad',
      icon: 'certificate',
      color: Colors.primary,
      tipo_reporte: 'CALIDAD',
      description: 'Inspecciones, análisis de laboratorio y certificaciones',
    },
    {
      id: 'logistica',
      title: 'Reportes de Logística',
      icon: 'truck',
      color: Colors.warning,
      tipo_reporte: 'LOGISTICA',
      description: 'Envíos, entregas y tiempos de tránsito',
    },
    {
      id: 'kpi',
      title: 'Reportes de KPIs',
      icon: 'chart-line',
      color: Colors.success,
      tipo_reporte: 'KPI',
      description: 'Indicadores clave de desempeño y métricas',
    },
  ];

  const handleDownloadReport = (reportId: string) => {
    console.log('Descargar reporte:', reportId);
    // TODO: Implementar descarga de reporte
  };

  return (
    <WebLayout title="Reportes" subtitle="Genera y descarga reportes personalizados de tu operación">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando reportes...</Text>
          </View>
        )}

        {/* Reportes Recientes */}
        {reportes.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Reportes Generados Recientemente</Text>
            {reportes.slice(0, 5).map((reporte) => (
              <View key={reporte.id} style={styles.reportCard}>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportName}>{reporte.tipo_reporte}</Text>
                  <Text style={styles.reportDescription}>
                    Generado el {new Date(reporte.creado_en).toLocaleDateString('es-ES')}
                  </Text>
                  <Text style={styles.reportDescription}>
                    Formato: {reporte.formato_exportacion || 'PDF'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, styles.downloadButton]}
                  onPress={() => handleDownloadReport(reporte.id)}
                >
                  <MaterialCommunityIcons name="download" size={18} color={Colors.white} />
                  <Text style={[styles.actionButtonText, { color: Colors.white }]}>Descargar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Categorías de Reportes */}
        {reportCategories.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                <MaterialCommunityIcons name={category.icon as any} size={24} color={category.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
            </View>

            <View style={styles.reportActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.previewButton]}
                disabled={generatingReportId === category.tipo_reporte}
                onPress={() => handleGenerateReport(category.tipo_reporte, 'PDF')}
              >
                {generatingReportId === category.tipo_reporte ? (
                  <ActivityIndicator size="small" color={Colors.info} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="file-pdf-box" size={18} color={Colors.info} />
                    <Text style={[styles.actionButtonText, { color: Colors.info }]}>Generar PDF</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.downloadButton]}
                disabled={generatingReportId === category.tipo_reporte}
                onPress={() => handleGenerateReport(category.tipo_reporte, 'EXCEL')}
              >
                {generatingReportId === category.tipo_reporte ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="file-excel" size={18} color={Colors.white} />
                    <Text style={[styles.actionButtonText, { color: Colors.white }]}>Generar Excel</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            Los reportes se generan con datos del último mes. Puedes descargar reportes anteriores desde
            la sección de "Reportes Generados Recientemente".
          </Text>
        </View>
      </ScrollView>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 32,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray,
  },
  recentSection: {
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 16,
  },
  categorySection: {
    marginTop: 24,
    paddingHorizontal: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
  },
  categoryDescription: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 2,
  },
  reportsList: {
    gap: 10,
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 10,
  },
  reportInfo: {
    flex: 1,
    marginRight: 16,
  },
  reportName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 3,
  },
  reportDescription: {
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 18,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 5,
  },
  previewButton: {
    backgroundColor: Colors.info + '15',
    borderWidth: 1,
    borderColor: Colors.info + '40',
  },
  downloadButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '10',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 32,
    marginTop: 24,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark,
    lineHeight: 19,
  },
});
