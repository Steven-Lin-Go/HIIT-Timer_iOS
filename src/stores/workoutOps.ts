import type { Difficulty, WorkoutSession } from '../types';

// Built-in presets, mirroring the mockup's PRESETS list. Always available and
// not editable/deletable by the user.
export const WORKOUT_PRESETS: WorkoutSession[] = [
  {
    id: 'preset-full-body',
    name: 'FULL BODY HIIT',
    workTime: 20,
    restTime: 10,
    rounds: 8,
    prepareTime: 10,
    cooldownTime: 30,
    difficulty: 'MEDIUM',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'preset-tabata',
    name: 'TABATA',
    workTime: 20,
    restTime: 10,
    rounds: 8,
    prepareTime: 10,
    cooldownTime: 0,
    difficulty: 'HARD',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'preset-killer-cardio',
    name: 'KILLER CARDIO',
    workTime: 40,
    restTime: 20,
    rounds: 10,
    prepareTime: 10,
    cooldownTime: 60,
    difficulty: 'HARD',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'preset-hiit-abs',
    name: 'HIIT & ABS',
    workTime: 30,
    restTime: 15,
    rounds: 8,
    prepareTime: 10,
    cooldownTime: 30,
    difficulty: 'MEDIUM',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'preset-beginner',
    name: 'BEGINNER HIIT',
    workTime: 30,
    restTime: 30,
    rounds: 6,
    prepareTime: 15,
    cooldownTime: 60,
    difficulty: 'EASY',
    isPreset: true,
    createdAt: new Date('2024-01-01'),
  },
];

export interface WorkoutDraft {
  name: string;
  workTime: number;
  restTime: number;
  rounds: number;
  prepareTime: number;
  cooldownTime: number;
  difficulty?: Difficulty;
}

const makeId = () => `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Pure CRUD reducers over the custom-workout list, so they can be unit-tested
// without a running store.
// Swap an entry with its neighbour. Out-of-range moves return the list
// unchanged, so the caller can wire up buttons without guarding the ends.
export const moveWorkout = (
  list: WorkoutSession[],
  id: string,
  direction: 'up' | 'down',
): WorkoutSession[] => {
  const index = list.findIndex((w) => w.id === id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= list.length) {
    return list;
  }
  const next = [...list];
  const moved = next[index]!;
  next[index] = next[target]!;
  next[target] = moved;
  return next;
};

export const addWorkout = (
  list: WorkoutSession[],
  draft: WorkoutDraft,
  now: Date = new Date(),
): WorkoutSession[] => [
  ...list,
  { ...draft, id: makeId(), isPreset: false, createdAt: now },
];

export const updateWorkout = (
  list: WorkoutSession[],
  id: string,
  draft: WorkoutDraft,
): WorkoutSession[] =>
  list.map((w) => (w.id === id ? { ...w, ...draft } : w));

export const deleteWorkout = (
  list: WorkoutSession[],
  id: string,
): WorkoutSession[] => list.filter((w) => w.id !== id);
