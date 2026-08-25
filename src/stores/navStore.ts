import { create } from 'zustand';

export type Tab = 'timer' | 'workouts' | 'stats';
export type TimerScreen = 'home' | 'setup' | 'run';

interface NavState {
  activeTab: Tab;
  timerScreen: TimerScreen;
  settingsOpen: boolean;
  // id of the custom workout being edited in setup, or null for a fresh draft
  editingWorkoutId: string | null;
  setTab: (tab: Tab) => void;
  setTimerScreen: (screen: TimerScreen) => void;
  openSettings: () => void;
  closeSettings: () => void;
  openSetup: (editingWorkoutId?: string | null) => void;
}

export const useNavStore = create<NavState>((set) => ({
  activeTab: 'timer',
  timerScreen: 'home',
  settingsOpen: false,
  editingWorkoutId: null,
  setTab: (activeTab) => set({ activeTab }),
  setTimerScreen: (timerScreen) => set({ timerScreen }),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openSetup: (editingWorkoutId = null) =>
    set({ activeTab: 'timer', timerScreen: 'setup', editingWorkoutId }),
}));
