import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Modal, ScrollView } from 'react-native';
import WebLayout from '@/components/web/WebLayout';
import { apiClient } from '@/services/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CertificacionesScreen() {
  const [certificaciones, setCertificaciones] = useState<any[]>([]);
  const [certificacionesProductores, setCertificacionesProductores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalogo' | 'productores'>('productores');
  const [showModal, setShowModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'catalogo') {
        const data: any = await apiClient.getCertificaciones();
        setCertificaciones(data.results || data || []);
      } else {
        const data: any = await apiClient.getCertificacionesProductores();
        setCertificacionesProductores(data.results || data || []);
      }
    } catch (err) {
      console.error('Error fetching certificaciones', err);
      alert('Error al cargar certificaciones');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'VIGENTE':
        return Colors.success;
      case 'POR_RENOVAR':
        return Colors.warning;
      case 'VENCIDA':
      case 'REVOCADA':
        return Colors.danger;
      case 'EN_TRAMITE':
        return Colors.info;
      default:
        return Colors.gray;
    }
  };

  const getEstadoLabel = (estado: string) => {
    const labels: any = {
      VIGENTE: 'Vigente',
      POR_RENOVAR: 'Por Renovar',
      VENCIDA: 'Vencida',
      SUSPENDIDA: 'Suspendida',
      REVOCADA: 'Revocada',
      EN_TRAMITE: 'En Trámite',
    };
    return labels[estado] || estado;
  };

  const getTipoIcon = (tipo: string) => {
    const icons: any = {
      CALIDAD: 'certificate',
      ORGANICO: 'leaf',
      AMBIENTAL: 'tree',
      SOCIAL: 'account-group',
      INOCUIDAD: 'shield-check',
      BPA: 'sprout',
      BPM: 'factory',
      COMERCIO_JUSTO: 'handshake',
      OTRO: 'tag',
    };
    return icons[tipo] || 'certificate';
  };

  const filteredProductores = certificacionesProductores.filter((item) => {
    const matchSearch = 
      item.numero_certificado?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.certificacion?.nombre?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchEstado = !filterEstado || item.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const renderCatalogItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedCert(item);
        setShowModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons
          name={getTipoIcon(item.tipo_certificacion)}
          size={32}
          color={Colors.primary}
        />
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.cardSubtitle}>{item.codigo}</Text>
        </View>
        {item.es_activa && (
          <View style={[styles.badge, { backgroundColor: Colors.success + '20' }]}>
            <Text style={[styles.badgeText, { color: Colors.success }]}>Activa</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="domain" size={16} color={Colors.gray} />
          <Text style={styles.infoText}>{item.entidad_emisora}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="earth" size={16} color={Colors.gray} />
          <Text style={styles.infoText}>{item.alcance}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar-clock" size={16} color={Colors.gray} />
          <Text style={styles.infoText}>Vigencia: {item.vigencia_anios} año(s)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProductorItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedCert(item);
        setShowModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.certificacion?.nombre || 'Certificación'}</Text>
          <Text style={styles.cardSubtitle}>#{item.numero_certificado}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getEstadoColor(item.estado) + '20' }]}>
          <Text style={[styles.badgeText, { color: getEstadoColor(item.estado) }]}>
            {getEstadoLabel(item.estado)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="account" size={16} color={Colors.gray} />
          <Text style={styles.infoText}>{item.productor?.nombre || item.finca?.nombre || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar" size={16} color={Colors.gray} />
          <Text style={styles.infoText}>
            Emisión: {item.fecha_emision ? new Date(item.fecha_emision).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar-alert" size={16} color={Colors.gray} />
          <Text style={styles.infoText}>
            Expiración: {item.fecha_expiracion ? new Date(item.fecha_expiracion).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        {item.area_certificada_hectareas && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map" size={16} color={Colors.gray} />
            <Text style={styles.infoText}>Área: {item.area_certificada_hectareas} ha</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <WebLayout title="Certificaciones" subtitle="Gestión de certificaciones y cumplimiento normativo">
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'productores' && styles.tabActive]}
            onPress={() => setActiveTab('productores')}
          >
            <MaterialCommunityIcons
              name="certificate"
              size={20}
              color={activeTab === 'productores' ? Colors.primary : Colors.gray}
            />
            <Text style={[styles.tabText, activeTab === 'productores' && styles.tabTextActive]}>
              Certificaciones Productores
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'catalogo' && styles.tabActive]}
            onPress={() => setActiveTab('catalogo')}
          >
            <MaterialCommunityIcons
              name="book-open-variant"
              size={20}
              color={activeTab === 'catalogo' ? Colors.primary : Colors.gray}
            />
            <Text style={[styles.tabText, activeTab === 'catalogo' && styles.tabTextActive]}>
              Catálogo Certificaciones
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {activeTab === 'productores' && (
          <View style={styles.filters}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por número o nombre..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Estado:</Text>
              <View style={styles.filterButtons}>
                {['', 'VIGENTE', 'POR_RENOVAR', 'VENCIDA'].map((estado) => (
                  <TouchableOpacity
                    key={estado}
                    style={[
                      styles.filterButton,
                      filterEstado === estado && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilterEstado(estado)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filterEstado === estado && styles.filterButtonTextActive,
                      ]}
                    >
                      {estado === '' ? 'Todos' : getEstadoLabel(estado)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando certificaciones...</Text>
          </View>
        ) : (
          <FlatList
            data={activeTab === 'catalogo' ? certificaciones : filteredProductores}
            renderItem={activeTab === 'catalogo' ? renderCatalogItem : renderProductorItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="certificate-outline" size={64} color={Colors.gray} />
                <Text style={styles.emptyText}>No hay certificaciones disponibles</Text>
              </View>
            }
          />
        )}

        {/* Modal de Detalles */}
        <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {activeTab === 'catalogo' ? 'Detalle Certificación' : 'Detalle Certificación Productor'}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={Colors.dark} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {selectedCert && activeTab === 'catalogo' ? (
                  <View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Nombre:</Text>
                      <Text style={styles.detailValue}>{selectedCert.nombre}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Código:</Text>
                      <Text style={styles.detailValue}>{selectedCert.codigo}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tipo:</Text>
                      <Text style={styles.detailValue}>{selectedCert.tipo_certificacion}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Entidad Emisora:</Text>
                      <Text style={styles.detailValue}>{selectedCert.entidad_emisora}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Alcance:</Text>
                      <Text style={styles.detailValue}>{selectedCert.alcance}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Vigencia:</Text>
                      <Text style={styles.detailValue}>{selectedCert.vigencia_anios} año(s)</Text>
                    </View>
                    {selectedCert.descripcion && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Descripción:</Text>
                        <Text style={styles.detailValue}>{selectedCert.descripcion}</Text>
                      </View>
                    )}
                    {selectedCert.url_informacion && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>URL:</Text>
                        <Text style={[styles.detailValue, { color: Colors.primary }]}>
                          {selectedCert.url_informacion}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : selectedCert ? (
                  <View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Certificación:</Text>
                      <Text style={styles.detailValue}>{selectedCert.certificacion?.nombre}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Número:</Text>
                      <Text style={styles.detailValue}>{selectedCert.numero_certificado}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Estado:</Text>
                      <View style={[styles.badge, { backgroundColor: getEstadoColor(selectedCert.estado) + '20' }]}>
                        <Text style={[styles.badgeText, { color: getEstadoColor(selectedCert.estado) }]}>
                          {getEstadoLabel(selectedCert.estado)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Productor/Finca:</Text>
                      <Text style={styles.detailValue}>
                        {selectedCert.productor?.nombre || selectedCert.finca?.nombre || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Fecha Emisión:</Text>
                      <Text style={styles.detailValue}>
                        {selectedCert.fecha_emision
                          ? new Date(selectedCert.fecha_emision).toLocaleDateString()
                          : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Fecha Expiración:</Text>
                      <Text style={styles.detailValue}>
                        {selectedCert.fecha_expiracion
                          ? new Date(selectedCert.fecha_expiracion).toLocaleDateString()
                          : 'N/A'}
                      </Text>
                    </View>
                    {selectedCert.area_certificada_hectareas && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Área Certificada:</Text>
                        <Text style={styles.detailValue}>{selectedCert.area_certificada_hectareas} ha</Text>
                      </View>
                    )}
                    {selectedCert.notas && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Notas:</Text>
                        <Text style={styles.detailValue}>{selectedCert.notas}</Text>
                      </View>
                    )}
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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

  filters: { marginBottom: Spacing.lg, gap: Spacing.md },
  searchInput: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    fontSize: 14,
  },
  filterGroup: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  filterLabel: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  filterButtons: { flexDirection: 'row', gap: Spacing.xs, flex: 1, flexWrap: 'wrap' },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm || 6,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterButtonText: { fontSize: 12, color: Colors.gray },
  filterButtonTextActive: { color: Colors.white, fontWeight: '600' },

  list: { paddingBottom: Spacing.xl },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  cardSubtitle: { fontSize: 13, color: Colors.gray, marginTop: 2 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm || 6 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardBody: { gap: Spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  infoText: { fontSize: 13, color: Colors.dark },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: Spacing.md, fontSize: 14, color: Colors.gray },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.xl * 2 },
  emptyText: { marginTop: Spacing.md, fontSize: 16, color: Colors.gray },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxWidth: 600, backgroundColor: Colors.white, borderRadius: BorderRadius.lg || 12, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.lightGray },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  modalBody: { padding: Spacing.lg },
  modalFooter: { padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.lightGray },
  closeButton: { backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  closeButtonText: { color: Colors.white, fontWeight: '600', fontSize: 14 },

  detailRow: { marginBottom: Spacing.md },
  detailLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray, marginBottom: 4 },
  detailValue: { fontSize: 14, color: Colors.dark },
});
