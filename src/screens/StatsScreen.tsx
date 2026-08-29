import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BarChart } from '../components/BarChart';
import { ScreenHeader } from '../components/ScreenHeader';
import { useT } from '../i18n/useT';
import { formatDuration } from '../lib/format';
import { useHeartRateStore } from '../stores/heartRateStore';
import { useHistoryStore } from '../stores/historyStore';
import {
  currentStreakDays,
  chartBuckets,
  filterByPeriod,
  summarize,
  type StatsPeriod,
} from '../stats/aggregate';
import { useTheme } from '../theme/useTheme';
import { useFont } from '../theme/useFont';
import type { Palette } from '../theme/palettes';
import { radius, spacing, type FontScale } from '../theme/fitness';

// Screen 5: stats dashboard. All figures are derived from real workout history;
// heart rate is read from HealthKit.
export function StatsScreen() {
  const [period, setPeriod] = useState<StatsPeriod>('week');
  const entries = useHistoryStore((s) => s.entries);
  const hrStatus = useHeartRateStore((s) => s.status);
  const hrStats = useHeartRateStore((s) => s.stats);
  const hrConnect = useHeartRateStore((s) => s.connect);
  const hrLoad = useHeartRateStore((s) => s.load);
  const c = useTheme();
  const f = useFont();
  const t = useT();
  const styles = useMemo(() => makeStyles(c, f), [c, f]);

  const scoped = filterByPeriod(entries, period);
  const summary = summarize(scoped);
  const streak = currentStreakDays(entries);
  const buckets = chartBuckets(entries, period);

  // Reload heart rate on period change ONLY if already connected. Don't auto-load
  // on first mount: that would skip the "Connect Apple Health" step (querying
  // before authorization hangs on "Loading…"). Status is read at call time, not
  // as a dependency, to avoid a loading→ready refetch loop.
  useEffect(() => {
    if (useHeartRateStore.getState().status === 'ready') {
      hrLoad(period);
    }
  }, [period, hrLoad]);

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
          <Stat styles={styles} label={t('stats.calories')} value={`${summary.totalCalories}`} hint={t('stats.calHint')} />
          <Stat styles={styles} label={t('stats.avg')} value={formatDuration(summary.avgDurationSec)} />
        </View>

        <View style={styles.streakCard}>
          <Text style={styles.streakValue}>🔥 {streak}</Text>
          <Text style={styles.streakLabel}>{t('stats.streak')}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('stats.heartRate')}</Text>
        <View style={styles.chartCard}>
          {hrStatus === 'unavailable' ? (
            <Text style={styles.hrNote}>{t('stats.hrUnavailable')}</Text>
          ) : hrStatus === 'denied' ? (
            <Text style={styles.hrNote}>{t('stats.hrDenied')}</Text>
          ) : hrStatus === 'idle' ? (
            <Pressable
              onPress={() => hrConnect().then(() => hrLoad(period))}
              style={({ pressed }) => [styles.hrBtn, pressed && styles.pressed]}
            >
              <Text style={styles.hrBtnText}>{t('stats.hrConnect')}</Text>
            </Pressable>
          ) : hrStatus === 'loading' ? (
            <Text style={styles.hrNote}>{t('stats.loading')}</Text>
          ) : hrStats.avg === 0 && hrStats.max === 0 ? (
            <Text style={styles.hrNote}>{t('stats.hrNoData')}</Text>
          ) : (
            <View style={styles.hrRow}>
              <View style={styles.hrStat}>
                <Text style={styles.hrValue}>{hrStats.avg}</Text>
                <Text style={styles.hrLabel}>{t('stats.avgBpm')}</Text>
              </View>
              <View style={styles.hrDivider} />
              <View style={styles.hrStat}>
                <Text style={styles.hrValue}>{hrStats.max}</Text>
                <Text style={styles.hrLabel}>{t('stats.maxBpm')}</Text>
              </View>
            </View>
          )}
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
      <Text style={styles.statLabel}>
        {label}
        {hint ? <Text style={styles.statHint}> {hint}</Text> : null}
      </Text>
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
    hrNote: {
      color: c.muted,
      fontSize: f.small,
      textAlign: 'center',
    },
    hrBtn: {
      alignItems: 'center',
      backgroundColor: c.work,
      borderRadius: radius.md,
      paddingVertical: 12,
    },
    hrBtnText: {
      color: c.text,
      fontSize: f.small,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    hrRow: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    hrStat: {
      alignItems: 'center',
      flex: 1,
    },
    hrValue: {
      color: c.work,
      fontSize: f.h1,
      fontWeight: '800',
    },
    hrLabel: {
      color: c.muted,
      fontSize: f.small,
      fontWeight: '700',
      letterSpacing: 1.5,
      marginTop: 2,
    },
    hrDivider: {
      backgroundColor: c.border,
      height: 40,
      width: 1,
    },
    pressed: { opacity: 0.85 },
  });
