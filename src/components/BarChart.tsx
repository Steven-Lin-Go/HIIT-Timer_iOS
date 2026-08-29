import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import type { Palette } from '../theme/palettes';
import type { FontScale } from '../theme/fitness';
import type { ChartBucket } from '../stats/aggregate';

interface Props {
  buckets: ChartBucket[];
  height?: number;
}

// Minimal bar chart drawn with plain Views (no chart lib). Each bar's height is
// proportional to the day's total workout seconds.
export function BarChart({ buckets, height = 140 }: Props) {
  const c = useTheme();
  const f = useFont();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);
  const max = Math.max(1, ...buckets.map((b) => b.totalSec));
  // Label every column where there is room. Denser charts are thinned out
  // counting back from the newest bucket, so the right edge -- the one the
  // reader anchors on -- always carries a label. Both ends are always labelled
  // so the span of the axis is readable without counting columns.
  const labelStep = buckets.length <= 12 ? 1 : 5;
  const showLabel = (i: number): boolean => {
    const last = buckets.length - 1;
    if (i === 0 || i === last) return true;
    // Only thinned axes risk crowding the left edge label with its neighbour.
    if (labelStep > 1 && i < 2) return false;
    return (last - i) % labelStep === 0;
  };

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
            {showLabel(i) ? (
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
