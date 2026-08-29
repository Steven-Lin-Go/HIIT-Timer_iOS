import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { HistoryEntry } from '../src/types';
import {
  currentStreakDays,
  chartBuckets,
  estimateCalories,
  filterByPeriod,
  summarize,
} from '../src/stats/aggregate.ts';

const entry = (completedAt: string, totalDuration = 300, cals = 40): HistoryEntry => ({
  id: completedAt,
  sessionId: 's',
  sessionName: 'Test',
  completedAt,
  completedRounds: 8,
  totalDuration,
  estimatedCalories: cals,
});

test('estimateCalories: MET * kg * hours, rounded', () => {
  // 8 MET * 70kg * (1800/3600 h) = 280
  assert.equal(estimateCalories(1800, 70), 280);
  assert.equal(estimateCalories(0, 70), 0);
  assert.equal(estimateCalories(1800, 0), 0);
});

test('summarize totals and average', () => {
  const s = summarize([entry('2026-08-20', 300, 40), entry('2026-08-21', 500, 60)]);
  assert.equal(s.totalWorkouts, 2);
  assert.equal(s.totalDurationSec, 800);
  assert.equal(s.avgDurationSec, 400);
  assert.equal(s.totalCalories, 100);
});

test('summarize empty is all zero, no divide-by-zero', () => {
  const s = summarize([]);
  assert.equal(s.totalWorkouts, 0);
  assert.equal(s.avgDurationSec, 0);
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
  assert.equal(buckets[11]!.label, 'AUG'); // current month is the last column
  assert.equal(buckets[11]!.totalSec, 500); // both August entries summed
  assert.equal(buckets[0]!.label, 'SEP'); // 11 months back, previous year
  assert.equal(buckets[0]!.key, '2025-09');
  assert.equal(buckets[0]!.totalSec, 600);
});
