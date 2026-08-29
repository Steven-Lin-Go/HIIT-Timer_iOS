import type { HistoryEntry } from '../types';

export type StatsPeriod = 'week' | 'month' | 'year';

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

/**
 * Entries from the window immediately before the current one, same length. Used
 * to say whether this week beat the one before it.
 */
export const filterByPreviousPeriod = (
  entries: HistoryEntry[],
  period: StatsPeriod,
  now: Date = new Date(),
): HistoryEntry[] => {
  const span = PERIOD_DAYS[period] * 24 * 60 * 60 * 1000;
  const start = now.getTime() - span * 2;
  const end = now.getTime() - span;
  return entries.filter((e) => {
    const t = new Date(e.completedAt).getTime();
    return t >= start && t < end;
  });
};

/**
 * Percentage change from `previous` to `current`. Null when there is no
 * baseline to compare against, which reads better than an infinite increase.
 */
export const percentChange = (current: number, previous: number): number | null =>
  previous <= 0 ? null : Math.round(((current - previous) / previous) * 100);

export interface StatsSummary {
  totalWorkouts: number;
  totalDurationSec: number;
  totalWorkSec: number;
  totalRounds: number;
  plannedRounds: number;
  /** Rounds done as a percentage of rounds set up, or null with no plan data. */
  completionPct: number | null;
}

export const summarize = (entries: HistoryEntry[]): StatsSummary => {
  // Entries written before these fields existed contribute nothing rather than
  // being guessed at.
  const totalRounds = entries.reduce((s, e) => s + e.completedRounds, 0);
  const plannedRounds = entries.reduce((s, e) => s + (e.plannedRounds ?? 0), 0);
  return {
    totalWorkouts: entries.length,
    totalDurationSec: entries.reduce((s, e) => s + e.totalDuration, 0),
    totalWorkSec: entries.reduce((s, e) => s + (e.workSeconds ?? 0), 0),
    totalRounds,
    plannedRounds,
    completionPct: plannedRounds === 0 ? null : Math.round((totalRounds / plannedRounds) * 100),
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

// Longest run of consecutive days with at least one workout, over all history.
export const longestStreakDays = (entries: HistoryEntry[]): number => {
  const days = [...new Set(entries.map((e) => dayKey(new Date(e.completedAt))))].sort();
  if (days.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    const previous = new Date(`${days[i - 1]}T00:00:00`);
    previous.setDate(previous.getDate() + 1);
    run = dayKey(previous) === days[i] ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
};

export interface ChartBucket {
  key: string; // YYYY-MM-DD for daily buckets, YYYY-MM for monthly ones
  label: string;
  totalSec: number;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
// Local YYYY-MM key, matching dayKey's calendar-local grouping.
const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

/**
 * Chart columns for the trailing window, oldest first, at a granularity that
 * matches the period: seven days for a week, thirty for a month, and twelve
 * calendar months for a year, labelled by month number. Empty buckets are included so the columns stay
 * evenly spaced and the axis reads continuously.
 */
export const chartBuckets = (
  entries: HistoryEntry[],
  period: StatsPeriod,
  now: Date = new Date(),
): ChartBucket[] => {
  if (period === 'year') {
    const byMonth = new Map<string, number>();
    for (const e of entries) {
      const k = monthKey(new Date(e.completedAt));
      byMonth.set(k, (byMonth.get(k) ?? 0) + e.totalDuration);
    }

    const buckets: ChartBucket[] = [];
    for (let i = 11; i >= 0; i -= 1) {
      // Day 1 of the month i months back; the Date constructor normalises a
      // negative month index into the previous year.
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = monthKey(d);
      // Month number rather than a name: twelve columns leave no room for
      // a three-letter abbreviation, which truncated to 'JU.' and similar.
      const label = (d.getMonth() + 1).toString();
      buckets.push({ key: k, label, totalSec: byMonth.get(k) ?? 0 });
    }
    return buckets;
  }

  const span = period === 'week' ? 7 : 30;
  const byDay = new Map<string, number>();
  for (const e of entries) {
    const k = dayKey(new Date(e.completedAt));
    byDay.set(k, (byDay.get(k) ?? 0) + e.totalDuration);
  }

  const buckets: ChartBucket[] = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = span - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    buckets.push({
      key: k,
      label: period === 'week' ? WEEKDAYS[d.getDay()]! : d.getDate().toString(),
      totalSec: byDay.get(k) ?? 0,
    });
  }
  return buckets;
};

/**
 * A readable y-axis in whole minutes for the workout-time chart.
 *
 * The top of the axis is the smallest multiple of a 1/2/5-family step that
 * clears the tallest bar, so the scale follows the data in the selected period
 * rather than being fixed. Steps are never fractional -- a half-minute day
 * still gets a 0..1 axis rather than 0.2 tick marks.
 */
export const minutesAxis = (maxSeconds: number): { max: number; step: number } => {
  const maxMinutes = Math.max(0, maxSeconds) / 60;
  if (maxMinutes <= 0) return { max: 10, step: 5 }; // nothing logged yet

  const rough = maxMinutes / 4; // aim for roughly four intervals
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;
  const nice = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;
  const step = Math.max(1, Math.round(nice * magnitude));

  return { max: Math.ceil(maxMinutes / step) * step, step };
};
