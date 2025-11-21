import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import WebLayout from '@/components/web/WebLayout';
import ProductoDialog from '@/components/web/ProductoDialog';
import { apiClient } from '@/services/api';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProductsScreen() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<any>(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const data: any = await apiClient.getProductos();
      setProductos(data.results || data || []);
    } catch (error) {
      console.error('Error fetching productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProducto(null);
    setDialogVisible(true);
  };

  const handleEdit = (producto: any) => {
    setSelectedProducto(producto);
    setDialogVisible(true);
  };

  const handleDelete = async (producto: any) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${producto.nombre}"?`)) {
      try {
        await apiClient.deleteProducto(producto.id);
        fetchProductos();
      } catch (error) {
        console.error('Error deleting producto:', error);
        alert('Error al eliminar el producto. Puede estar asociado a lotes existentes.');
      }
    }
  };

  const handleSuccess = () => {
    fetchProductos();
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'FRUTA': return 'fruit-grapes';
      case 'VERDURA': return 'food-drumstick';
      case 'TUBÉRCULO': return 'potato';
      case 'GRANO': return 'barley';
      case 'PROCESADO': return 'food';
      default: return 'package-variant';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'FRUTA': return Colors.success;
      case 'VERDURA': return Colors.primary;
      case 'TUBÉRCULO': return Colors.warning;
      case 'GRANO': return Colors.info;
      case 'PROCESADO': return Colors.secondary;
      default: return Colors.gray;
    }
  };

  const renderProducto = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconContainer, { backgroundColor: getTipoColor(item.tipo_producto) + '20' }]}>
            <MaterialCommunityIcons 
              name={getTipoIcon(item.tipo_producto) as any} 
              size={32} 
              color={getTipoColor(item.tipo_producto)} 
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: getTipoColor(item.tipo_producto) + '20' }]}>
                <Text style={[styles.badgeText, { color: getTipoColor(item.tipo_producto) }]}>
                  {item.tipo_producto}
                </Text>
              </View>
              <Text style={styles.unidadText}>{item.unidad_medida}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => handleEdit(item)}
          >
            <MaterialCommunityIcons name="pencil" size={18} color={Colors.info} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => handleDelete(item)}
          >
            <MaterialCommunityIcons name="delete" size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.descripcion && (
        <Text style={styles.descripcion}>{item.descripcion}</Text>
      )}
      
      <Text style={styles.fecha}>
        Creado: {new Date(item.creado_en).toLocaleDateString('es-ES')}
      </Text>
    </View>
  );

  return (
    <WebLayout title="Productos" subtitle="Gestión de productos agrícolas">
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>
            {productos.length} producto{productos.length !== 1 ? 's' : ''} registrado{productos.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
            <Text style={styles.createButtonText}>Nuevo Producto</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando productos...</Text>
          </View>
        ) : productos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant-closed" size={80} color={Colors.lightGray} />
            <Text style={styles.emptyTitle}>No hay productos registrados</Text>
            <Text style={styles.emptyText}>
              Comienza creando tu primer producto agrícola
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreate}>
              <Text style={styles.emptyButtonText}>Crear Producto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={productos}
            renderItem={renderProducto}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            numColumns={2}
            columnWrapperStyle={styles.row}
          />
        )}

        <ProductoDialog
          visible={dialogVisible}
          onClose={() => setDialogVisible(false)}
          onSuccess={handleSuccess}
          producto={selectedProducto}
        />
      </View>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  toolbarTitle: {
    fontSize: 16,
    color: Colors.gray,
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  card: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: Spacing.xs,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  unidadText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: Colors.info + '10',
    borderColor: Colors.info + '30',
  },
  deleteButton: {
    backgroundColor: Colors.danger + '10',
    borderColor: Colors.danger + '30',
  },
  descripcion: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  fecha: {
    fontSize: 12,
    color: Colors.lightGray,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
