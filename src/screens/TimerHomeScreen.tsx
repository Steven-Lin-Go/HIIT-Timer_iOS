import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CircularTimer } from '../components/CircularTimer';
import { ScreenHeader } from '../components/ScreenHeader';
import { formatClock } from '../lib/format';
import { useNavStore } from '../stores/navStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTimerStore } from '../stores/timerStore';
import { colors, font, radius, spacing } from '../theme/fitness';

// Screen 1: the "Ready to Train" home — session summary, big ring, START.
export function TimerHomeScreen() {
  const session = useTimerStore((s) => s.currentSession);
  const startTimer = useTimerStore((s) => s.startTimer);
  const timeFormat = useSettingsStore((s) => s.timeFormat);
  const setTimerScreen = useNavStore((s) => s.setTimerScreen);
  const openSetup = useNavStore((s) => s.openSetup);

  const start = () => {
    startTimer();
    setTimerScreen('run');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="HIIT TIMER" />
      <View style={styles.body}>
        <Text style={styles.status}>⚡ READY TO TRAIN</Text>

        <CircularTimer
          time={formatClock(session?.workTime ?? 0, timeFormat)}
          phaseLabel="WORK"
          accent={colors.work}
          subLabel={`1 / ${session?.rounds ?? 0} ROUND`}
        />

        <View style={styles.upNext}>
          <Text style={styles.upNextLabel}>UP NEXT · REST</Text>
          <Text style={styles.upNextValue}>
            {formatClock(session?.restTime ?? 0, timeFormat)}
          </Text>
        </View>

        <Text style={styles.sessionName}>{session?.name ?? 'NO WORKOUT'}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={!session}
          onPress={start}
          style={({ pressed }) => [
            styles.startBtn,
            pressed && styles.pressed,
            !session && styles.disabled,
          ]}
        >
          <Text style={styles.startText}>START</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => openSetup(null)}
          style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
        >
          <Text style={styles.editText}>ADJUST TIMER</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  status: {
    color: colors.rest,
    fontSize: font.small,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: spacing.xl,
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
  sessionName: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  startBtn: {
    alignItems: 'center',
    backgroundColor: colors.work,
    borderRadius: radius.lg,
    paddingVertical: 18,
  },
  startText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  editBtn: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 14,
  },
  editText: {
    color: colors.muted,
    fontSize: font.small,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
});
