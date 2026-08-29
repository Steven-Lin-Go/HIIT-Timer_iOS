import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { HistoryEntry } from '../src/types';
import {
  currentStreakDays,
  longestStreakDays,
  filterByPreviousPeriod,
  percentChange,
  chartBuckets,
  minutesAxis,
  filterByPeriod,
  summarize,
} from '../src/stats/aggregate.ts';

const entry = (
  completedAt: string,
  totalDuration = 300,
  workSeconds = 160,
  completedRounds = 8,
  plannedRounds = 8,
): HistoryEntry => ({
  id: completedAt,
  sessionId: 's',
  sessionName: 'Test',
  completedAt,
  completedRounds,
  plannedRounds,
  totalDuration,
  workSeconds,
});

test('summarize totals sessions, elapsed time, work time and rounds', () => {
  const s = summarize([entry('2026-08-20', 300, 160), entry('2026-08-21', 500, 240)]);
  assert.equal(s.totalWorkouts, 2);
  assert.equal(s.totalDurationSec, 800);
  assert.equal(s.totalWorkSec, 400);
  assert.equal(s.totalRounds, 16);
});

test('summarize empty is all zero', () => {
  const s = summarize([]);
  assert.equal(s.totalWorkouts, 0);
  assert.equal(s.totalDurationSec, 0);
  assert.equal(s.totalWorkSec, 0);
  assert.equal(s.totalRounds, 0);
});

test('summarize tolerates entries saved before workSeconds existed', () => {
  const legacy = { ...entry('2026-08-20', 300) } as HistoryEntry & { workSeconds?: number };
  delete legacy.workSeconds;
  const s = summarize([legacy as HistoryEntry, entry('2026-08-21', 500, 240)]);
  assert.equal(s.totalWorkSec, 240);
  assert.equal(s.totalDurationSec, 800);
});

test('filterByPeriod keeps only entries inside the window', () => {
  const now = new Date('2026-08-25T12:00:00');
  const recent = entry('2026-08-24T12:00:00');
  const midMonth = entry('2026-08-10T12:00:00'); // 15 days ago: inside month, outside week
  const old = entry('2026-06-01T12:00:00'); // outside both
  const week = filterByPeriod([recent, midMonth, old], 'week', now);
  assert.equal(week.length, 1);
  assert.equal(week[0]!.completedAt, '2026-08-24T12:00:00');
  assert.equal(filterByPeriod([recent, midMonth, old], 'month', now).length, 2);
  assert.equal(filterByPeriod([recent, midMonth, old], 'year', now).length, 3);
});

test('currentStreakDays counts consecutive days back from today', () => {
  const now = new Date('2026-08-25T20:00:00');
  const streak = currentStreakDays(
    [entry('2026-08-25T08:00:00'), entry('2026-08-24T08:00:00'), entry('2026-08-23T08:00:00')],
    now,
  );
  assert.equal(streak, 3);
});

test('streak breaks on a missing day', () => {
  const now = new Date('2026-08-25T20:00:00');
  const streak = currentStreakDays(
    [entry('2026-08-25T08:00:00'), entry('2026-08-23T08:00:00')],
    now,
  );
  assert.equal(streak, 1);
});

test('streak allows grace when today has no workout yet', () => {
  const now = new Date('2026-08-25T20:00:00');
  const streak = currentStreakDays([entry('2026-08-24T08:00:00')], now);
  assert.equal(streak, 1);
});

test('streak is zero with no entries', () => {
  assert.equal(currentStreakDays([], new Date('2026-08-25')), 0);
});

test('chartBuckets returns 7 ordered days for week and sums per day', () => {
  const now = new Date('2026-08-25T12:00:00');
  const buckets = chartBuckets(
    [entry('2026-08-25T08:00:00', 300), entry('2026-08-25T09:00:00', 200)],
    'week',
    now,
  );
  assert.equal(buckets.length, 7);
  assert.equal(buckets[6]!.totalSec, 500); // today is the last bucket
  assert.equal(buckets[0]!.totalSec, 0);
});

test('chartBuckets returns 30 day-of-month columns for month', () => {
  const now = new Date('2026-08-25T12:00:00');
  const buckets = chartBuckets([entry('2026-08-25T08:00:00', 300)], 'month', now);
  assert.equal(buckets.length, 30);
  assert.equal(buckets[29]!.label, '25'); // today is the last column
  assert.equal(buckets[29]!.totalSec, 300);
  assert.equal(buckets[0]!.label, '27'); // 29 days back lands in July
});

test('chartBuckets returns 12 calendar months for year, oldest first', () => {
  const now = new Date('2026-08-25T12:00:00');
  const buckets = chartBuckets(
    [
      entry('2026-08-02T08:00:00', 300),
      entry('2026-08-20T08:00:00', 200),
      entry('2025-09-15T08:00:00', 600),
    ],
    'year',
    now,
  );
  assert.equal(buckets.length, 12);
  assert.equal(buckets[11]!.label, '8'); // current month is the last column
  assert.equal(buckets[11]!.totalSec, 500); // both August entries summed
  assert.equal(buckets[0]!.label, '9'); // 11 months back, previous year
  assert.equal(buckets[0]!.key, '2025-09');
  assert.equal(buckets[0]!.totalSec, 600);
});

test('minutesAxis scales the y-axis to the tallest bar', () => {
  // 53 minutes -> 0/20/40/60, the scale the mockups use.
  assert.deepEqual(minutesAxis(53 * 60), { max: 60, step: 20 });
  assert.deepEqual(minutesAxis(8 * 60), { max: 8, step: 2 });
  assert.deepEqual(minutesAxis(12 * 60), { max: 15, step: 5 });
  assert.deepEqual(minutesAxis(240 * 60), { max: 300, step: 100 });
});

test('minutesAxis keeps whole-minute steps and handles an empty period', () => {
  assert.deepEqual(minutesAxis(0), { max: 10, step: 5 }); // nothing logged
  assert.deepEqual(minutesAxis(30), { max: 1, step: 1 }); // half a minute
  const { max, step } = minutesAxis(3 * 60);
  assert.equal(step, 1);
  assert.equal(max % step, 0);
});

test('completion rate compares rounds done against rounds planned', () => {
  // 6 of 8, then 8 of 8 -> 14 of 16.
  const s = summarize([
    entry('2026-08-20', 300, 120, 6, 8),
    entry('2026-08-21', 300, 160, 8, 8),
  ]);
  assert.equal(s.totalRounds, 14);
  assert.equal(s.plannedRounds, 16);
  assert.equal(s.completionPct, 88); // 87.5 rounded
});

test('completion rate is null when no entry carries a plan', () => {
  const legacy = { ...entry('2026-08-20') } as HistoryEntry & { plannedRounds?: number };
  delete legacy.plannedRounds;
  const s = summarize([legacy as HistoryEntry]);
  assert.equal(s.plannedRounds, 0);
  assert.equal(s.completionPct, null);
});

test('filterByPreviousPeriod takes the window before the current one', () => {
  const now = new Date('2026-08-25T12:00:00');
  const thisWeek = entry('2026-08-24T12:00:00');
  const lastWeek = entry('2026-08-16T12:00:00'); // 9 days ago
  const older = entry('2026-08-01T12:00:00'); // 24 days ago
  const previous = filterByPreviousPeriod([thisWeek, lastWeek, older], 'week', now);
  assert.equal(previous.length, 1);
  assert.equal(previous[0]!.completedAt, '2026-08-16T12:00:00');
});

test('percentChange needs a baseline', () => {
  assert.equal(percentChange(120, 100), 20);
  assert.equal(percentChange(80, 100), -20);
  assert.equal(percentChange(100, 100), 0);
  assert.equal(percentChange(100, 0), null); // nothing to compare against
});

test('longestStreakDays finds the best run in all history', () => {
  const days = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-10', '2026-08-11'];
  assert.equal(longestStreakDays(days.map((d) => entry(`${d}T09:00:00`))), 3);
  assert.equal(longestStreakDays([]), 0);
  assert.equal(longestStreakDays([entry('2026-08-01T09:00:00')]), 1);
});

test('longestStreakDays counts a day once however many sessions it holds', () => {
  const sameDay = [entry('2026-08-01T07:00:00'), entry('2026-08-01T19:00:00')];
  assert.equal(longestStreakDays(sameDay), 1);
});
