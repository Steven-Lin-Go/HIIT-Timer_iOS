import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '../components/ScreenHeader';
import { formatDuration } from '../lib/format';
import { totalScheduledSeconds } from '../timer/schedule';
import { useNavStore } from '../stores/navStore';
import { useTimerStore } from '../stores/timerStore';
import { useWorkoutStore } from '../stores/workoutStore';
import type { WorkoutSession } from '../types';
import { colors, difficultyColor, font, radius, spacing } from '../theme/fitness';

type SubTab = 'presets' | 'custom';

// Screen 4: browse preset & custom workouts. Tap a card to load it into the
// timer; custom cards can be edited or deleted.
export function WorkoutsScreen() {
  const [sub, setSub] = useState<SubTab>('presets');
  const presets = useWorkoutStore((s) => s.presets);
  const custom = useWorkoutStore((s) => s.custom);
  const remove = useWorkoutStore((s) => s.remove);
  const setSession = useTimerStore((s) => s.setSession);
  const currentId = useTimerStore((s) => s.currentSession?.id);
  const setTab = useNavStore((s) => s.setTab);
  const setTimerScreen = useNavStore((s) => s.setTimerScreen);
  const openSetup = useNavStore((s) => s.openSetup);

  const list = sub === 'presets' ? presets : custom;

  const select = (w: WorkoutSession) => {
    setSession(w);
    setTimerScreen('home');
    setTab('timer');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="WORKOUTS" />

      <View style={styles.subTabs}>
        {(['presets', 'custom'] as SubTab[]).map((key) => (
          <Pressable key={key} onPress={() => setSub(key)} style={styles.subTab}>
            <Text style={[styles.subTabText, sub === key && styles.subTabActive]}>
              {key === 'presets' ? 'PRESETS' : 'MY WORKOUTS'}
            </Text>
            {sub === key ? <View style={styles.subTabBar} /> : null}
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {list.length === 0 ? (
          <Text style={styles.empty}>No custom workouts yet. Tap NEW to create one.</Text>
        ) : (
          list.map((w) => (
            <Pressable
              key={w.id}
              onPress={() => select(w)}
              style={({ pressed }) => [
                styles.card,
                w.id === currentId && styles.cardActive,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cardMain}>
                <Text style={styles.cardName}>{w.name}</Text>
                <Text style={styles.cardMeta}>
                  {w.workTime}s / {w.restTime}s · {w.rounds} rounds ·{' '}
                  {formatDuration(totalScheduledSeconds(w))}
                </Text>
              </View>
              {w.difficulty ? (
                <View
                  style={[
                    styles.badge,
                    { borderColor: difficultyColor[w.difficulty] ?? colors.muted },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: difficultyColor[w.difficulty] ?? colors.muted },
                    ]}
                  >
                    {w.difficulty}
                  </Text>
                </View>
              ) : null}
              {sub === 'custom' ? (
                <View style={styles.rowActions}>
                  <Pressable hitSlop={8} onPress={() => openSetup(w.id)}>
                    <Text style={styles.editIcon}>✎</Text>
                  </Pressable>
                  <Pressable hitSlop={8} onPress={() => remove(w.id)}>
                    <Text style={styles.deleteIcon}>🗑</Text>
                  </Pressable>
                </View>
              ) : null}
            </Pressable>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.newBtn, pressed && styles.pressed]}
          onPress={() => openSetup(null)}
        >
          <Text style={styles.newText}>+ NEW WORKOUT</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subTabs: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  subTab: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  subTabText: {
    color: colors.muted,
    fontSize: font.small,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  subTabActive: {
    color: colors.text,
  },
  subTabBar: {
    backgroundColor: colors.work,
    borderRadius: radius.pill,
    height: 3,
    marginTop: 6,
    width: 28,
  },
  body: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  empty: {
    color: colors.muted,
    fontSize: font.body,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardActive: {
    borderColor: colors.work,
  },
  cardMain: {
    flex: 1,
  },
  cardName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  cardMeta: {
    color: colors.muted,
    fontSize: font.small,
    marginTop: 4,
  },
  badge: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginLeft: spacing.sm,
  },
  editIcon: {
    color: colors.muted,
    fontSize: 18,
  },
  deleteIcon: {
    fontSize: 16,
  },
  footer: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  newBtn: {
    alignItems: 'center',
    backgroundColor: colors.work,
    borderRadius: radius.lg,
    paddingVertical: 16,
  },
  newText: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
