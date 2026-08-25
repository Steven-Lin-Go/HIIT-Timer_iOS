import type { HistoryEntry } from '../types';

export type StatsPeriod = 'week' | 'month' | 'year';

// MET for vigorous calisthenics/HIIT. calories = MET * kg * hours.
const HIIT_MET = 8.0;

export const estimateCalories = (
  durationSec: number,
  bodyWeightKg: number,
  met: number = HIIT_MET,
): number => {
  const hours = Math.max(0, durationSec) / 3600;
  return Math.round(met * Math.max(0, bodyWeightKg) * hours);
};

// Local YYYY-MM-DD key so buckets/streaks group by calendar day, not UTC.
export const dayKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const PERIOD_DAYS: Record<StatsPeriod, number> = {
  week: 7,
  month: 30,
  year: 365,
};

export const filterByPeriod = (
  entries: HistoryEntry[],
  period: StatsPeriod,
  now: Date = new Date(),
): HistoryEntry[] => {
  const cutoff = now.getTime() - PERIOD_DAYS[period] * 24 * 60 * 60 * 1000;
  return entries.filter((e) => new Date(e.completedAt).getTime() >= cutoff);
};

export interface StatsSummary {
  totalWorkouts: number;
  totalDurationSec: number;
  avgDurationSec: number;
  totalCalories: number;
}

export const summarize = (entries: HistoryEntry[]): StatsSummary => {
  const totalWorkouts = entries.length;
  const totalDurationSec = entries.reduce((s, e) => s + e.totalDuration, 0);
  const totalCalories = entries.reduce((s, e) => s + e.estimatedCalories, 0);
  return {
    totalWorkouts,
    totalDurationSec,
    avgDurationSec: totalWorkouts === 0 ? 0 : Math.round(totalDurationSec / totalWorkouts),
    totalCalories,
  };
};

// Consecutive calendar days with >=1 workout, counting back from today. If today
// has none but yesterday does, the streak still counts (grace for "not done yet").
export const currentStreakDays = (
  entries: HistoryEntry[],
  now: Date = new Date(),
): number => {
  const days = new Set(entries.map((e) => dayKey(new Date(e.completedAt))));
  if (days.size === 0) return 0;

  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export interface DailyBucket {
  key: string; // YYYY-MM-DD
  label: string; // weekday / day-of-month label for the chart
  totalSec: number;
}

// One bucket per day for the trailing window (7 for week, else capped at 30),
// oldest first, so a bar chart can render fixed-width columns.
export const dailyBuckets = (
  entries: HistoryEntry[],
  period: StatsPeriod,
  now: Date = new Date(),
): DailyBucket[] => {
  const span = period === 'week' ? 7 : 30;
  const byDay = new Map<string, number>();
  for (const e of entries) {
    const k = dayKey(new Date(e.completedAt));
    byDay.set(k, (byDay.get(k) ?? 0) + e.totalDuration);
  }

  const buckets: DailyBucket[] = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = span - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    buckets.push({
      key: k,
      label:
        period === 'week'
          ? ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.getDay()]!
          : d.getDate().toString(),
      totalSec: byDay.get(k) ?? 0,
    });
  }
  return buckets;
};
