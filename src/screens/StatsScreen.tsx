import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BarChart } from '../components/BarChart';
import { ScreenHeader } from '../components/ScreenHeader';
import { useT } from '../i18n/useT';
import { formatDuration } from '../lib/format';
import { useHistoryStore } from '../stores/historyStore';
import {
  currentStreakDays,
  chartBuckets,
  filterByPeriod,
  filterByPreviousPeriod,
  longestStreakDays,
  percentChange,
  summarize,
  type StatsPeriod,
} from '../stats/aggregate';
import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import type { StringKey } from '../i18n/strings';
import type { Palette } from '../theme/palettes';
import { radius, spacing, type FontScale } from '../theme/fitness';

// Screen 5: stats dashboard. Every figure is derived from real workout history.
export function StatsScreen() {
  const [period, setPeriod] = useState<StatsPeriod>('week');
  const entries = useHistoryStore((s) => s.entries);
  const c = useTheme();
  const f = useFont();
  const t = useT();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);

  const scoped = filterByPeriod(entries, period);
  const summary = summarize(scoped);
  const streak = currentStreakDays(entries);
  const bestStreak = longestStreakDays(entries);
  const buckets = chartBuckets(entries, period);

  // Work time against the equivalent window immediately before this one.
  const previous = summarize(filterByPreviousPeriod(entries, period));
  const workDelta = percentChange(summary.totalWorkSec, previous.totalWorkSec);

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('header.stats')} />

      <View style={styles.periodRow}>
        {(['week', 'month', 'year'] as StatsPeriod[]).map((p) => (
          <Text
            key={p}
            onPress={() => setPeriod(p)}
            style={[styles.period, period === p && styles.periodActive]}
          >
            {t(`period.${p}`)}
          </Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.grid}>
          <Stat styles={styles} label={t('stats.workouts')} value={`${summary.totalWorkouts}`} />
          <Stat styles={styles} label={t('stats.totalTime')} value={formatDuration(summary.totalDurationSec)} />
          <Stat
            styles={styles}
            label={t('stats.activeTime')}
            value={formatDuration(summary.totalWorkSec)}
            hint={t('stats.activeHint')}
          />
          <Stat
            styles={styles}
            label={t('stats.rounds')}
            value={`${summary.totalRounds}`}
            hint={
              summary.completionPct === null
                ? undefined
                : `${summary.completionPct}% ${t('stats.ofPlanned')}`
            }
          />
        </View>

        <View style={styles.trendRow}>
          <Text style={styles.trendLabel}>
            {t(`stats.vs.${period}` as StringKey)} · {t('stats.activeTime')}
          </Text>
          {workDelta === null ? (
            <Text style={styles.trendMuted}>{t('stats.noBaseline')}</Text>
          ) : (
            <Text style={[styles.trendValue, workDelta < 0 && styles.trendDown]}>
              {workDelta >= 0 ? '+' : ''}
              {workDelta}%
            </Text>
          )}
        </View>

        <View style={styles.streakCard}>
          <Text style={styles.streakValue}>🔥 {streak}</Text>
          <Text style={styles.streakLabel}>
            {t('stats.streak')} - {t('stats.bestStreak', { days: bestStreak })}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          {t('stats.workoutTime')} ({t('stats.minutes')})
        </Text>
        <View style={styles.chartCard}>
          <BarChart buckets={buckets} />
        </View>

        {entries.length === 0 ? (
          <Text style={styles.empty}>{t('stats.emptyHistory')}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Stat({
  styles,
  label,
  value,
  hint,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

const makeStyles = (c: Palette, f: FontScale) =>
  StyleSheet.create({
    container: { flex: 1 },
    periodRow: {
      flexDirection: 'row',
      gap: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    period: {
      color: c.muted,
      fontSize: f.period,
      fontWeight: '800',
      letterSpacing: 1.5,
      paddingBottom: spacing.sm,
    },
    periodActive: {
      color: c.work,
    },
    body: { padding: spacing.lg },
    grid: {
      // stretch keeps paired cards the same height when only one has a hint.
      alignItems: 'stretch',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    statCard: {
      backgroundColor: c.surface,
      borderColor: c.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexBasis: '48%',
      flexGrow: 1,
      padding: spacing.md,
    },
    statValue: {
      color: c.text,
      fontSize: f.h2,
      fontWeight: '800',
    },
    statLabel: {
      color: c.muted,
      fontSize: f.small,
      fontWeight: '700',
      letterSpacing: 1,
      marginTop: 4,
    },
    statHint: {
      color: c.muted,
      fontSize: f.micro,
      marginTop: 2,
    },
    trendRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    trendLabel: {
      color: c.muted,
      fontSize: f.small,
      fontWeight: '700',
      letterSpacing: 1,
    },
    trendValue: {
      color: c.rest,
      fontSize: f.small,
      fontWeight: '800',
    },
    trendDown: {
      color: c.muted,
    },
    trendMuted: {
      color: c.muted,
      fontSize: f.small,
      fontWeight: '700',
    },
    streakCard: {
      alignItems: 'center',
      backgroundColor: c.surface,
      borderColor: c.work,
      borderRadius: radius.lg,
      borderWidth: 1,
      marginTop: spacing.sm,
      paddingVertical: spacing.md,
    },
    streakValue: {
      color: c.text,
      fontSize: f.h1,
      fontWeight: '800',
    },
    streakLabel: {
      color: c.muted,
      fontSize: f.small,
      fontWeight: '800',
      letterSpacing: 2,
      marginTop: 2,
    },
    sectionTitle: {
      color: c.text,
      fontSize: f.body,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
    },
    chartCard: {
      backgroundColor: c.surface,
      borderColor: c.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.md,
    },
    empty: {
      color: c.muted,
      fontSize: f.body,
      marginTop: spacing.lg,
      textAlign: 'center',
    },
  });
