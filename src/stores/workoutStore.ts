import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncStorage } from '../lib/persist';
import type { WorkoutSession } from '../types';
import {
  addWorkout,
  deleteWorkout,
  updateWorkout,
  moveWorkout,
  orderPresets,
  WORKOUT_PRESETS,
  type WorkoutDraft,
} from './workoutOps';

interface WorkoutStore {
  // Derived from presetOrder at rehydration; never persisted itself.
  presets: WorkoutSession[];
  // The user's arrangement of the built-in list, as ids.
  presetOrder: string[];
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
      presetOrder: [],
      custom: [],
      add: (draft) => set((state) => ({ custom: addWorkout(state.custom, draft) })),
      update: (id, draft) =>
        set((state) => ({ custom: updateWorkout(state.custom, id, draft) })),
      remove: (id) => set((state) => ({ custom: deleteWorkout(state.custom, id) })),
      move: (list, id, direction) =>
        set((state) => {
          if (list === 'custom') {
            return { custom: moveWorkout(state.custom, id, direction) };
          }
          // Keep the visible list and the persisted order in step.
          const presets = moveWorkout(state.presets, id, direction);
          return { presets, presetOrder: presets.map((w) => w.id) };
        }),
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
      // User-created workouts, plus the order the user put the built-in ones
      // in. The presets themselves always come from code so they stay in sync
      // with app updates.
      partialize: (state) => ({ custom: state.custom, presetOrder: state.presetOrder }),
      // Rebuild the visible preset list from code every launch, arranged by
      // whatever order was stored.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<WorkoutStore>;
        const presetOrder = saved.presetOrder ?? [];
        return {
          ...current,
          ...saved,
          presetOrder,
          presets: orderPresets(WORKOUT_PRESETS, presetOrder),
        };
      },
    },
  ),
);
