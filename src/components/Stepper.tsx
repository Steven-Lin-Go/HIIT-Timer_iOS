import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import type { Palette } from '../theme/palettes';
import { radius, type FontScale } from '../theme/fitness';

interface Props {
  label: string;
  value: number;
  accent?: string;
  step?: number;
  min?: number;
  max?: number;
  format?: (v: number) => string;
  onChange: (next: number) => void;
}

// One labelled row with − / + controls, used across the setup screen.
export function Stepper({
  label,
  value,
  accent,
  step = 1,
  min = 0,
  max = 3600,
  format = (v) => `${v}`,
  onChange,
}: Props) {
  const c = useTheme();
  const f = useFont();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const dotColor = accent ?? c.work;

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(clamp(value - step))}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{format(value)}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(clamp(value + step))}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette, f: FontScale) =>
  StyleSheet.create({
    row: {
      alignItems: 'center',
      borderBottomColor: c.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      paddingVertical: 14,
    },
    dot: {
      borderRadius: radius.pill,
      height: 10,
      marginRight: 12,
      width: 10,
    },
    label: {
      color: c.text,
      flex: 1,
      fontSize: f.label,
      fontWeight: '700',
    },
    controls: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    btn: {
      alignItems: 'center',
      backgroundColor: c.surfaceAlt,
      borderRadius: radius.sm,
      height: 34,
      justifyContent: 'center',
      width: 34,
    },
    pressed: {
      opacity: 0.7,
    },
    btnText: {
      color: c.text,
      fontSize: 20,
      fontWeight: '800',
      lineHeight: 22,
    },
    value: {
      color: c.text,
      fontSize: f.label,
      fontWeight: '800',
      minWidth: 64,
      textAlign: 'center',
    },
  });
