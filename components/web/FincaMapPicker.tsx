import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  area?: number; // km²
  onSelectPolygon?: (coordinates: [number, number][], areaM2: number) => void;
  editable?: boolean;
};

interface Marker {
  id: string;
  lat: number;
  lng: number;
  element?: any;
}

export default function FincaMapPicker({ area, onSelectPolygon, editable = true }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Marker[]>([]);
  const polygonRef = useRef<any>(null);
  const draggingMarkerRef = useRef<string | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [currentArea, setCurrentArea] = useState<number>(0); // m²
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadLeaflet();
    }
  }, []);

  const loadLeaflet = async () => {
    // Cargar CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Cargar JS
    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setTimeout(initMap, 100);
      };
      document.body.appendChild(script);
    } else {
      initMap();
    }
  };

  const initMap = () => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [-1.0543, -80.4558], // Portoviejo, Manabí
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
      setIsLoading(false);

      // Eventos del mapa
      map.on('click', handleMapClick);
    } catch (error) {
      console.error('Error inicializando mapa:', error);
      setIsLoading(false);
    }
  };

  const handleMapClick = (e: any) => {
    if (!editable || !isDrawing) return;

    const { lat, lng } = e.latlng;
    addPoint(lat, lng);
  };

  const addPoint = (lat: number, lng: number) => {
    const L = (window as any).L;
    if (!L) return;

    const id = `marker-${Date.now()}`;
    const newCoords: [number, number] = [lng, lat];

    // Agregar marcador
    const marker = L.circleMarker([lat, lng], {
      radius: 6,
      fillColor: Colors.secondary,
      color: Colors.primary,
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    }).addTo(mapInstanceRef.current);

    marker.on('mousedown', () => startDragging(id));

    markersRef.current.push({ id, lat, lng, element: marker });
    const newCoordinates = [...coordinates, newCoords];
    setCoordinates(newCoordinates);

    // Dibujar polígono
    if (newCoordinates.length >= 3) {
      drawPolygon(newCoordinates);
    }
  };

  const drawPolygon = (coords: [number, number][]) => {
    const L = (window as any).L;
    if (!L) return;

    // Eliminar polígono anterior
    if (polygonRef.current) {
      mapInstanceRef.current.removeLayer(polygonRef.current);
    }

    // Convertir coordenadas GeoJSON a LatLng
    const latlngs = coords.map(([lng, lat]) => [lat, lng]);

    // Crear polígono
    const polygon = L.polygon(latlngs, {
      color: Colors.secondary,
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.2,
      fillColor: Colors.secondary,
    }).addTo(mapInstanceRef.current);

    polygonRef.current = polygon;

    // Calcular área
    const areaM2 = calculatePolygonArea(coords);
    setCurrentArea(areaM2);

    if (onSelectPolygon) {
      onSelectPolygon(coords, areaM2);
    }
  };

  const calculatePolygonArea = (coords: [number, number][]) => {
    // Usar fórmula de Shoelace para calcular área en m²
    if (coords.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const [lng1, lat1] = coords[i];
      const [lng2, lat2] = coords[(i + 1) % coords.length];
      area += (lng1 * lat2 - lng2 * lat1);
    }

    area = Math.abs(area) / 2;

    // Convertir de grados² a m² aproximadamente
    // En Ecuador (latitud -1°), 1° ≈ 111 km
    const latRadians = (coords[0][1] * Math.PI) / 180;
    const metersPerDegreeLat = 111_000;
    const metersPerDegreeLng = 111_000 * Math.cos(latRadians);

    const areaM2 = area * metersPerDegreeLat * metersPerDegreeLng;
    return Math.round(areaM2);
  };

  const startDragging = (markerId: string) => {
    if (!editable) return;
    draggingMarkerRef.current = markerId;
  };

  const finishDrawing = () => {
    if (coordinates.length < 3) {
      alert('Se necesitan al menos 3 puntos para crear un polígono');
      return;
    }
    setIsDrawing(false);
  };

  const resetDrawing = () => {
    const L = (window as any).L;
    if (!L) return;

    // Eliminar todos los marcadores
    markersRef.current.forEach((m) => {
      mapInstanceRef.current.removeLayer(m.element);
    });
    markersRef.current = [];

    // Eliminar polígono
    if (polygonRef.current) {
      mapInstanceRef.current.removeLayer(polygonRef.current);
    }

    setCoordinates([]);
    setCurrentArea(0);
    setIsDrawing(false);
  };

  const removeLastPoint = () => {
    const L = (window as any).L;
    if (!L || coordinates.length === 0) return;

    const lastMarker = markersRef.current.pop();
    if (lastMarker?.element) {
      mapInstanceRef.current.removeLayer(lastMarker.element);
    }

    const newCoords = coordinates.slice(0, -1);
    setCoordinates(newCoords);

    // Redramatizar polígono
    if (polygonRef.current) {
      mapInstanceRef.current.removeLayer(polygonRef.current);
      if (newCoords.length >= 3) {
        drawPolygon(newCoords);
      }
    }
  };

  const convertM2ToKm2 = (m2: number) => {
    return (m2 / 1_000_000).toFixed(4);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        ref={mapContainerRef}
        style={styles.mapContainer}
      />

      <View style={styles.controls}>
        {!isDrawing ? (
          <TouchableOpacity
            style={[styles.button, styles.drawButton]}
            onPress={() => setIsDrawing(true)}
          >
            <MaterialCommunityIcons name="pencil" size={18} color={Colors.white} />
            <Text style={styles.buttonText}>Dibujar Polígono</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.controlsGroup}>
            <TouchableOpacity
              style={[styles.button, styles.undoButton]}
              onPress={removeLastPoint}
              disabled={coordinates.length === 0}
            >
              <MaterialCommunityIcons name="undo" size={18} color={Colors.white} />
              <Text style={styles.buttonText}>Deshacer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={resetDrawing}
            >
              <MaterialCommunityIcons name="trash-can" size={18} color={Colors.white} />
              <Text style={styles.buttonText}>Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.finishButton, coordinates.length < 3 && styles.buttonDisabled]}
              onPress={finishDrawing}
              disabled={coordinates.length < 3}
            >
              <MaterialCommunityIcons name="check-circle" size={18} color={Colors.white} />
              <Text style={styles.buttonText}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {coordinates.length > 0 && (
        <View style={styles.infoPanel}>
          <View style={styles.infoPanelContent}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-multiple" size={18} color={Colors.secondary} />
              <Text style={styles.infoLabel}>Puntos:</Text>
              <Text style={styles.infoValue}>{coordinates.length}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="ruler" size={18} color={Colors.secondary} />
              <Text style={styles.infoLabel}>Área:</Text>
              <View>
                <Text style={styles.infoValue}>{currentArea.toLocaleString()} m²</Text>
                <Text style={styles.infoSubValue}>{convertM2ToKm2(currentArea)} km²</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 500,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingContainer: {
    width: '100%',
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.darkGray,
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 100,
  },
  controlsGroup: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
  },
  drawButton: {
    backgroundColor: Colors.secondary,
    flex: 1,
  },
  undoButton: {
    backgroundColor: Colors.warning,
    flex: 1,
  },
  resetButton: {
    backgroundColor: Colors.danger,
    flex: 1,
  },
  finishButton: {
    backgroundColor: Colors.secondary,
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  infoPanel: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 100,
    maxWidth: 250,
  },
  infoPanelContent: {
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.darkGray,
    minWidth: 60,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  infoSubValue: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '500',
  },
});
