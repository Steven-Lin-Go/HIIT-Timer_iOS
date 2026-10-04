import assert from 'node:assert/strict';
import { test } from 'node:test';

import { computeTimerState, countdownProgress } from '../src/timer/schedule.ts';
import type { WorkoutSession } from '../src/types';

const session: WorkoutSession = {
  id: 'progress',
  name: 'progress',
  prepareTime: 5,
  workTime: 20,
  restTime: 10,
  cooldownTime: 15,
  rounds: 2,
  createdAt: new Date(),
};

test('each phase starts at a full progress circle', () => {
  assert.equal(countdownProgress({ phase: 'prepare', timeRemaining: 5, session, isComplete: false }), 1);
  assert.equal(countdownProgress({ phase: 'work', timeRemaining: 20, session, isComplete: false }), 1);
  assert.equal(countdownProgress({ phase: 'rest', timeRemaining: 10, session, isComplete: false }), 1);
  assert.equal(countdownProgress({ phase: 'cooldown', timeRemaining: 15, session, isComplete: false }), 1);
});

test('progress follows the remaining share of every phase', () => {
  assert.equal(countdownProgress({ phase: 'prepare', timeRemaining: 4, session, isComplete: false }), 0.8);
  assert.equal(countdownProgress({ phase: 'work', timeRemaining: 10, session, isComplete: false }), 0.5);
  assert.equal(countdownProgress({ phase: 'rest', timeRemaining: 1, session, isComplete: false }), 0.1);
  assert.equal(countdownProgress({ phase: 'cooldown', timeRemaining: 3, session, isComplete: false }), 0.2);
});

test('progress disappears at completion and clamps invalid edge values', () => {
  assert.equal(countdownProgress({ phase: 'work', timeRemaining: 20, session, isComplete: true }), 0);
  assert.equal(countdownProgress({ phase: 'work', timeRemaining: 0, session, isComplete: false }), 0);
  assert.equal(countdownProgress({ phase: 'work', timeRemaining: -1, session, isComplete: false }), 0);
  assert.equal(countdownProgress({ phase: 'work', timeRemaining: 25, session, isComplete: false }), 1);
  assert.equal(countdownProgress({ phase: 'work', timeRemaining: 10, session: null, isComplete: false }), 0);
});

test('a natural phase boundary ends the old arc and starts the next arc full', () => {
  const beforeBoundary = computeTimerState(session, 4.999);
  assert.equal(beforeBoundary.currentPhase, 'prepare');
  assert.equal(beforeBoundary.timeRemaining, 1);
  assert.equal(
    countdownProgress({ ...beforeBoundary, phase: beforeBoundary.currentPhase, session }),
    0.2,
  );

  const atBoundary = computeTimerState(session, 5);
  assert.equal(atBoundary.currentPhase, 'work');
  assert.equal(atBoundary.timeRemaining, 20);
  assert.equal(
    countdownProgress({ ...atBoundary, phase: atBoundary.currentPhase, session }),
    1,
  );

  const justAfterBoundary = computeTimerState(session, 5.05);
  assert.equal(justAfterBoundary.currentPhase, 'work');
  assert.equal(justAfterBoundary.timeRemaining, 20);
  assert.equal(
    countdownProgress({ ...justAfterBoundary, phase: justAfterBoundary.currentPhase, session }),
    1,
  );
});
