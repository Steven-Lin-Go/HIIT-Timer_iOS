import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { WorkoutSession } from '../src/types';
import {
  addWorkout,
  deleteWorkout,
  moveWorkout,
  orderPresets,
  updateWorkout,
  type WorkoutDraft,
} from '../src/stores/workoutOps.ts';

const draft: WorkoutDraft = {
  name: 'My HIIT',
  workTime: 30,
  restTime: 15,
  rounds: 6,
  prepareTime: 10,
  cooldownTime: 30,
  difficulty: 'MEDIUM',
};

const session = (id: string): WorkoutSession => ({
  ...draft,
  id,
  isPreset: false,
  createdAt: new Date('2026-01-01'),
});

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

test('moveWorkout swaps an entry with its neighbour', () => {
  const list = [
    session('a'),
    session('b'),
    session('c'),
  ];
  assert.deepEqual(moveWorkout(list, 'b', 'up').map((w) => w.id), ['b', 'a', 'c']);
  assert.deepEqual(moveWorkout(list, 'b', 'down').map((w) => w.id), ['a', 'c', 'b']);
});

test('moveWorkout leaves the list alone at the ends and for unknown ids', () => {
  const list = [
    session('a'),
    session('b'),
  ];
  assert.equal(moveWorkout(list, 'a', 'up'), list); // already first
  assert.equal(moveWorkout(list, 'b', 'down'), list); // already last
  assert.equal(moveWorkout(list, 'nope', 'up'), list);
});

test('moveWorkout does not mutate the list it is given', () => {
  const list = [
    session('a'),
    session('b'),
  ];
  moveWorkout(list, 'a', 'down');
  assert.deepEqual(list.map((w) => w.id), ['a', 'b']);
});

test('orderPresets arranges code presets by a stored id order', () => {
  const presets = [session('a'), session('b'), session('c')];
  assert.deepEqual(
    orderPresets(presets, ['c', 'a', 'b']).map((w) => w.id),
    ['c', 'a', 'b'],
  );
});

test('orderPresets appends presets the stored order has never seen', () => {
  // 'd' ships in a later version, after the user already arranged the list.
  const presets = [session('a'), session('b'), session('d')];
  assert.deepEqual(
    orderPresets(presets, ['b', 'a']).map((w) => w.id),
    ['b', 'a', 'd'],
  );
});

test('orderPresets ignores ids no longer defined in code', () => {
  // 'gone' was removed from the app; the stored order still mentions it.
  const presets = [session('a'), session('b')];
  assert.deepEqual(
    orderPresets(presets, ['gone', 'b', 'a']).map((w) => w.id),
    ['b', 'a'],
  );
});

test('orderPresets with no stored order keeps the order defined in code', () => {
  const presets = [session('a'), session('b')];
  assert.deepEqual(orderPresets(presets, []).map((w) => w.id), ['a', 'b']);
});
