import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Switch } from 'react-native';
import WebLayout from '@/components/web/WebLayout';
import { apiClient } from '@/services/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdministracionScreen() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'logs' | 'backups'>('config');

  // Logs
  const [logsAcceso, setLogsAcceso] = useState<any[]>([]);
  const [logsActividad, setLogsActividad] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'config') {
      fetchConfig();
    } else if (activeTab === 'logs') {
      fetchLogs();
    } else if (activeTab === 'backups') {
      fetchBackups();
    }
  }, [activeTab]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getConfiguracionSistema();
      setConfig(data);
    } catch (err) {
      console.error('Error fetching config', err);
      alert('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [acceso, actividad] = await Promise.all([
        apiClient.getLogsAcceso({ page_size: 50 }),
        apiClient.getLogsActividad({ page_size: 50 }),
      ]);
      setLogsAcceso((acceso as any).results || acceso || []);
      setLogsActividad((actividad as any).results || actividad || []);
    } catch (err) {
      console.error('Error fetching logs', err);
      alert('Error al cargar logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const data: any = await apiClient.getBackups();
      setBackups(data.results || data || []);
    } catch (err) {
      console.error('Error fetching backups', err);
      alert('Error al cargar backups');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      await apiClient.updateConfiguracionSistema(config);
      alert('Configuración guardada exitosamente');
    } catch (err) {
      console.error('Error saving config', err);
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const renderConfigTab = () => {
    if (!config) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando configuración...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.configContainer}>
        {/* Sincronización */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sincronización y Notificaciones</Text>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Intervalo Sincronización (min):</Text>
            <TextInput
              style={styles.configInput}
              keyboardType="numeric"
              value={String(config.intervalo_sincronizacion_minutos || '')}
              onChangeText={(val) =>
                setConfig({ ...config, intervalo_sincronizacion_minutos: parseInt(val) || 30 })
              }
            />
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Intervalo Notificaciones (min):</Text>
            <TextInput
              style={styles.configInput}
              keyboardType="numeric"
              value={String(config.intervalo_notificaciones_minutos || '')}
              onChangeText={(val) =>
                setConfig({ ...config, intervalo_notificaciones_minutos: parseInt(val) || 5 })
              }
            />
          </View>
        </View>

        {/* Almacenamiento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Almacenamiento de Documentos</Text>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Tamaño Máximo Documento (MB):</Text>
            <TextInput
              style={styles.configInput}
              keyboardType="numeric"
              value={String(config.tamaño_maximo_documento_mb || '')}
              onChangeText={(val) =>
                setConfig({ ...config, tamaño_maximo_documento_mb: parseInt(val) || 50 })
              }
            />
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Días Retención Documentos:</Text>
            <TextInput
              style={styles.configInput}
              keyboardType="numeric"
              value={String(config.dias_retencion_documentos || '')}
              onChangeText={(val) =>
                setConfig({ ...config, dias_retencion_documentos: parseInt(val) || 2555 })
              }
            />
          </View>
        </View>

        {/* Seguridad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seguridad</Text>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Intentos Fallidos Máximos:</Text>
            <TextInput
              style={styles.configInput}
              keyboardType="numeric"
              value={String(config.intentos_fallidos_max || '')}
              onChangeText={(val) =>
                setConfig({ ...config, intentos_fallidos_max: parseInt(val) || 5 })
              }
            />
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Bloqueo (min):</Text>
            <TextInput
              style={styles.configInput}
              keyboardType="numeric"
              value={String(config.bloqueo_minutos || '')}
              onChangeText={(val) =>
                setConfig({ ...config, bloqueo_minutos: parseInt(val) || 15 })
              }
            />
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Duración Sesión (horas):</Text>
            <TextInput
              style={styles.configInput}
              keyboardType="numeric"
              value={String(config.sesion_duracion_horas || '')}
              onChangeText={(val) =>
                setConfig({ ...config, sesion_duracion_horas: parseInt(val) || 8 })
              }
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.5 }]}
          onPress={handleSaveConfig}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons name="content-save" size={20} color={Colors.white} />
              <Text style={styles.saveButtonText}>Guardar Configuración</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderLogsTab = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando logs...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.logsContainer}>
        {/* Logs de Acceso */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="login" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Logs de Acceso</Text>
          </View>
          {logsAcceso.length === 0 ? (
            <Text style={styles.emptyText}>No hay logs de acceso</Text>
          ) : (
            logsAcceso.slice(0, 20).map((log, idx) => (
              <View key={log.id || idx} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text style={styles.logUser}>{log.usuario?.username || 'Usuario desconocido'}</Text>
                  <View
                    style={[
                      styles.logBadge,
                      {
                        backgroundColor:
                          log.tipo_acceso === 'EXITOSO'
                            ? Colors.success + '20'
                            : Colors.danger + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.logBadgeText,
                        {
                          color: log.tipo_acceso === 'EXITOSO' ? Colors.success : Colors.danger,
                        },
                      ]}
                    >
                      {log.tipo_acceso}
                    </Text>
                  </View>
                </View>
                <Text style={styles.logDetail}>IP: {log.ip_origen}</Text>
                <Text style={styles.logDetail}>
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                </Text>
                {log.motivo_fallo && <Text style={styles.logDetail}>Motivo: {log.motivo_fallo}</Text>}
              </View>
            ))
          )}
        </View>

        {/* Logs de Actividad */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="history" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Logs de Actividad</Text>
          </View>
          {logsActividad.length === 0 ? (
            <Text style={styles.emptyText}>No hay logs de actividad</Text>
          ) : (
            logsActividad.slice(0, 20).map((log, idx) => (
              <View key={log.id || idx} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text style={styles.logUser}>{log.usuario?.username || 'Sistema'}</Text>
                  <Text style={styles.logAction}>{log.accion}</Text>
                </View>
                <Text style={styles.logDetail}>Entidad: {log.entidad_afectada || 'N/A'}</Text>
                <Text style={styles.logDetail}>ID: {log.entidad_id || 'N/A'}</Text>
                <Text style={styles.logDetail}>
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                </Text>
                {log.descripcion && <Text style={styles.logDetail}>Descripción: {log.descripcion}</Text>}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    );
  };

  const renderBackupsTab = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando backups...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.backupsContainer}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="database" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Backups del Sistema</Text>
          </View>
          {backups.length === 0 ? (
            <Text style={styles.emptyText}>No hay backups registrados</Text>
          ) : (
            backups.map((backup, idx) => (
              <View key={backup.id || idx} style={styles.backupCard}>
                <View style={styles.backupHeader}>
                  <Text style={styles.backupName}>{backup.nombre_archivo || 'Backup'}</Text>
                  <View
                    style={[
                      styles.logBadge,
                      {
                        backgroundColor:
                          backup.estado === 'COMPLETADO'
                            ? Colors.success + '20'
                            : backup.estado === 'FALLIDO'
                            ? Colors.danger + '20'
                            : Colors.warning + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.logBadgeText,
                        {
                          color:
                            backup.estado === 'COMPLETADO'
                              ? Colors.success
                              : backup.estado === 'FALLIDO'
                              ? Colors.danger
                              : Colors.warning,
                        },
                      ]}
                    >
                      {backup.estado}
                    </Text>
                  </View>
                </View>
                <Text style={styles.backupDetail}>Tipo: {backup.tipo_backup || 'N/A'}</Text>
                <Text style={styles.backupDetail}>
                  Tamaño: {backup.tamaño_mb ? `${backup.tamaño_mb} MB` : 'N/A'}
                </Text>
                <Text style={styles.backupDetail}>
                  Fecha: {backup.fecha_inicio ? new Date(backup.fecha_inicio).toLocaleString() : 'N/A'}
                </Text>
                {backup.ruta_almacenamiento && (
                  <Text style={styles.backupDetail} numberOfLines={1}>
                    Ruta: {backup.ruta_almacenamiento}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <WebLayout title="Administración" subtitle="Configuración del sistema y auditoría">
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'config' && styles.tabActive]}
            onPress={() => setActiveTab('config')}
          >
            <MaterialCommunityIcons
              name="cog"
              size={20}
              color={activeTab === 'config' ? Colors.primary : Colors.gray}
            />
            <Text style={[styles.tabText, activeTab === 'config' && styles.tabTextActive]}>
              Configuración
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'logs' && styles.tabActive]}
            onPress={() => setActiveTab('logs')}
          >
            <MaterialCommunityIcons
              name="file-document"
              size={20}
              color={activeTab === 'logs' ? Colors.primary : Colors.gray}
            />
            <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>
              Logs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'backups' && styles.tabActive]}
            onPress={() => setActiveTab('backups')}
          >
            <MaterialCommunityIcons
              name="database"
              size={20}
              color={activeTab === 'backups' ? Colors.primary : Colors.gray}
            />
            <Text style={[styles.tabText, activeTab === 'backups' && styles.tabTextActive]}>
              Backups
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'config' && renderConfigTab()}
        {activeTab === 'logs' && renderLogsTab()}
        {activeTab === 'backups' && renderBackupsTab()}
      </View>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg },
  tabs: { flexDirection: 'row', marginBottom: Spacing.lg, gap: Spacing.sm },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  tabText: { marginLeft: Spacing.sm, fontSize: 14, fontWeight: '500', color: Colors.gray },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { marginTop: Spacing.md, fontSize: 14, color: Colors.gray },
  emptyText: { fontSize: 14, color: Colors.gray, fontStyle: 'italic', textAlign: 'center', marginVertical: Spacing.lg },

  configContainer: { flex: 1 },
  section: { backgroundColor: Colors.white, borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginLeft: Spacing.sm },
  configRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  configLabel: { fontSize: 14, color: Colors.dark, flex: 1 },
  configInput: {
    width: 100,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.sm || 6,
    padding: Spacing.sm,
    textAlign: 'right',
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  saveButtonText: { marginLeft: Spacing.sm, color: Colors.white, fontSize: 16, fontWeight: '600' },

  logsContainer: { flex: 1 },
  logCard: {
    backgroundColor: Colors.light,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm || 6,
    marginBottom: Spacing.sm,
  },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  logUser: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  logAction: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  logBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm || 6 },
  logBadgeText: { fontSize: 11, fontWeight: '600' },
  logDetail: { fontSize: 12, color: Colors.gray, marginTop: 2 },

  backupsContainer: { flex: 1 },
  backupCard: {
    backgroundColor: Colors.light,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm || 6,
    marginBottom: Spacing.sm,
  },
  backupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  backupName: { fontSize: 14, fontWeight: '600', color: Colors.dark, flex: 1 },
  backupDetail: { fontSize: 12, color: Colors.gray, marginTop: 2 },
});
