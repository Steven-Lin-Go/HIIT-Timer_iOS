import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { minutesAxis, type ChartBucket } from '../stats/aggregate';
import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import type { Palette } from '../theme/palettes';
import type { FontScale } from '../theme/fitness';

interface Props {
  buckets: ChartBucket[];
  height?: number;
}

// Width of the y-axis gutter, wide enough for a three-digit minute label.
const AXIS_WIDTH = 26;
// Vertical space reserved below the plot for the x-axis labels.
const X_LABEL_ROW = 22;

// Minimal bar chart drawn with plain Views (no chart lib). Bars are measured
// against a minutes axis whose top follows the tallest bar in the selected
// period, so the same chart reads sensibly for a 20-minute day and a 4-hour one.
export function BarChart({ buckets, height = 140 }: Props) {
  const c = useTheme();
  const f = useFont();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);

  const axis = minutesAxis(Math.max(0, ...buckets.map((b) => b.totalSec)));
  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let v = 0; v <= axis.max; v += axis.step) out.push(v);
    return out;
  }, [axis.max, axis.step]);

  const plotHeight = height - X_LABEL_ROW;
  const tickOffset = (value: number) => X_LABEL_ROW + (value / axis.max) * plotHeight;

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
    <View style={{ height }}>
      {/* Gridlines first so the bars paint over them. */}
      {ticks.map((v) => (
        <View key={v} style={[styles.tick, { bottom: tickOffset(v) - 6 }]}>
          <Text style={styles.tickLabel} numberOfLines={1}>
            {v}
          </Text>
          <View style={styles.gridline} />
        </View>
      ))}

      <View style={[styles.wrap, { gap: labelStep > 1 ? 2 : 4 }]}>
        {buckets.map((b, i) => {
          const h = Math.round((b.totalSec / 60 / axis.max) * plotHeight);
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
                <Text style={[styles.label, labelStep > 1 && styles.labelWide]} numberOfLines={1}>
                  {b.label}
                </Text>
              ) : (
                <Text style={styles.label}> </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette, f: FontScale) =>
  StyleSheet.create({
    tick: {
      alignItems: 'center',
      flexDirection: 'row',
      height: 12,
      left: 0,
      position: 'absolute',
      right: 0,
    },
    tickLabel: {
      color: c.muted,
      fontSize: f.micro,
      paddingRight: 4,
      textAlign: 'right',
      width: AXIS_WIDTH,
    },
    gridline: {
      backgroundColor: c.border,
      flex: 1,
      height: 1,
    },
    wrap: {
      alignItems: 'flex-end',
      flexDirection: 'row',
      height: '100%',
      justifyContent: 'space-between',
      marginLeft: AXIS_WIDTH,
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
    // Overflows its column on purpose; the neighbouring columns are blank
    // whenever the axis is thinned, and the spacing between labelled columns
    // is far wider than this.
    labelWide: {
      textAlign: 'center',
      width: 28,
    },
  });
