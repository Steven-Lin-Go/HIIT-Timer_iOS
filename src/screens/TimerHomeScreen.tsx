import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useHasPhotoBackdrop } from '../components/AppBackdrop';
import { CircularTimer } from '../components/CircularTimer';
import { ScreenHeader } from '../components/ScreenHeader';
import { useT } from '../i18n/useT';
import { formatClock } from '../lib/format';
import { useNavStore } from '../stores/navStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTimerStore } from '../stores/timerStore';
import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import { phaseAccent, type Palette } from '../theme/palettes';
import { radius, spacing, type FontScale } from '../theme/fitness';

// Screen 1: the "Ready to Train" home — session summary, big ring, START.
export function TimerHomeScreen() {
  const session = useTimerStore((s) => s.currentSession);
  const startTimer = useTimerStore((s) => s.startTimer);
  const timeFormat = useSettingsStore((s) => s.timeFormat);
  const setTimerScreen = useNavStore((s) => s.setTimerScreen);
  const openSetup = useNavStore((s) => s.openSetup);
  const c = useTheme();
  const f = useFont();
  const t = useT();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);
  // Over a photo, free-floating labels get an opaque plate so the text never
  // has to compete with whatever the user picked.
  const onPhoto = useHasPhotoBackdrop(true);

  const start = () => {
    startTimer();
    setTimerScreen('run');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('header.timer')} />
      <View style={styles.body}>
        <Text style={[styles.status, onPhoto && styles.plate]}>⚡ {t('home.ready')}</Text>

        <CircularTimer
          time={formatClock(session?.workTime ?? 0, timeFormat)}
          phaseLabel={t('phase.work')}
          accent={phaseAccent(c, 'work')}
          subLabel={`1 / ${session?.rounds ?? 0} ${t('round')}`}
          plate={onPhoto}
        />

        <View style={[styles.upNext, onPhoto && styles.plate]}>
          <Text style={styles.upNextLabel}>{t('home.upNextRest')}</Text>
          <Text style={styles.upNextValue}>
            {formatClock(session?.restTime ?? 0, timeFormat)}
          </Text>
        </View>

        <Text style={[styles.sessionName, onPhoto && styles.plate]}>
          {session?.name ?? t('home.noWorkout')}
        </Text>
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
          <Text style={styles.startText}>{t('home.start')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => openSetup(null)}
          style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
        >
          <Text style={styles.editText}>{t('home.adjust')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette, f: FontScale) =>
  StyleSheet.create({
    container: { flex: 1 },
    body: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    status: {
      color: c.rest,
      fontSize: f.small,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginBottom: spacing.xl,
    },
    upNext: {
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    upNextLabel: {
      color: c.muted,
      fontSize: f.small,
      fontWeight: '700',
      letterSpacing: 1.5,
    },
    upNextValue: {
      color: c.text,
      fontSize: f.h3,
      fontWeight: '800',
      marginTop: 4,
    },
    sessionName: {
      color: c.text,
      fontSize: f.body,
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
      backgroundColor: c.work,
      borderRadius: radius.lg,
      paddingVertical: 18,
    },
    startText: {
      color: c.text,
      fontSize: f.action,
      fontWeight: '800',
      letterSpacing: 2,
    },
    editBtn: {
      alignItems: 'center',
      borderColor: c.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      paddingVertical: 14,
    },
    editText: {
      color: c.muted,
      fontSize: f.small,
      fontWeight: '700',
      letterSpacing: 1.5,
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
