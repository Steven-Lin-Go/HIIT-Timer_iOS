import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useHasPhotoBackdrop } from '../components/AppBackdrop';
import { TimerLayout } from '../components/TimerLayout';
import { CircularTimer } from '../components/CircularTimer';
import { CloseIcon } from '../components/CloseIcon';
import { TransportIcon } from '../components/TransportIcon';
import { useT } from '../i18n/useT';
import { formatClock } from '../lib/format';
import { useNavStore } from '../stores/navStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTimerStore } from '../stores/timerStore';
import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import { phaseAccent, type Palette } from '../theme/palettes';
import { radius, spacing, type FontScale } from '../theme/fitness';
import { countdownProgress } from '../timer/schedule';

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
  const progress = countdownProgress({
    phase: currentPhase,
    timeRemaining,
    session: currentSession,
    isComplete,
  });

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
    <View testID="run-screen" style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('run.finish')}
          onPress={finish}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        >
          <CloseIcon color={c.work} />
        </Pressable>
        <Text style={[styles.round, onPhoto && styles.plate]}>
          {t('round')} {Math.min(currentRound, totalRounds)} / {totalRounds}
        </Text>
        <View style={styles.closeSpacer} />
      </View>

      <TimerLayout
        actions={
          isComplete ? (
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
                onPress={() => startTimer()}
              >
                <Text style={styles.primaryText}>{t('run.restart')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
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
                accessibilityLabel={t('run.previous')}
                accessibilityState={{ disabled: isPaused }}
                disabled={isPaused}
                style={({ pressed }) => [styles.transportBtn, isPaused && styles.disabled, pressed && styles.pressed]}
                testID="run-previous" onPress={() => skip('back')}
              >
                <TransportIcon name="previous" color={c.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t(isPaused ? 'run.resume' : 'run.pause')}
                style={({ pressed }) => [styles.transportBtn, styles.pauseBtn, pressed && styles.pressed]}
                testID="run-pause" onPress={() => (isPaused ? startTimer() : pauseTimer())}
              >
                <TransportIcon name={isPaused ? 'resume' : 'pause'} color={c.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('run.next')}
                accessibilityState={{ disabled: isPaused }}
                disabled={isPaused}
                style={({ pressed }) => [styles.transportBtn, isPaused && styles.disabled, pressed && styles.pressed]}
                testID="run-next" onPress={() => skip('forward')}
              >
                <TransportIcon name="next" color={c.text} />
              </Pressable>
            </View>
          )
        }
      >
        {(ringSize) => (
          <>
            <CircularTimer
              time={isComplete ? '✓' : formatClock(timeRemaining, timeFormat)}
              phaseLabel={t(`phase.${displayPhase}`)}
              accent={phaseAccent(c, displayPhase)}
              size={ringSize}
              progress={progress}
              progressKey={`${currentPhase}-${currentRound}`}
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
            <Text style={[styles.sessionName, onPhoto && styles.plate]}>{currentSession?.name}</Text>
          </>
        )}
      </TimerLayout>
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
    closeButton: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    closeSpacer: { width: 44 },
    round: {
      flex: 1,
      textAlign: 'center',
      color: c.text,
      fontSize: f.timerRound,
      fontWeight: '800',
      letterSpacing: 2,
    },
    sessionName: {
      color: c.text,
      fontSize: f.body,
      fontWeight: '700',
      textAlign: 'center',
      maxWidth: '100%',
    },
    upNext: {
      alignItems: 'center',
    },
    upNextLabel: {
      textAlign: 'center',
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
      textAlign: 'center',
      color: c.rest,
      fontSize: f.h3,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    transport: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.md,
      justifyContent: 'center',
      paddingBottom: spacing.xl,
    },
    transportBtn: {
      alignItems: 'center',
      backgroundColor: c.surfaceAlt,
      borderColor: c.border,
      borderRadius: radius.pill,
      borderWidth: 1,
      height: 64,
      justifyContent: 'center',
      width: 64,
    },
    pauseBtn: {
      backgroundColor: c.work,
      borderColor: c.work,
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
    disabled: { opacity: 0.4 },
  });
