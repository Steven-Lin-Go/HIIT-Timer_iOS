import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { useTheme } from '../theme/useTheme';
import type { Palette, RingStyle } from '../theme/palettes';
import { font, radius } from '../theme/fitness';

interface Props {
  time: string;
  phaseLabel: string;
  accent: string;
  subLabel?: string; // e.g. "1 / 8 ROUND"
  size?: number;
  /** 0-1 share of the segment still to run. Omit for a full ring. */
  progress?: number;
  /** Opaque panel behind the readout, for use over a photo backdrop. */
  plate?: boolean;
}

// The ring around the time. Each theme draws it with its own stroke character
// (see RingStyle in palettes.ts) so the four styles differ in form, not just
// hue: Fitness is a hard even band, Bohemia a painted double stroke, Zen an
// open hand-drawn enso, and Natural a thin track with a rounded head.
export function CircularTimer({
  time,
  phaseLabel,
  accent,
  subLabel,
  size = 280,
  progress = 1,
  plate = false,
}: Props) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const spec = RING_SPECS[c.ringStyle];
  const stroke = spec.width;
  const r = (size - stroke - spec.inset * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const arc = circumference * spec.sweep;
  const clamped = Math.max(0, Math.min(1, progress));
  const rotate = `rotate(${spec.rotation} ${cx} ${cy})`;

  // Head position for the styles that cap the progress arc with a dot.
  const headAngle = ((spec.rotation + 360 * spec.sweep * clamped) * Math.PI) / 180;
  const headX = cx + r * Math.cos(headAngle);
  const headY = cy + r * Math.sin(headAngle);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G transform={rotate}>
          {/* Track */}
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={spec.trackColor === 'soft' ? c.motifSoft : c.border}
            strokeWidth={stroke}
            strokeLinecap={spec.cap}
            strokeDasharray={`${arc} ${circumference}`}
            opacity={spec.trackOpacity}
          />
          {/* Zen's second, lighter pass reads as ink bleeding off the brush. */}
          {c.ringStyle === 'enso' ? (
            <Circle
              cx={cx}
              cy={cy}
              r={r - stroke * 0.55}
              fill="none"
              stroke={c.motifInk}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray={`${circumference * (spec.sweep - 0.08)} ${circumference}`}
              opacity={0.35}
            />
          ) : null}
          {/* Progress */}
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth={spec.progressWidth}
            strokeLinecap={spec.cap}
            strokeDasharray={`${arc * clamped} ${circumference}`}
          />
          {/* Bohemia lays a thin inner stroke over the band for a painted edge. */}
          {c.ringStyle === 'brush' ? (
            <Circle
              cx={cx}
              cy={cy}
              r={r - stroke * 0.42}
              fill="none"
              stroke={c.motifInk}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${arc * clamped * 0.94} ${circumference}`}
              opacity={0.4}
            />
          ) : null}
        </G>
        {spec.head && clamped > 0.01 && clamped < 0.995 ? (
          <Circle cx={headX} cy={headY} r={spec.progressWidth * 0.72} fill={accent} />
        ) : null}
      </Svg>

      <View style={styles.center}>
        <View style={[styles.readout, plate && styles.plate]}>
          <Text style={[styles.phase, { color: accent }]}>{phaseLabel}</Text>
          <Text style={styles.time}>{time}</Text>
          {subLabel ? <Text style={styles.sub}>{subLabel}</Text> : null}
        </View>
      </View>
    </View>
  );
}

interface RingSpec {
  width: number;
  progressWidth: number;
  cap: 'butt' | 'round';
  /** Share of the full circle the ring occupies; < 1 leaves an open gap. */
  sweep: number;
  rotation: number;
  inset: number;
  trackColor: 'border' | 'soft';
  trackOpacity: number;
  head: boolean;
}

const RING_SPECS: Record<RingStyle, RingSpec> = {
  bold: {
    width: 10,
    progressWidth: 10,
    cap: 'butt',
    sweep: 1,
    rotation: -90,
    inset: 2,
    trackColor: 'border',
    trackOpacity: 1,
    head: false,
  },
  brush: {
    width: 14,
    progressWidth: 14,
    cap: 'round',
    sweep: 1,
    rotation: -96,
    inset: 2,
    trackColor: 'soft',
    trackOpacity: 0.5,
    head: false,
  },
  enso: {
    width: 9,
    progressWidth: 9,
    cap: 'round',
    sweep: 0.9,
    rotation: -66,
    inset: 4,
    trackColor: 'soft',
    trackOpacity: 0.75,
    head: false,
  },
  fine: {
    width: 4,
    progressWidth: 7,
    cap: 'round',
    sweep: 1,
    rotation: -90,
    inset: 6,
    trackColor: 'border',
    trackOpacity: 1,
    head: true,
  },
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    center: {
      alignItems: 'center',
      bottom: 0,
      justifyContent: 'center',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    readout: {
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    plate: {
      backgroundColor: c.plate,
      borderRadius: radius.xl,
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
      textAlign: 'center',
    },
  });
