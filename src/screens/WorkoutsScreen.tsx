import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '../components/ScreenHeader';
import { useT } from '../i18n/useT';
import type { StringKey } from '../i18n/strings';
import { formatDuration } from '../lib/format';
import { totalScheduledSeconds } from '../timer/schedule';
import { useNavStore } from '../stores/navStore';
import { useTimerStore } from '../stores/timerStore';
import { useWorkoutStore } from '../stores/workoutStore';
import type { WorkoutSession } from '../types';
import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import { difficultyColor, type Palette } from '../theme/palettes';
import { radius, spacing, type FontScale } from '../theme/fitness';

type SubTab = 'presets' | 'custom';

// Screen 4: browse preset & custom workouts.
//
// A card opens in place rather than loading the workout and jumping away, so
// the list stays browsable and every action is deliberate: START loads it into
// the timer, the arrows reorder the list, and edit/delete are custom-only.
// The controls live in the expanded body where each can have a full-size touch
// target, instead of being crammed onto the collapsed row.
export function WorkoutsScreen() {
  const [sub, setSub] = useState<SubTab>('presets');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const presets = useWorkoutStore((s) => s.presets);
  const custom = useWorkoutStore((s) => s.custom);
  const remove = useWorkoutStore((s) => s.remove);
  const move = useWorkoutStore((s) => s.move);
  const setSession = useTimerStore((s) => s.setSession);
  const currentId = useTimerStore((s) => s.currentSession?.id);
  const setTab = useNavStore((s) => s.setTab);
  const setTimerScreen = useNavStore((s) => s.setTimerScreen);
  const openSetup = useNavStore((s) => s.openSetup);
  const c = useTheme();
  const f = useFont();
  const t = useT();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);

  const list = sub === 'presets' ? presets : custom;

  const start = (w: WorkoutSession) => {
    setSession(w);
    setTimerScreen('home');
    setTab('timer');
  };

  // Deleting a workout the user built cannot be undone, and the control sits
  // next to several others, so it asks first.
  const confirmDelete = (w: WorkoutSession) => {
    Alert.alert(t('workouts.deleteTitle'), t('workouts.deleteConfirm', { name: w.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('workouts.delete'),
        style: 'destructive',
        onPress: () => {
          remove(w.id);
          setExpandedId((id) => (id === w.id ? null : id));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('header.workouts')} />

      <View style={styles.subTabs}>
        {(['presets', 'custom'] as SubTab[]).map((key) => (
          <Pressable
            key={key}
            onPress={() => {
              setSub(key);
              setExpandedId(null);
            }}
            style={styles.subTab}
          >
            <Text style={[styles.subTabText, sub === key && styles.subTabActive]}>
              {key === 'presets' ? t('workouts.presets') : t('workouts.mine')}
            </Text>
            {sub === key ? <View style={styles.subTabBar} /> : null}
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {list.length === 0 ? (
          <Text style={styles.empty}>{t('workouts.empty')}</Text>
        ) : (
          <>
            <Text style={styles.hint}>{t('workouts.expandHint')}</Text>
            {list.map((w, i) => {
              const expanded = w.id === expandedId;
              return (
                <View
                  key={w.id}
                  style={[styles.card, w.id === currentId && styles.cardActive]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                    onPress={() => setExpandedId(expanded ? null : w.id)}
                    style={({ pressed }) => [styles.cardHead, pressed && styles.pressed]}
                  >
                    <View style={styles.cardMain}>
                      <Text style={styles.cardName}>{w.name}</Text>
                      <Text style={styles.cardMeta}>
                        {w.workTime}s / {w.restTime}s · {w.rounds} {t('rounds')} ·{' '}
                        {formatDuration(totalScheduledSeconds(w))}
                      </Text>
                    </View>
                    {w.difficulty ? (
                      <View style={[styles.badge, { borderColor: difficultyColor(c, w.difficulty) }]}>
                        <Text style={[styles.badgeText, { color: difficultyColor(c, w.difficulty) }]}>
                          {t(`difficulty.${w.difficulty}` as StringKey)}
                        </Text>
                      </View>
                    ) : null}
                    <Text style={styles.chevron}>{expanded ? '⌃' : '⌄'}</Text>
                  </Pressable>

                  {expanded ? (
                    <View style={styles.cardBody}>
                      <Text style={styles.detail}>
                        {t('field.work')} {w.workTime}s · {t('field.rest')} {w.restTime}s ·{' '}
                        {t('field.rounds')} {w.rounds}
                      </Text>
                      <Text style={styles.detail}>
                        {t('field.prepare')} {w.prepareTime ?? 0}s · {t('field.cooldown')}{' '}
                        {w.cooldownTime ?? 0}s · {t('workouts.total')}{' '}
                        {formatDuration(totalScheduledSeconds(w))}
                      </Text>

                      <View style={styles.actions}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => start(w)}
                          style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
                        >
                          <Text style={styles.startText}>{t('home.start')}</Text>
                        </Pressable>

                        <IconButton
                          styles={styles}
                          label={t('workouts.moveUp')}
                          glyph="▲"
                          disabled={i === 0}
                          onPress={() => move(sub, w.id, 'up')}
                        />
                        <IconButton
                          styles={styles}
                          label={t('workouts.moveDown')}
                          glyph="▼"
                          disabled={i === list.length - 1}
                          onPress={() => move(sub, w.id, 'down')}
                        />

                        {sub === 'custom' ? (
                          <>
                            <IconButton
                              styles={styles}
                              label={t('workouts.edit')}
                              glyph="✎"
                              onPress={() => openSetup(w.id, 'workouts')}
                            />
                            <IconButton
                              styles={styles}
                              label={t('workouts.delete')}
                              glyph="🗑"
                              danger
                              onPress={() => confirmDelete(w)}
                            />
                          </>
                        ) : null}
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.newBtn, pressed && styles.pressed]}
          onPress={() => openSetup(null, 'workouts')}
        >
          <Text style={styles.newText}>{t('workouts.new')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// 44pt square, the smallest comfortable touch target on iOS. The glyphs
// themselves are about half that.
function IconButton({
  styles,
  label,
  glyph,
  onPress,
  disabled,
  danger,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  glyph: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
        pressed && styles.pressed,
        disabled && styles.iconDisabled,
      ]}
    >
      <Text style={[styles.iconGlyph, danger && styles.iconDanger]}>{glyph}</Text>
    </Pressable>
  );
}

const makeStyles = (c: Palette, f: FontScale) =>
  StyleSheet.create({
    container: { flex: 1 },
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
      color: c.muted,
      fontSize: f.subTab,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    subTabActive: {
      color: c.text,
    },
    subTabBar: {
      backgroundColor: c.work,
      borderRadius: radius.pill,
      height: 3,
      marginTop: 6,
      width: '100%',
    },
    body: {
      padding: spacing.lg,
    },
    hint: {
      color: c.muted,
      fontSize: f.small,
      marginBottom: spacing.sm,
    },
    empty: {
      color: c.muted,
      fontSize: f.body,
      lineHeight: 22,
      textAlign: 'center',
    },
    card: {
      backgroundColor: c.surface,
      borderColor: c.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      marginBottom: spacing.sm,
      overflow: 'hidden',
    },
    cardActive: {
      borderColor: c.work,
    },
    cardHead: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.md,
    },
    cardMain: { flex: 1 },
    cardName: {
      color: c.text,
      fontSize: f.label,
      fontWeight: '800',
    },
    cardMeta: {
      color: c.muted,
      fontSize: f.small,
      marginTop: 4,
    },
    chevron: {
      color: c.muted,
      fontSize: 18,
      fontWeight: '800',
    },
    cardBody: {
      borderTopColor: c.border,
      borderTopWidth: 1,
      gap: 4,
      paddingBottom: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },
    detail: {
      color: c.muted,
      fontSize: f.small,
    },
    actions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    startBtn: {
      alignItems: 'center',
      backgroundColor: c.work,
      borderRadius: radius.sm,
      flex: 1,
      paddingVertical: 12,
    },
    startText: {
      color: c.text,
      fontSize: f.small,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    iconBtn: {
      alignItems: 'center',
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    iconGlyph: {
      color: c.muted,
      fontSize: 17,
    },
    iconDanger: {
      color: c.danger,
    },
    iconDisabled: {
      opacity: 0.3,
    },
    badge: {
      borderRadius: radius.sm,
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    badgeText: {
      fontSize: f.chip,
      fontWeight: '800',
      letterSpacing: 1,
    },
    footer: {
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    newBtn: {
      alignItems: 'center',
      backgroundColor: c.work,
      borderRadius: radius.lg,
      paddingVertical: 16,
    },
    newText: {
      color: c.text,
      fontSize: f.body,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    pressed: {
      opacity: 0.85,
    },
  });
