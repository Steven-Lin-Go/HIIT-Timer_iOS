import assert from 'node:assert/strict';
import { test } from 'node:test';

import { addWorkout, deleteWorkout, updateWorkout, type WorkoutDraft } from '../src/stores/workoutOps.ts';

const draft: WorkoutDraft = {
  name: 'My HIIT',
  workTime: 30,
  restTime: 15,
  rounds: 6,
  prepareTime: 10,
  cooldownTime: 30,
  difficulty: 'MEDIUM',
};

test('addWorkout appends a non-preset with an id', () => {
  const list = addWorkout([], draft, new Date('2026-08-25'));
  assert.equal(list.length, 1);
  assert.equal(list[0]!.name, 'My HIIT');
  assert.equal(list[0]!.isPreset, false);
  assert.ok(list[0]!.id.length > 0);
});

test('updateWorkout edits only the matching id', () => {
  const list = addWorkout([], draft, new Date('2026-08-25'));
  const id = list[0]!.id;
  const updated = updateWorkout(list, id, { ...draft, name: 'Renamed', rounds: 10 });
  assert.equal(updated[0]!.name, 'Renamed');
  assert.equal(updated[0]!.rounds, 10);
  assert.equal(updated[0]!.id, id); // id preserved
});

test('deleteWorkout removes the matching id', () => {
  const list = addWorkout([], draft, new Date('2026-08-25'));
  const id = list[0]!.id;
  assert.equal(deleteWorkout(list, id).length, 0);
  assert.equal(deleteWorkout(list, 'nope').length, 1);
});
