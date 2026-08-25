import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncStorage } from '../lib/persist';
import type { HistoryEntry } from '../types';

interface HistoryStore {
  entries: HistoryEntry[];
  record: (entry: Omit<HistoryEntry, 'id' | 'completedAt'>) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      entries: [],
      record: (entry) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              ...entry,
              id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              completedAt: new Date().toISOString(),
            },
          ],
        })),
      clear: () => set({ entries: [] }),
    }),
    { name: 'hiit-history', storage: asyncStorage },
  ),
);
