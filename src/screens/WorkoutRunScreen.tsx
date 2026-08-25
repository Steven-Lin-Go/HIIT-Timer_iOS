import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CircularTimer } from '../components/CircularTimer';
import { formatClock } from '../lib/format';
import { useNavStore } from '../stores/navStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTimerStore } from '../stores/timerStore';
import { colors, font, PHASE_META, radius, spacing } from '../theme/fitness';

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

  const displayPhase = isComplete ? 'complete' : currentPhase;
  const meta = PHASE_META[displayPhase];

  const upNext = (() => {
    if (isComplete) return null;
    if (currentPhase === 'work') return { label: 'REST', value: currentSession?.restTime ?? 0 };
    if (currentPhase === 'rest') return { label: 'WORK', value: currentSession?.workTime ?? 0 };
    if (currentPhase === 'prepare') return { label: 'WORK', value: currentSession?.workTime ?? 0 };
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
        <Text style={styles.round}>
          ROUND {Math.min(currentRound, totalRounds)} / {totalRounds}
        </Text>
        <View style={styles.closeSpacer} />
      </View>

      <View style={styles.body}>
        <CircularTimer
          time={isComplete ? '✓' : formatClock(timeRemaining, timeFormat)}
          phaseLabel={meta.label}
          accent={meta.accent}
          subLabel={currentSession?.name}
          size={300}
        />

        {upNext ? (
          <View style={styles.upNext}>
            <Text style={styles.upNextLabel}>UP NEXT · {upNext.label}</Text>
            <Text style={styles.upNextValue}>{formatClock(upNext.value, timeFormat)}</Text>
          </View>
        ) : (
          <Text style={styles.completeText}>
            {isComplete ? 'WORKOUT COMPLETE' : ' '}
          </Text>
        )}
      </View>

      {isComplete ? (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            onPress={() => {
              startTimer();
            }}
          >
            <Text style={styles.primaryText}>RESTART</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
            onPress={finish}
          >
            <Text style={styles.secondaryText}>FINISH</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  close: {
    color: colors.muted,
    fontSize: 22,
    fontWeight: '700',
  },
  closeSpacer: {
    width: 22,
  },
  round: {
    color: colors.text,
    fontSize: font.body,
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
    color: colors.muted,
    fontSize: font.small,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  upNextValue: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '800',
    marginTop: 4,
  },
  completeText: {
    color: colors.rest,
    fontSize: font.h3,
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
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  sideIcon: {
    color: colors.text,
    fontSize: 20,
  },
  playBtn: {
    alignItems: 'center',
    backgroundColor: colors.work,
    borderRadius: radius.pill,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  playIcon: {
    color: colors.text,
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
    backgroundColor: colors.work,
    borderRadius: radius.lg,
    paddingVertical: 16,
  },
  primaryText: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
    letterSpacing: 2,
  },
  secondary: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 14,
  },
  secondaryText: {
    color: colors.muted,
    fontSize: font.small,
    fontWeight: '800',
    letterSpacing: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});
