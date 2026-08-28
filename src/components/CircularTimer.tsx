import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import type { Palette } from '../theme/palettes';
import { font } from '../theme/fitness';

interface Props {
  time: string;
  phaseLabel: string;
  accent: string;
  subLabel?: string; // e.g. "1 / 8 ROUND"
  size?: number;
}

// Neon ring around the time. Pure View/border (no SVG dep); the accent color
// carries the phase. A subtle inner ring adds depth.
export function CircularTimer({ time, phaseLabel, accent, subLabel, size = 280 }: Props) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2, borderColor: accent },
      ]}
    >
      <View
        style={[
          styles.innerRing,
          {
            width: size - 24,
            height: size - 24,
            borderRadius: (size - 24) / 2,
          },
        ]}
      >
        <Text style={[styles.phase, { color: accent }]}>{phaseLabel}</Text>
        <Text style={styles.time}>{time}</Text>
        {subLabel ? <Text style={styles.sub}>{subLabel}</Text> : null}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    ring: {
      alignItems: 'center',
      borderWidth: 8,
      justifyContent: 'center',
    },
    innerRing: {
      alignItems: 'center',
      borderColor: c.border,
      borderWidth: 1,
      justifyContent: 'center',
    },
    phase: {
      fontSize: font.small,
      fontWeight: '800',
      letterSpacing: 2,
    },
    time: {
      color: c.text,
      fontSize: font.timer,
      fontWeight: '800',
      letterSpacing: -2,
      marginTop: 4,
    },
    sub: {
      color: c.muted,
      fontSize: font.small,
      fontWeight: '700',
      letterSpacing: 1.5,
      marginTop: 6,
    },
  });
