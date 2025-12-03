import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  onSelectArea?: (geojson: any) => void;
};

export default function PlanificacionMapPicker({ onSelectArea }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadLeaflet();
    }
  }, []);

  const loadLeaflet = async () => {
    console.log('📦 Cargando Leaflet...');
    
    // Cargar CSS de Leaflet
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      console.log('✅ CSS de Leaflet cargado');
    }

    // Cargar Leaflet JS
    if (!(window as any).L) {
      console.log('📥 Descargando script de Leaflet...');
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        console.log('✅ Script de Leaflet cargado');
        setTimeout(initMap, 100); // Esperar un poco para que Leaflet se inicialice
      };
      script.onerror = () => {
        console.error('❌ Error cargando script de Leaflet');
      };
      document.body.appendChild(script);
    } else {
      console.log('✅ Leaflet ya estaba cargado');
      initMap();
    }
  };

  const initMap = () => {
    console.log('🗺️ Intentando inicializar mapa...');
    console.log('  - Container ref:', !!mapContainerRef.current);
    console.log('  - Ya existe instancia:', !!mapInstanceRef.current);
    
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    
    const L = (window as any).L;
    console.log('  - Leaflet disponible:', !!L);
    if (!L) return;

    try {
      // Crear mapa centrado en Manabí, Ecuador
      const map = L.map(mapContainerRef.current, {
        center: [-1.0543, -80.4558], // Portoviejo, Manabí
        zoom: 10,
        zoomControl: true,
      });

      // Agregar capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);

      console.log('✅✅✅ Mapa inicializado correctamente');
    } catch (error) {
      console.error('❌❌❌ Error inicializando mapa:', error);
    }
  };

  const handleStartDrawing = () => {
    if (!mapReady || !mapInstanceRef.current) {
      alert('El mapa aún no está listo. Por favor espera un momento.');
      console.log('❌ Map not ready:', { mapReady, hasMapInstance: !!mapInstanceRef.current });
      return;
    }

    console.log('✅ Iniciando modo de dibujo');
    setIsDrawing(true);
    setDrawingPoints([]);
    setSelectedArea(null);
    clearMapDrawings();

    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Handler para clics en el mapa usando refs para evitar closures
    const handleMapClick = (e: any) => {
      console.log('🖱️ Click detectado en mapa:', e.latlng);
      
      const { lat, lng } = e.latlng;
      const newPoint: [number, number] = [lat, lng];
      
      // Usar callback de setState para obtener el valor actualizado
      setDrawingPoints(prevPoints => {
        const newPoints = [...prevPoints, newPoint];
        console.log(`📍 Punto ${newPoints.length} agregado:`, { lat, lng });
        
        // Crear marcador visual
        const marker = L.circleMarker([lat, lng], {
          radius: 6,
          fillColor: Colors.primary,
          color: Colors.white,
          weight: 2,
          fillOpacity: 1
        }).addTo(map);
        
        // Agregar número al marcador
        const icon = L.divIcon({
          html: `<div style="background: ${Colors.primary}; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white;">${newPoints.length}</div>`,
          className: '',
          iconSize: [24, 24],
        });
        
        const numberMarker = L.marker([lat, lng], { icon }).addTo(map);
        markersRef.current.push(marker, numberMarker);

        // Actualizar línea temporal si hay más de 1 punto
        if (newPoints.length > 1) {
          // Remover polyline anterior
          if (polylineRef.current) {
            map.removeLayer(polylineRef.current);
          }
          
          // Crear nueva polyline
          polylineRef.current = L.polyline(newPoints, {
            color: Colors.primary,
            weight: 3,
            dashArray: '10, 5',
            opacity: 0.7
          }).addTo(map);
        }

        return newPoints;
      });
    };

    console.log('🎯 Agregando listener de click al mapa');
    // Agregar listener de clic
    map.on('click', handleMapClick);
    (map as any)._clickHandler = handleMapClick; // Guardar referencia para remover después
  };

  const handleFinishDrawing = () => {
    if (drawingPoints.length < 3) {
      alert('Necesitas seleccionar al menos 3 puntos para crear un área');
      return;
    }

    const L = (window as any).L;
    const map = mapInstanceRef.current;

    if (map && L) {
      // Remover listener de clic
      if ((map as any)._clickHandler) {
        map.off('click', (map as any)._clickHandler);
      }

      // Remover polyline temporal
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }

      // Crear polígono final
      polygonRef.current = L.polygon(drawingPoints, {
        color: Colors.primary,
        weight: 3,
        fillColor: Colors.primary,
        fillOpacity: 0.2,
        dashArray: '0'
      }).addTo(map);

      // Ajustar vista al polígono
      map.fitBounds(polygonRef.current.getBounds(), { padding: [50, 50] });

      // Convertir a GeoJSON (formato estándar: [lng, lat])
      const closedPoints = [...drawingPoints, drawingPoints[0]];
      const geojson = {
        type: 'Polygon',
        coordinates: [closedPoints.map((p: [number, number]) => [p[1], p[0]])]
      };

      setSelectedArea(geojson);
      setIsDrawing(false);
      
      if (onSelectArea) {
        onSelectArea(geojson);
      }

      console.log('Área finalizada:', geojson);
    }
  };

  const handleReset = () => {
    const map = mapInstanceRef.current;
    
    if (map) {
      // Remover listener de clic
      if ((map as any)._clickHandler) {
        map.off('click', (map as any)._clickHandler);
      }
    }

    clearMapDrawings();
    setIsDrawing(false);
    setDrawingPoints([]);
    setSelectedArea(null);

    console.log('Mapa limpiado');
  };

  const clearMapDrawings = () => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    if (!map || !L) return;

    // Limpiar marcadores
    markersRef.current.forEach(marker => {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Limpiar polyline
    if (polylineRef.current && map.hasLayer(polylineRef.current)) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Limpiar polígono
    if (polygonRef.current && map.hasLayer(polygonRef.current)) {
      map.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }

    // Limpiar todos los marcadores con íconos personalizados
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && !(layer instanceof L.CircleMarker)) {
        map.removeLayer(layer);
      }
    });
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>Mapa de Manabí, Ecuador</Text>
        
        {/* Debug info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: mapReady ? Colors.success : Colors.danger }} />
            <Text style={{ fontSize: 11, color: Colors.textMuted }}>
              Mapa: {mapReady ? 'Listo' : 'Cargando'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isDrawing ? Colors.primary : Colors.gray }} />
            <Text style={{ fontSize: 11, color: Colors.textMuted }}>
              Dibujando: {isDrawing ? 'Sí' : 'No'}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: Colors.textMuted }}>
            Puntos: {drawingPoints.length}
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          {!isDrawing ? (
            <TouchableOpacity 
              style={[styles.startBtn, !mapReady && styles.disabledBtn]} 
              onPress={handleStartDrawing}
              disabled={!mapReady}
            >
              <MaterialCommunityIcons name="pencil" size={16} color={Colors.white} />
              <Text style={styles.btnText}>{mapReady ? 'Dibujar Área' : 'Cargando...'}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.finishBtn} onPress={handleFinishDrawing}>
                <MaterialCommunityIcons name="check" size={16} color={Colors.white} />
                <Text style={styles.btnText}>Finalizar ({drawingPoints.length})</Text>
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
            Haz clic en el mapa para marcar los puntos del área (mínimo 3 puntos). Puntos marcados: {drawingPoints.length}
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
        ref={mapContainerRef} 
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
  disabledBtn: {
    opacity: 0.5,
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
    backgroundColor: '#f0f0f0',
  } as any,
});
