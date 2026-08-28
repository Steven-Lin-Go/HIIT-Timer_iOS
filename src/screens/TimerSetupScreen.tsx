import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ScreenHeader } from '../components/ScreenHeader';
import { Stepper } from '../components/Stepper';
import { formatClock } from '../lib/format';
import { useNavStore } from '../stores/navStore';
import { useTimerStore } from '../stores/timerStore';
import { useWorkoutStore } from '../stores/workoutStore';
import type { WorkoutDraft } from '../stores/workoutOps';
import { colors, font, radius, spacing } from '../theme/fitness';

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
      <ScreenHeader title="TIMER SETUP" onBack={() => setTimerScreen('home')} right="none" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.fieldLabel}>NAME</Text>
        <TextInput
          value={draft.name}
          onChangeText={(name) => patch({ name })}
          placeholder="Workout name"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <View style={styles.card}>
          <Stepper
            label="Work"
            value={draft.workTime}
            accent={colors.work}
            step={5}
            min={5}
            format={(v) => formatClock(v)}
            onChange={(workTime) => patch({ workTime })}
          />
          <Stepper
            label="Rest"
            value={draft.restTime}
            accent={colors.rest}
            step={5}
            min={0}
            format={(v) => formatClock(v)}
            onChange={(restTime) => patch({ restTime })}
          />
          <Stepper
            label="Rounds"
            value={draft.rounds}
            accent={colors.prepare}
            step={1}
            min={1}
            max={99}
            onChange={(rounds) => patch({ rounds })}
          />
          <Stepper
            label="Prepare Time"
            value={draft.prepareTime}
            accent={colors.prepare}
            step={5}
            min={0}
            format={(v) => formatClock(v)}
            onChange={(prepareTime) => patch({ prepareTime })}
          />
          <Stepper
            label="Cool Down"
            value={draft.cooldownTime}
            accent={colors.cooldown}
            step={5}
            min={0}
            format={(v) => formatClock(v)}
            onChange={(cooldownTime) => patch({ cooldownTime })}
          />
        </View>

        <Text style={styles.fieldLabel}>TIMER MODE</Text>
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
              STANDARD
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
              TABATA
            </Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>STANDARD 40s/20s · TABATA 20s/10s × 8</Text>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.useBtn, pressed && styles.pressed]}
          onPress={use}
        >
          <Text style={styles.useText}>USE</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
          onPress={save}
        >
          <Text style={styles.saveText}>{editingId ? 'SAVE CHANGES' : 'SAVE WORKOUT'}</Text>
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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: font.small,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
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
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 1,
    paddingVertical: 12,
  },
  modeBtnActive: {
    backgroundColor: colors.dutchOrange,
    borderColor: colors.dutchOrange,
  },
  modeText: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  modeTextActive: {
    color: '#1A0E00',
  },
  hint: {
    color: colors.muted,
    fontSize: font.small,
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
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 16,
  },
  useText: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  saveBtn: {
    alignItems: 'center',
    backgroundColor: colors.work,
    borderRadius: radius.lg,
    flex: 1.4,
    paddingVertical: 16,
  },
  saveText: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
