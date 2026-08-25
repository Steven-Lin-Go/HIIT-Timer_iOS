import assert from 'node:assert/strict';
import { test } from 'node:test';

import { averageBpm, maxBpm, minBpm, type HeartRateSample } from '../src/health/heartRate.ts';

const s = (bpm: number): HeartRateSample => ({ bpm, date: '2026-08-25T08:00:00Z' });

test('averageBpm rounds the mean', () => {
  assert.equal(averageBpm([s(100), s(101)]), 101); // 100.5 -> 101
  assert.equal(averageBpm([s(120), s(140), s(160)]), 140);
});

test('averageBpm of empty is 0 (no divide-by-zero)', () => {
  assert.equal(averageBpm([]), 0);
});

test('maxBpm and minBpm', () => {
  const samples = [s(90), s(150), s(120)];
  assert.equal(maxBpm(samples), 150);
  assert.equal(minBpm(samples), 90);
});

test('min/max of empty are 0', () => {
  assert.equal(maxBpm([]), 0);
  assert.equal(minBpm([]), 0);
});
