import { useMemo, useState } from 'react';
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

// Vertical space reserved below the plot for the x-axis labels.
const X_LABEL_ROW = 22;

// Minimal bar chart drawn with plain Views (no chart lib). Bars are measured
// against a minutes axis whose top follows the tallest bar in the selected
// period, so the same chart reads sensibly for a 20-minute day and a 4-hour one.
export function BarChart({ buckets, height = 140 }: Props) {
  const c = useTheme();
  const f = useFont();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);
  const [width, setWidth] = useState(0);

  const axis = minutesAxis(Math.max(0, ...buckets.map((b) => b.totalSec)));
  const axisWidth = Math.max(26, Math.ceil(String(axis.max).length * f.micro * 0.7 + 8));
  const labelWidth = Math.max(28, ...buckets.map(b => b.label.length * f.micro * 0.7 + 8));
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
  const labelStep = Math.max(buckets.length > 12 ? 5 : 1, Math.ceil(buckets.length * labelWidth / Math.max(1, width - axisWidth)));
  const showLabel = (i: number): boolean => {
    const last = buckets.length - 1;
    if (i === 0 || i === last) return true;
    // Only thinned axes risk crowding the left edge label with its neighbour.
    if (labelStep > 1 && i < labelStep) return false;
    return (last - i) % labelStep === 0;
  };

  return (
    <View testID="stats-chart" style={{ height }} onLayout={({ nativeEvent: { layout } }) => setWidth(layout.width)}>
      {/* Gridlines first so the bars paint over them. */}
      {ticks.map((v) => (
        <View key={v} style={[styles.tick, { bottom: tickOffset(v) - 6 }]}>
          <Text maxFontSizeMultiplier={1} style={[styles.tickLabel, { width: axisWidth }]} numberOfLines={1}>
            {v}
          </Text>
          <View style={styles.gridline} />
        </View>
      ))}

      <View style={[styles.wrap, { gap: labelStep > 1 ? 2 : 4, marginLeft: axisWidth }]}>
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
            </View>
          );
        })}
      </View>
      <View style={[styles.labels, { left: axisWidth }]}>
        {buckets.map((b, i) => showLabel(i) ? (
          <Text
            key={b.key}
            maxFontSizeMultiplier={1}
            numberOfLines={1}
            style={[styles.label, {
              width: labelWidth,
              left: Math.max(0, Math.min(width - axisWidth - labelWidth,
                ((i + 0.5) / buckets.length) * (width - axisWidth) - labelWidth / 2)),
            }]}
          >{b.label}</Text>
        ) : null)}
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
      paddingBottom: X_LABEL_ROW,
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
      position: 'absolute',
      textAlign: 'center',
    },
    labels: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      height: X_LABEL_ROW - 6,
    },
  });
