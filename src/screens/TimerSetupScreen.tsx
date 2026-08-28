import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ScreenHeader } from '../components/ScreenHeader';
import { Stepper } from '../components/Stepper';
import { useT } from '../i18n/useT';
import { formatClock } from '../lib/format';
import { useNavStore } from '../stores/navStore';
import { useTimerStore } from '../stores/timerStore';
import { useWorkoutStore } from '../stores/workoutStore';
import type { WorkoutDraft } from '../stores/workoutOps';
import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import type { Palette } from '../theme/palettes';
import { radius, spacing, type FontScale } from '../theme/fitness';

const STANDARD: Partial<WorkoutDraft> = { workTime: 40, restTime: 20, rounds: 8 };
const TABATA: Partial<WorkoutDraft> = { workTime: 20, restTime: 10, rounds: 8 };

type TimerMode = 'standard' | 'tabata' | null;

// Which preset the current work/rest/rounds match, so the button can highlight.
const detectMode = (d: Pick<WorkoutDraft, 'workTime' | 'restTime' | 'rounds'>): TimerMode => {
  const eq = (m: Partial<WorkoutDraft>) =>
    d.workTime === m.workTime && d.restTime === m.restTime && d.rounds === m.rounds;
  if (eq(TABATA)) return 'tabata';
  if (eq(STANDARD)) return 'standard';
  return null;
};

// Screen 2: create/edit a workout's timing. SAVE persists a custom workout and
// applies it; USE applies the values to the timer without saving.
export function TimerSetupScreen() {
  const editingId = useNavStore((s) => s.editingWorkoutId);
  const setTimerScreen = useNavStore((s) => s.setTimerScreen);
  const setTab = useNavStore((s) => s.setTab);
  const currentSession = useTimerStore((s) => s.currentSession);
  const setSession = useTimerStore((s) => s.setSession);
  const getById = useWorkoutStore((s) => s.getById);
  const addWorkout = useWorkoutStore((s) => s.add);
  const updateWorkout = useWorkoutStore((s) => s.update);
  const c = useTheme();
  const f = useFont();
  const t = useT();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);

  const seed = editingId ? getById(editingId) : currentSession;

  const [draft, setDraft] = useState<WorkoutDraft>({
    name: editingId ? (seed?.name ?? 'My Workout') : 'My Workout',
    workTime: seed?.workTime ?? 40,
    restTime: seed?.restTime ?? 20,
    rounds: seed?.rounds ?? 8,
    prepareTime: seed?.prepareTime ?? 10,
    cooldownTime: seed?.cooldownTime ?? 0,
    difficulty: seed?.difficulty ?? 'MEDIUM',
  });

  const patch = (p: Partial<WorkoutDraft>) => setDraft((d) => ({ ...d, ...p }));
  const mode = detectMode(draft);

  const applyToTimer = () =>
    setSession({
      id: editingId ?? 'adhoc',
      isPreset: false,
      createdAt: new Date(),
      ...draft,
    });

  const use = () => {
    applyToTimer();
    setTimerScreen('home');
  };

  const save = () => {
    if (editingId) {
      updateWorkout(editingId, draft);
    } else {
      addWorkout(draft);
    }
    applyToTimer();
    setTab('workouts');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('header.setup')} onBack={() => setTimerScreen('home')} right="none" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.fieldLabel}>{t('setup.name')}</Text>
        <TextInput
          value={draft.name}
          onChangeText={(name) => patch({ name })}
          placeholder={t('setup.namePlaceholder')}
          placeholderTextColor={c.muted}
          style={styles.input}
        />

        <View style={styles.card}>
          <Stepper
            label={t('field.work')}
            value={draft.workTime}
            accent={c.work}
            step={5}
            min={5}
            format={(v) => formatClock(v)}
            onChange={(workTime) => patch({ workTime })}
          />
          <Stepper
            label={t('field.rest')}
            value={draft.restTime}
            accent={c.rest}
            step={5}
            min={0}
            format={(v) => formatClock(v)}
            onChange={(restTime) => patch({ restTime })}
          />
          <Stepper
            label={t('field.rounds')}
            value={draft.rounds}
            accent={c.prepare}
            step={1}
            min={1}
            max={99}
            onChange={(rounds) => patch({ rounds })}
          />
          <Stepper
            label={t('field.prepare')}
            value={draft.prepareTime}
            accent={c.prepare}
            step={5}
            min={0}
            format={(v) => formatClock(v)}
            onChange={(prepareTime) => patch({ prepareTime })}
          />
          <Stepper
            label={t('field.cooldown')}
            value={draft.cooldownTime}
            accent={c.cooldown}
            step={5}
            min={0}
            format={(v) => formatClock(v)}
            onChange={(cooldownTime) => patch({ cooldownTime })}
          />
        </View>

        <Text style={styles.fieldLabel}>{t('setup.timerMode')}</Text>
        <View style={styles.modeRow}>
          <Pressable
            style={({ pressed }) => [
              styles.modeBtn,
              mode === 'standard' && styles.modeBtnActive,
              pressed && styles.pressed,
            ]}
            onPress={() => patch(STANDARD)}
          >
            <Text style={[styles.modeText, mode === 'standard' && styles.modeTextActive]}>
              {t('setup.standard')}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.modeBtn,
              mode === 'tabata' && styles.modeBtnActive,
              pressed && styles.pressed,
            ]}
            onPress={() => patch(TABATA)}
          >
            <Text style={[styles.modeText, mode === 'tabata' && styles.modeTextActive]}>
              {t('setup.tabata')}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>{t('setup.modeHint')}</Text>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.useBtn, pressed && styles.pressed]}
          onPress={use}
        >
          <Text style={styles.useText}>{t('setup.use')}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
          onPress={save}
        >
          <Text style={styles.saveText}>
            {editingId ? t('setup.saveChanges') : t('setup.saveNew')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette, f: FontScale) =>
  StyleSheet.create({
    container: { flex: 1 },
    body: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    fieldLabel: {
      color: c.muted,
      fontSize: f.small,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    input: {
      backgroundColor: c.surface,
      borderColor: c.border,
      borderRadius: radius.md,
      borderWidth: 1,
      color: c.text,
      fontSize: f.label,
      fontWeight: '700',
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
    },
    card: {
      backgroundColor: c.surface,
      borderColor: c.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
    },
    modeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    modeBtn: {
      alignItems: 'center',
      backgroundColor: c.surfaceAlt,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: 'transparent',
      flex: 1,
      paddingVertical: 12,
    },
    modeBtnActive: {
      backgroundColor: c.dutchOrange,
      borderColor: c.dutchOrange,
    },
    modeText: {
      color: c.text,
      fontSize: f.small,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    modeTextActive: {
      color: '#1A0E00',
    },
    hint: {
      color: c.muted,
      fontSize: f.small,
      marginTop: spacing.sm,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    useBtn: {
      alignItems: 'center',
      borderColor: c.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      flex: 1,
      paddingVertical: 16,
    },
    useText: {
      color: c.text,
      fontSize: f.body,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    saveBtn: {
      alignItems: 'center',
      backgroundColor: c.work,
      borderRadius: radius.lg,
      flex: 1.4,
      paddingVertical: 16,
    },
    saveText: {
      color: c.text,
      fontSize: f.body,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    pressed: { opacity: 0.85 },
  });
