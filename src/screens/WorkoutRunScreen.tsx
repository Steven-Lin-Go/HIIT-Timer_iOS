import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useHasPhotoBackdrop } from '../components/AppBackdrop';
import { CircularTimer } from '../components/CircularTimer';
import { useT } from '../i18n/useT';
import { formatClock } from '../lib/format';
import { useNavStore } from '../stores/navStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTimerStore } from '../stores/timerStore';
import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import { phaseAccent, type Palette } from '../theme/palettes';
import { radius, spacing, type FontScale } from '../theme/fitness';
import { PREPARE_SECONDS } from '../timer/schedule';

// Screen 3: the running workout — ring, round counter, up-next, transport
// controls (prev segment / pause-resume / next segment).
export function WorkoutRunScreen() {
  const {
    currentPhase,
    currentRound,
    currentSession,
    isComplete,
    isPaused,
    timeRemaining,
    totalRounds,
    startTimer,
    pauseTimer,
    resetTimer,
    skip,
  } = useTimerStore();
  const timeFormat = useSettingsStore((s) => s.timeFormat);
  const setTimerScreen = useNavStore((s) => s.setTimerScreen);
  const c = useTheme();
  const f = useFont();
  const t = useT();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);
  const onPhoto = useHasPhotoBackdrop(true);

  const displayPhase = isComplete ? 'complete' : currentPhase;

  // Ring drains as the current segment counts down.
  const phaseTotal = (() => {
    if (!currentSession) return 0;
    if (currentPhase === 'work') return currentSession.workTime;
    if (currentPhase === 'rest') return currentSession.restTime;
    if (currentPhase === 'prepare') return currentSession.prepareTime ?? PREPARE_SECONDS;
    return currentSession.cooldownTime ?? 0;
  })();
  const progress = isComplete || phaseTotal <= 0 ? 1 : timeRemaining / phaseTotal;

  const upNext = (() => {
    if (isComplete) return null;
    if (currentPhase === 'work') return { label: t('phase.rest'), value: currentSession?.restTime ?? 0 };
    if (currentPhase === 'rest') return { label: t('phase.work'), value: currentSession?.workTime ?? 0 };
    if (currentPhase === 'prepare') return { label: t('phase.work'), value: currentSession?.workTime ?? 0 };
    return null;
  })();

  const finish = () => {
    resetTimer();
    setTimerScreen('home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" onPress={finish} hitSlop={10}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <Text style={[styles.round, onPhoto && styles.plate]}>
          {t('round')} {Math.min(currentRound, totalRounds)} / {totalRounds}
        </Text>
        <View style={styles.closeSpacer} />
      </View>

      <View style={styles.body}>
        <CircularTimer
          time={isComplete ? '✓' : formatClock(timeRemaining, timeFormat)}
          phaseLabel={t(`phase.${displayPhase}`)}
          accent={phaseAccent(c, displayPhase)}
          subLabel={currentSession?.name}
          size={300}
          progress={progress}
          plate={onPhoto}
        />

        {upNext ? (
          <View style={[styles.upNext, onPhoto && styles.plate]}>
            <Text style={styles.upNextLabel}>{t('run.upNext')} · {upNext.label}</Text>
            <Text style={styles.upNextValue}>{formatClock(upNext.value, timeFormat)}</Text>
          </View>
        ) : (
          <Text style={[styles.completeText, isComplete && onPhoto && styles.plate]}>
            {isComplete ? t('run.complete') : ' '}
          </Text>
        )}
      </View>

      {isComplete ? (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            onPress={() => startTimer()}
          >
            <Text style={styles.primaryText}>{t('run.restart')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
            onPress={finish}
          >
            <Text style={styles.secondaryText}>{t('run.finish')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.transport}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
            onPress={() => skip('back')}
          >
            <Text style={styles.sideIcon}>⏮</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.playBtn, pressed && styles.pressed]}
            onPress={() => (isPaused ? startTimer() : pauseTimer())}
          >
            <Text style={styles.playIcon}>{isPaused ? '▶' : '❙❙'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
            onPress={() => skip('forward')}
          >
            <Text style={styles.sideIcon}>⏭</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const makeStyles = (c: Palette, f: FontScale) =>
  StyleSheet.create({
    container: { flex: 1 },
    topRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    close: {
      color: c.muted,
      fontSize: 22,
      fontWeight: '700',
    },
    closeSpacer: { width: 22 },
    round: {
      color: c.text,
      fontSize: f.body,
      fontWeight: '800',
      letterSpacing: 2,
    },
    body: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    upNext: {
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    upNextLabel: {
      color: c.muted,
      fontSize: f.timerLabel,
      fontWeight: '700',
      letterSpacing: 1.5,
    },
    upNextValue: {
      color: c.text,
      fontSize: f.h3,
      fontWeight: '800',
      marginTop: 4,
    },
    completeText: {
      color: c.rest,
      fontSize: f.h3,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginTop: spacing.xl,
    },
    transport: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.xl,
      justifyContent: 'center',
      paddingBottom: spacing.xl,
    },
    sideBtn: {
      alignItems: 'center',
      backgroundColor: c.surfaceAlt,
      borderRadius: radius.pill,
      height: 56,
      justifyContent: 'center',
      width: 56,
    },
    sideIcon: {
      color: c.text,
      fontSize: 20,
    },
    playBtn: {
      alignItems: 'center',
      backgroundColor: c.work,
      borderRadius: radius.pill,
      height: 80,
      justifyContent: 'center',
      width: 80,
    },
    playIcon: {
      color: c.text,
      fontSize: 26,
      fontWeight: '800',
    },
    actions: {
      gap: spacing.sm,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    primary: {
      alignItems: 'center',
      backgroundColor: c.work,
      borderRadius: radius.lg,
      paddingVertical: 16,
    },
    primaryText: {
      color: c.text,
      fontSize: f.body,
      fontWeight: '800',
      letterSpacing: 2,
    },
    secondary: {
      alignItems: 'center',
      borderColor: c.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      paddingVertical: 14,
    },
    secondaryText: {
      color: c.muted,
      fontSize: f.small,
      fontWeight: '800',
      letterSpacing: 2,
    },
    plate: {
      backgroundColor: c.plate,
      borderRadius: radius.md,
      overflow: 'hidden',
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    pressed: { opacity: 0.85 },
  });
