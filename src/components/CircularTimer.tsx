import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import type { Palette, RingStyle } from '../theme/palettes';
import { radius, type FontScale } from '../theme/fitness';

interface Props {
  time: string;
  phaseLabel: string;
  accent: string;
  subLabel?: string; // e.g. "1 / 8 ROUND"
  size?: number;
  /** 0-1 share of the current interval still remaining. */
  progress?: number;
  /** Opaque panel behind the readout, for use over a photo backdrop. */
  plate?: boolean;
}

// The ring around the time. Each theme draws it with its own stroke character
// (see RingStyle in palettes.ts) so the four styles differ in form, not just
// hue: Fitness is a hard even band, Bohemian a painted double stroke, Zen a
// hand-drawn ink circle, and Natural a fine rounded ring. Every
// style keeps a closed track so the timer boundary remains visually complete.
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
  const f = useFont();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);

  const spec = RING_SPECS[c.ringStyle];
  const stroke = spec.width;
  const r = (size - stroke - spec.inset * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const progressDash =
    clampedProgress >= 0.999999
      ? undefined
      : `${circumference * clampedProgress} ${circumference}`;
  const brushRadius = r - stroke * 0.42;
  const brushCircumference = 2 * Math.PI * brushRadius;
  const brushDash =
    clampedProgress >= 0.999999
      ? undefined
      : `${brushCircumference * clampedProgress} ${brushCircumference}`;

  return (
    <View testID="timer-ring" style={{ width: size, height: size, flexShrink: 0 }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* A closed base track preserves the timer boundary in every theme. */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={spec.trackColor === 'soft' ? c.motifSoft : c.border}
          strokeWidth={stroke}
          strokeLinecap={spec.cap}
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
            opacity={0.35}
          />
        ) : null}
        {/* The phase-colored arc drains clockwise with the remaining time. */}
        {clampedProgress > 0 ? (
          <G testID="timer-progress" transform={`rotate(-90 ${cx} ${cy})`}>
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={accent}
              strokeWidth={spec.accentWidth}
              strokeLinecap={spec.cap}
              strokeDasharray={progressDash}
            />
            {/* Bohemian keeps its painted inner edge synchronized with progress. */}
            {c.ringStyle === 'brush' ? (
              <Circle
                cx={cx}
                cy={cy}
                r={brushRadius}
                fill="none"
                stroke={c.motifInk}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={brushDash}
                opacity={0.4}
              />
            ) : null}
          </G>
        ) : null}
      </Svg>

      <View style={styles.center}>
        <View testID="timer-readout" style={[styles.readout, { paddingVertical: size * 0.02 }, plate && styles.plate]}>
          <Text
            testID="timer-phase"
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.2}
            style={[styles.phase, { color: accent, fontSize: Math.min(f.timerLabel, size * 0.075) }]}
          >{phaseLabel}</Text>
          <Text
            testID="timer-time"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
            maxFontSizeMultiplier={1}
            style={[styles.time, { fontSize: Math.min(f.timer, size * 0.205, size * 0.64 / (time.length * 0.65)) }]}
          >
            {time}
          </Text>
          {subLabel ? (
            <Text
              testID="timer-sub"
              numberOfLines={1}
              adjustsFontSizeToFit
              maxFontSizeMultiplier={1.2}
              style={[styles.sub, { fontSize: Math.min(f.timerSub, size * 0.065) }]}
            >{subLabel}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

interface RingSpec {
  width: number;
  accentWidth: number;
  cap: 'butt' | 'round';
  inset: number;
  trackColor: 'border' | 'soft';
  trackOpacity: number;
}

const RING_SPECS: Record<RingStyle, RingSpec> = {
  bold: {
    width: 10,
    accentWidth: 10,
    cap: 'butt',
    inset: 2,
    trackColor: 'border',
    trackOpacity: 1,
  },
  brush: {
    width: 14,
    accentWidth: 14,
    cap: 'round',
    inset: 2,
    trackColor: 'soft',
    trackOpacity: 0.5,
  },
  enso: {
    width: 9,
    accentWidth: 9,
    cap: 'round',
    inset: 4,
    trackColor: 'soft',
    trackOpacity: 0.75,
  },
  fine: {
    width: 4,
    accentWidth: 7,
    cap: 'round',
    inset: 6,
    trackColor: 'border',
    trackOpacity: 1,
  },
};

const makeStyles = (c: Palette, f: FontScale) =>
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
      width: '66%',
      paddingHorizontal: 2,
    },
    plate: {
      backgroundColor: c.plate,
      borderRadius: radius.xl,
    },
    phase: {
      width: '90%',
      textAlign: 'center',
      fontSize: f.timerLabel,
      fontWeight: '800',
      letterSpacing: 0,
    },
    time: {
      width: '100%',
      textAlign: 'center',
      fontVariant: ['tabular-nums'],
      color: c.text,
      fontSize: f.timer,
      fontWeight: '800',
      letterSpacing: 0,
      marginTop: 4,
    },
    sub: {
      width: '90%',
      color: c.muted,
      fontSize: f.timerSub,
      fontWeight: '700',
      letterSpacing: 0,
      marginTop: 6,
      textAlign: 'center',
    },
  });
