import { create } from 'zustand';

import { TimerState, WorkoutSession } from '../types';

const PREPARE_SECONDS = 10;

interface TimerStore extends TimerState {
  currentSession: WorkoutSession | null;
  setSession: (session: WorkoutSession) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
}

const clampDuration = (seconds: number) => Math.max(1, Math.floor(seconds));

const createInitialState = (session: WorkoutSession | null) => ({
  isRunning: false,
  isPaused: false,
  isComplete: false,
  currentRound: 1,
  currentPhase: 'prepare' as const,
  timeRemaining: PREPARE_SECONDS,
  totalRounds: session?.rounds ?? 0,
  currentSession: session,
});

const createRunningState = (session: WorkoutSession) => ({
  ...createInitialState(session),
  isRunning: true,
});

export const useTimerStore = create<TimerStore>((set, get) => ({
  ...createInitialState(null),

  setSession: (session) => set(createInitialState(session)),

  startTimer: () => {
    const state = get();

    if (!state.currentSession) {
      return;
    }

    if (state.isComplete) {
      set(createRunningState(state.currentSession));
      return;
    }

    set({
      isRunning: true,
      isPaused: false,
      isComplete: false,
    });
  },

  pauseTimer: () => {
    const state = get();

    if (!state.isRunning || state.isComplete) {
      return;
    }

    set({ isPaused: true });
  },

  resetTimer: () => {
    const state = get();

    if (!state.currentSession) {
      return;
    }

    set(createInitialState(state.currentSession));
  },

  tick: () => {
    const state = get();

    if (!state.isRunning || state.isPaused || state.isComplete || !state.currentSession) {
      return;
    }

    const session = state.currentSession;
    const workTime = clampDuration(session.workTime);
    const restTime = clampDuration(session.restTime);

    if (state.timeRemaining > 1) {
      set({ timeRemaining: state.timeRemaining - 1 });
      return;
    }

    if (state.currentPhase === 'prepare') {
      set({
        currentPhase: 'work',
        timeRemaining: workTime,
      });
      return;
    }

    if (state.currentPhase === 'work') {
      if (state.currentRound >= session.rounds) {
        set({
          isRunning: false,
          isPaused: false,
          isComplete: true,
          currentPhase: 'prepare',
          timeRemaining: 0,
        });
        return;
      }

      if (restTime <= 0) {
        set({
          currentRound: state.currentRound + 1,
          currentPhase: 'work',
          timeRemaining: workTime,
        });
        return;
      }

      set({
        currentPhase: 'rest',
        timeRemaining: restTime,
      });
      return;
    }

    const nextRound = state.currentRound + 1;

    if (nextRound > session.rounds) {
      set({
        isRunning: false,
        isPaused: false,
        isComplete: true,
        currentPhase: 'prepare',
        timeRemaining: 0,
      });
      return;
    }

    set({
      currentRound: nextRound,
      currentPhase: 'work',
      timeRemaining: workTime,
    });
  },
}));
