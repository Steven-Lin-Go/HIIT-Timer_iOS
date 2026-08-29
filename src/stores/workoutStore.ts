import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncStorage } from '../lib/persist';
import type { WorkoutSession } from '../types';
import {
  addWorkout,
  deleteWorkout,
  updateWorkout,
  moveWorkout,
  WORKOUT_PRESETS,
  type WorkoutDraft,
} from './workoutOps';

interface WorkoutStore {
  presets: WorkoutSession[];
  custom: WorkoutSession[];
  add: (draft: WorkoutDraft) => void;
  update: (id: string, draft: WorkoutDraft) => void;
  remove: (id: string) => void;
  move: (list: 'presets' | 'custom', id: string, direction: 'up' | 'down') => void;
  getById: (id: string) => WorkoutSession | undefined;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      presets: WORKOUT_PRESETS,
      custom: [],
      add: (draft) => set((state) => ({ custom: addWorkout(state.custom, draft) })),
      update: (id, draft) =>
        set((state) => ({ custom: updateWorkout(state.custom, id, draft) })),
      remove: (id) => set((state) => ({ custom: deleteWorkout(state.custom, id) })),
      move: (list, id, direction) =>
        set((state) =>
          list === 'presets'
            ? { presets: moveWorkout(state.presets, id, direction) }
            : { custom: moveWorkout(state.custom, id, direction) },
        ),
      getById: (id) => {
        const state = get();
        return (
          state.presets.find((w) => w.id === id) ??
          state.custom.find((w) => w.id === id)
        );
      },
    }),
    {
      name: 'hiit-workouts',
      storage: asyncStorage,
      // Only persist user-created workouts; presets always come from code so
      // they stay in sync with app updates.
      partialize: (state) => ({ custom: state.custom }),
    },
  ),
);
