import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { WorkoutSession } from '../src/types';
import {
  computeTimerState,
  PREPARE_SECONDS,
  totalScheduledSeconds,
  totalWorkSeconds,
} from '../src/timer/schedule.ts';

// Tabata-like: 2 rounds, 20s work, 10s rest. Timeline:
// prepare[0,10) work1[10,30) rest1[30,40) work2[40,60) then complete.
const session: WorkoutSession = {
  id: 't',
  name: 'test',
  workTime: 20,
  restTime: 10,
  rounds: 2,
  createdAt: new Date(),
};

test('start shows full prepare', () => {
  const s = computeTimerState(session, 0);
  assert.equal(s.currentPhase, 'prepare');
  assert.equal(s.timeRemaining, PREPARE_SECONDS);
  assert.equal(s.currentRound, 1);
  assert.equal(s.isComplete, false);
});

test('counts down within prepare', () => {
  assert.equal(computeTimerState(session, 9.5).timeRemaining, 1);
});

test('enters work round 1 at boundary', () => {
  const s = computeTimerState(session, 10);
  assert.equal(s.currentPhase, 'work');
  assert.equal(s.currentRound, 1);
  assert.equal(s.timeRemaining, 20);
});

test('rest sits between rounds', () => {
  const s = computeTimerState(session, 30);
  assert.equal(s.currentPhase, 'rest');
  assert.equal(s.currentRound, 1);
});

test('final work is round 2, no trailing rest', () => {
  const s = computeTimerState(session, 40);
  assert.equal(s.currentPhase, 'work');
  assert.equal(s.currentRound, 2);
});

test('background jump straight to completion', () => {
  // Simulate app backgrounded past the whole session (60s total).
  const s = computeTimerState(session, 999);
  assert.equal(s.isComplete, true);
  assert.equal(s.timeRemaining, 0);
});

test('no rest when restTime is zero', () => {
  const noRest: WorkoutSession = { ...session, restTime: 0 };
  // prepare[0,10) work1[10,30) work2[30,50)
  assert.equal(computeTimerState(noRest, 30).currentPhase, 'work');
  assert.equal(computeTimerState(noRest, 30).currentRound, 2);
  assert.equal(computeTimerState(noRest, 50).isComplete, true);
});

test('per-session prepareTime overrides the default', () => {
  const custom: WorkoutSession = { ...session, prepareTime: 5 };
  // prepare[0,5) work1[5,25)
  assert.equal(computeTimerState(custom, 0).timeRemaining, 5);
  assert.equal(computeTimerState(custom, 5).currentPhase, 'work');
});

test('cooldown segment runs after the final work', () => {
  const withCooldown: WorkoutSession = { ...session, cooldownTime: 15 };
  // prepare[0,10) work1[10,30) rest1[30,40) work2[40,60) cooldown[60,75)
  const s = computeTimerState(withCooldown, 60);
  assert.equal(s.currentPhase, 'cooldown');
  assert.equal(s.timeRemaining, 15);
  assert.equal(s.isComplete, false);
  assert.equal(computeTimerState(withCooldown, 75).isComplete, true);
});

test('zero cooldown adds no segment', () => {
  const noCooldown: WorkoutSession = { ...session, cooldownTime: 0 };
  assert.equal(computeTimerState(noCooldown, 60).isComplete, true);
});

test('totalWorkSeconds counts work intervals only', () => {
  // 20s work x 8, 10s rest between rounds, 10s prepare, 30s cooldown.
  const session: WorkoutSession = {
    id: 'w',
    name: 'Full body',
    workTime: 20,
    restTime: 10,
    rounds: 8,
    prepareTime: 10,
    cooldownTime: 30,
    createdAt: new Date(),
  };
  assert.equal(totalWorkSeconds(session), 160); // 20 * 8
  // Prepare 10 + work 160 + rest 70 (7 gaps) + cooldown 30.
  assert.equal(totalScheduledSeconds(session), 270);
});

test('totalWorkSeconds ignores rest when there is only one round', () => {
  const session: WorkoutSession = {
    id: 'w',
    name: 'Single',
    workTime: 45,
    restTime: 30,
    rounds: 1,
    prepareTime: 0,
    cooldownTime: 0,
    createdAt: new Date(),
  };
  assert.equal(totalWorkSeconds(session), 45);
  assert.equal(totalScheduledSeconds(session), 45); // no rest after the last round
});
