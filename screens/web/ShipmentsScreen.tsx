import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebLayout from '@/components/web/WebLayout';
import EnvioDialog from '@/components/web/EnvioDialog';
import { Card } from '@/components/Card';
import { apiClient } from '@/services/api';
import { Colors, Spacing } from '@/constants/theme-new';

export default function ShipmentsWebScreen() {
  const [envios, setEnvios] = useState<any[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedEnvio, setSelectedEnvio] = useState<any>(null);

  useEffect(() => {
    fetchEnvios();
  }, []);

  const fetchEnvios = async () => {
    try {
      const data: any = await apiClient.getEnvios();
      setEnvios(data.results || data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  const handleCreate = () => {
    setSelectedEnvio(null);
    setDialogVisible(true);
  };

  const handleEdit = (envio: any) => {
    setSelectedEnvio(envio);
    setDialogVisible(true);
  };

  const handleSuccess = () => {
    fetchEnvios();
  };

  const getStatusColor = (estado: string) => {
    const colors: Record<string, string> = {
      'PENDIENTE': Colors.warning,
      'EN_TRANSITO': Colors.info,
      'ENTREGADO': Colors.success,
      'CANCELADO': Colors.danger,
    };
    return colors[estado] || Colors.gray;
  };

  const renderEnvioCard = ({ item }: any) => (
    <Card style={styles.envioCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="truck" size={24} color={Colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.envioCode}>Envío #{item.numero_guia || item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.estado) }]}>
              {item.estado?.replace('_', ' ')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.routeInfo}>
        <View style={styles.location}>
          <MaterialCommunityIcons name="map-marker" size={16} color={Colors.success} />
          <Text style={styles.locationText}>{item.origen || 'Origen'}</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.gray} />
        <View style={styles.location}>
          <MaterialCommunityIcons name="map-marker" size={16} color={Colors.danger} />
          <Text style={styles.locationText}>{item.destino || 'Destino'}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Fecha</Text>
          <Text style={styles.detailValue}>
            {new Date(item.fecha_envio).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Transportista</Text>
          <Text style={styles.detailValue}>{item.transportista || 'N/A'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.trackButton} onPress={() => handleEdit(item)}>
        <MaterialCommunityIcons name="pencil" size={18} color={Colors.white} />
        <Text style={styles.trackButtonText}>Editar</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <WebLayout title="Envíos" subtitle="Gestión de envíos y logística">
      <View style={styles.content}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
            <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
            <Text style={styles.primaryButtonText}>Nuevo Envío</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={envios}
          renderItem={renderEnvioCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />

        <EnvioDialog
          visible={dialogVisible}
          onClose={() => setDialogVisible(false)}
          onSuccess={handleSuccess}
          envio={selectedEnvio}
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
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  grid: {
    gap: Spacing.lg,
  },
  envioCard: {
    flex: 1,
    margin: Spacing.sm,
    maxWidth: '48%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  envioCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.lightGray,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: Colors.dark,
    marginLeft: Spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '600',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
  },
  trackButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
});
