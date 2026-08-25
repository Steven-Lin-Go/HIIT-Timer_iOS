import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BarChart } from '../components/BarChart';
import { ScreenHeader } from '../components/ScreenHeader';
import { formatDuration } from '../lib/format';
import { useHistoryStore } from '../stores/historyStore';
import {
  currentStreakDays,
  dailyBuckets,
  filterByPeriod,
  summarize,
  type StatsPeriod,
} from '../stats/aggregate';
import { colors, font, radius, spacing } from '../theme/fitness';

// Screen 5: stats dashboard. All figures are derived from real workout history;
// heart rate is intentionally omitted (needs HealthKit).
export function StatsScreen() {
  const [period, setPeriod] = useState<StatsPeriod>('week');
  const entries = useHistoryStore((s) => s.entries);

  const scoped = filterByPeriod(entries, period);
  const summary = summarize(scoped);
  const streak = currentStreakDays(entries);
  const buckets = dailyBuckets(entries, period);

  return (
    <View style={styles.container}>
      <ScreenHeader title="STATS" />

      <View style={styles.periodRow}>
        {(['week', 'month', 'year'] as StatsPeriod[]).map((p) => (
          <Text
            key={p}
            onPress={() => setPeriod(p)}
            style={[styles.period, period === p && styles.periodActive]}
          >
            {p.toUpperCase()}
          </Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.grid}>
          <Stat label="WORKOUTS" value={`${summary.totalWorkouts}`} />
          <Stat label="TOTAL TIME" value={formatDuration(summary.totalDurationSec)} />
          <Stat label="CALORIES" value={`${summary.totalCalories}`} hint="est." />
          <Stat label="AVG / SESSION" value={formatDuration(summary.avgDurationSec)} />
        </View>

        <View style={styles.streakCard}>
          <Text style={styles.streakValue}>🔥 {streak}</Text>
          <Text style={styles.streakLabel}>DAY STREAK</Text>
        </View>

        <Text style={styles.sectionTitle}>WORKOUT TIME</Text>
        <View style={styles.chartCard}>
          <BarChart buckets={buckets} />
        </View>

        {entries.length === 0 ? (
          <Text style={styles.empty}>
            Complete a workout to start tracking your stats.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>
        {label}
        {hint ? <Text style={styles.statHint}> {hint}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  period: {
    color: colors.muted,
    fontSize: font.small,
    fontWeight: '800',
    letterSpacing: 1.5,
    paddingBottom: spacing.sm,
  },
  periodActive: {
    color: colors.work,
  },
  body: {
    padding: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    padding: spacing.md,
  },
  statValue: {
    color: colors.text,
    fontSize: font.h2,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.muted,
    fontSize: font.small,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  statHint: {
    color: colors.muted,
    fontSize: 10,
  },
  streakCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.work,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  streakValue: {
    color: colors.text,
    fontSize: font.h1,
    fontWeight: '800',
  },
  streakLabel: {
    color: colors.muted,
    fontSize: font.small,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  empty: {
    color: colors.muted,
    fontSize: font.body,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
