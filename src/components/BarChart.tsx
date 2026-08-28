import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import type { Palette } from '../theme/palettes';
import type { FontScale } from '../theme/fitness';
import type { DailyBucket } from '../stats/aggregate';

interface Props {
  buckets: DailyBucket[];
  height?: number;
}

// Minimal bar chart drawn with plain Views (no chart lib). Each bar's height is
// proportional to the day's total workout seconds.
export function BarChart({ buckets, height = 140 }: Props) {
  const c = useTheme();
  const f = useFont();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);
  const max = Math.max(1, ...buckets.map((b) => b.totalSec));

  return (
    <View style={[styles.wrap, { height }]}>
      {buckets.map((b, i) => {
        const h = Math.round((b.totalSec / max) * (height - 22));
        return (
          <View key={b.key} style={styles.col}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(b.totalSec > 0 ? 4 : 2, h),
                  backgroundColor: b.totalSec > 0 ? c.work : c.surfaceAlt,
                },
              ]}
            />
            {/* For month view (30 bars) only label every 5th to avoid clutter. */}
            {buckets.length <= 7 || i % 5 === 0 ? (
              <Text style={styles.label} numberOfLines={1}>
                {b.label}
              </Text>
            ) : (
              <Text style={styles.label}> </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette, f: FontScale) =>
  StyleSheet.create({
    wrap: {
      alignItems: 'flex-end',
      flexDirection: 'row',
      gap: 4,
      justifyContent: 'space-between',
    },
    col: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'flex-end',
    },
    bar: {
      borderRadius: 12,
      width: '70%',
    },
    label: {
      color: c.muted,
      fontSize: f.micro,
      marginTop: 6,
    },
  });
