import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  onSelectArea?: (geojson: any) => void;
};

export default function PlanificacionMapPicker({ onSelectArea }: Props) {
  const mapRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [drawingPoints, setDrawingPoints] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Cargar Leaflet dinámicamente solo en web
      const loadLeaflet = async () => {
        // Cargar CSS de Leaflet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Cargar Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initMap();
        document.body.appendChild(script);
      };

      loadLeaflet();
    }
  }, []);

  const initMap = () => {
    if (mapRef.current && (window as any).L) {
      const L = (window as any).L;
      
      // Crear mapa centrado en Manabí, Ecuador
      // Coordenadas aproximadas de Portoviejo, Manabí
      const map = L.map(mapRef.current).setView([-1.0543, -80.4558], 10);

      // Agregar capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Variable para almacenar el polígono dibujado
      let drawnPolygon: any = null;
      let tempPolyline: any = null;
      let points: any[] = [];

      // Manejar clics en el mapa para dibujar polígono
      map.on('click', (e: any) => {
        if (isDrawing) {
          const { lat, lng } = e.latlng;
          points.push([lat, lng]);
          setDrawingPoints([...points]);

          // Actualizar línea temporal
          if (tempPolyline) {
            map.removeLayer(tempPolyline);
          }
          
          if (points.length > 1) {
            tempPolyline = L.polyline(points, {
              color: Colors.primary,
              weight: 2,
              dashArray: '5, 5'
            }).addTo(map);
          }

          // Agregar marcador
          L.circleMarker([lat, lng], {
            radius: 5,
            fillColor: Colors.primary,
            color: Colors.white,
            weight: 2,
            fillOpacity: 1
          }).addTo(map);
        }
      });

      // Guardar referencia del mapa
      (mapRef.current as any).leafletMap = map;
    }
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setDrawingPoints([]);
    setSelectedArea(null);
  };

  const handleFinishDrawing = () => {
    if (drawingPoints.length < 3) {
      alert('Necesitas seleccionar al menos 3 puntos para crear un área');
      return;
    }

    setIsDrawing(false);

    const L = (window as any).L;
    const map = (mapRef.current as any)?.leafletMap;

    if (map && L) {
      // Cerrar el polígono
      const closedPoints = [...drawingPoints, drawingPoints[0]];
      
      // Crear polígono final
      const polygon = L.polygon(drawingPoints, {
        color: Colors.primary,
        weight: 2,
        fillColor: Colors.primary,
        fillOpacity: 0.3
      }).addTo(map);

      // Convertir a GeoJSON
      const geojson = {
        type: 'Polygon',
        coordinates: [closedPoints.map((p: any) => [p[1], p[0]])] // [lng, lat]
      };

      setSelectedArea(geojson);
      
      if (onSelectArea) {
        onSelectArea(geojson);
      }

      // Limpiar línea temporal
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
          map.removeLayer(layer);
        }
      });
    }
  };

  const handleReset = () => {
    setIsDrawing(false);
    setDrawingPoints([]);
    setSelectedArea(null);

    const map = (mapRef.current as any)?.leafletMap;
    if (map && (window as any).L) {
      const L = (window as any).L;
      
      // Limpiar todos los polígonos y marcadores
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Polygon || 
            layer instanceof L.Polyline || 
            layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });
    }
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>Mapa de Manabí, Ecuador</Text>
        <View style={styles.buttonGroup}>
          {!isDrawing ? (
            <TouchableOpacity style={styles.startBtn} onPress={handleStartDrawing}>
              <MaterialCommunityIcons name="pencil" size={16} color={Colors.white} />
              <Text style={styles.btnText}>Dibujar Área</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.finishBtn} onPress={handleFinishDrawing}>
                <MaterialCommunityIcons name="check" size={16} color={Colors.white} />
                <Text style={styles.btnText}>Finalizar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleReset}>
                <MaterialCommunityIcons name="close" size={16} color={Colors.white} />
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {isDrawing && (
        <View style={styles.instructions}>
          <MaterialCommunityIcons name="information" size={16} color={Colors.info} />
          <Text style={styles.instructionText}>
            Haz clic en el mapa para marcar los puntos del área. Mínimo 3 puntos.
          </Text>
        </View>
      )}

      {selectedArea && (
        <View style={[styles.instructions, { backgroundColor: Colors.success + '20' }]}>
          <MaterialCommunityIcons name="check-circle" size={16} color={Colors.success} />
          <Text style={[styles.instructionText, { color: Colors.success }]}>
            Área seleccionada con {drawingPoints.length} puntos
          </Text>
        </View>
      )}

      <div 
        ref={mapRef} 
        style={styles.mapContainer as any}
      />

      {selectedArea && (
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <MaterialCommunityIcons name="refresh" size={16} color={Colors.white} />
          <Text style={styles.btnText}>Limpiar Área</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600',
    color: Colors.dark 
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm || 6,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm || 6,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.danger,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm || 6,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm || 6,
    marginTop: Spacing.sm,
  },
  btnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.info + '20',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm || 6,
    marginBottom: Spacing.sm,
  },
  instructionText: {
    fontSize: 12,
    color: Colors.info,
    flex: 1,
  },
  mapContainer: {
    width: '100%',
    height: 500,
    borderRadius: BorderRadius.md,
    border: `2px solid ${Colors.lightGray}`,
    overflow: 'hidden',
  } as any,
});
