import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import { useT } from '../i18n/useT';
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
  const t = useT();
  const f = useFont();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const dotColor = accent ?? c.work;

  return (
    <View style={styles.row}>
      <View style={styles.heading}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('control.decrease', { label })}
          disabled={value <= min}
          accessibilityState={{ disabled: value <= min }}
          onPress={() => onChange(clamp(value - step))}
          style={({ pressed }) => [styles.btn, value <= min && styles.disabled, pressed && styles.pressed]}
        >
          <Text maxFontSizeMultiplier={1} style={styles.btnText}>−</Text>
        </Pressable>
        <Text numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1.5} style={styles.value}>{format(value)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('control.increase', { label })}
          disabled={value >= max}
          accessibilityState={{ disabled: value >= max }}
          onPress={() => onChange(clamp(value + step))}
          style={({ pressed }) => [styles.btn, value >= max && styles.disabled, pressed && styles.pressed]}
        >
          <Text maxFontSizeMultiplier={1} style={styles.btnText}>+</Text>
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
      flexWrap: 'wrap',
      gap: 10,
      paddingVertical: 14,
    },
    heading: { flexDirection: 'row', alignItems: 'center', flexBasis: 120, flexGrow: 1 },
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
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    pressed: {
      opacity: 0.7,
    },
    disabled: { opacity: 0.4 },
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
      width: 76,
      textAlign: 'center',
    },
  });
