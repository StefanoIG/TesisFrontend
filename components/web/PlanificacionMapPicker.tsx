import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme-new';

type Props = {
  onSelectArea?: (geojson: any) => void;
};

export default function PlanificacionMapPicker({ onSelectArea }: Props) {
  const [stage, setStage] = useState<'idle' | 'first' | 'second' | 'done'>('idle');
  const [firstPoint, setFirstPoint] = useState<{ x: number; y: number } | null>(null);
  const [secondPoint, setSecondPoint] = useState<{ x: number; y: number } | null>(null);

  const handleBoxClick = (e: any) => {
    // Simple pixel-based bbox selection for now (web only). We'll return normalized coords.
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    const norm = { x: x / w, y: y / h };

    if (stage === 'idle') {
      setFirstPoint(norm);
      setStage('first');
      return;
    }

    if (stage === 'first') {
      setSecondPoint(norm);
      setStage('second');
      // build a simple polygon (bbox)
      const x1 = firstPoint ? firstPoint.x : 0;
      const y1 = firstPoint ? firstPoint.y : 0;
      const x2 = norm.x;
      const y2 = norm.y;

      const polygon = {
        type: 'Polygon',
        coordinates: [[
          [x1, y1],
          [x2, y1],
          [x2, y2],
          [x1, y2],
          [x1, y1]
        ]]
      };

      if (onSelectArea) onSelectArea(polygon);
      setStage('done');
    }
  };

  const reset = () => {
    setStage('idle');
    setFirstPoint(null);
    setSecondPoint(null);
  };

  return (
    <View>
      <Text style={styles.label}>Seleccionar zona de la granja (click en dos puntos)</Text>
      <div onClick={handleBoxClick} style={styles.mapBox as any}>
        {stage === 'idle' && <div style={styles.hint as any}>Click para definir primer punto</div>}
        {stage === 'first' && <div style={styles.hint as any}>Click para definir segundo punto</div>}
        {stage === 'done' && <div style={styles.hint as any}>Área seleccionada</div>}
      </div>

      <View style={{ marginTop: Spacing.sm }}>
        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Text style={{ color: Colors.white }}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: Spacing.sm, fontSize: 14 },
  mapBox: {
    width: '100%',
    height: 320,
    borderRadius: BorderRadius.md,
    border: `1px solid ${Colors.gray}`,
    backgroundColor: Colors.light,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as any,
  hint: { color: Colors.gray, fontSize: 13 },
  resetBtn: { marginTop: Spacing.sm, backgroundColor: Colors.danger || '#d9534f', padding: 8, borderRadius: BorderRadius.sm || 6, alignItems: 'center' }
});
