import { create } from 'zustand';

import type { TimerState, WorkoutSession } from '../types';
import { computeTimerState, PREPARE_SECONDS } from '../timer/schedule';

interface TimerStore extends TimerState {
  currentSession: WorkoutSession | null;
  // Wall-clock anchors. State is derived from these, so background/lock-screen
  // JS timer throttling never causes drift.
  startEpoch: number | null;
  pausedAccumMs: number;
  pauseStartedAt: number | null;
  setSession: (session: WorkoutSession) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
}

const idleDerived = (session: WorkoutSession | null): TimerState => {
  if (!session) {
    return {
      isRunning: false,
      isPaused: false,
      isComplete: false,
      currentRound: 1,
      currentPhase: 'prepare',
      timeRemaining: PREPARE_SECONDS,
      totalRounds: 0,
    };
  }

  const derived = computeTimerState(session, 0);
  return {
    isRunning: false,
    isPaused: false,
    isComplete: false,
    currentRound: derived.currentRound,
    currentPhase: derived.currentPhase,
    timeRemaining: derived.timeRemaining,
    totalRounds: derived.totalRounds,
  };
};

const createInitialState = (session: WorkoutSession | null) => ({
  ...idleDerived(session),
  currentSession: session,
  startEpoch: null,
  pausedAccumMs: 0,
  pauseStartedAt: null,
});

export const useTimerStore = create<TimerStore>((set, get) => ({
  ...createInitialState(null),

  setSession: (session) => set(createInitialState(session)),

  startTimer: () => {
    const state = get();

    if (!state.currentSession) {
      return;
    }

    // Fresh start or restart after completion: anchor now.
    if (!state.isRunning || state.isComplete) {
      set({
        ...idleDerived(state.currentSession),
        isRunning: true,
        startEpoch: Date.now(),
        pausedAccumMs: 0,
        pauseStartedAt: null,
      });
      return;
    }

    // Resume from pause: fold paused span into the accumulator.
    if (state.isPaused && state.pauseStartedAt !== null) {
      set({
        isPaused: false,
        pausedAccumMs: state.pausedAccumMs + (Date.now() - state.pauseStartedAt),
        pauseStartedAt: null,
      });
    }
  },

  pauseTimer: () => {
    const state = get();

    if (!state.isRunning || state.isPaused || state.isComplete) {
      return;
    }

    set({ isPaused: true, pauseStartedAt: Date.now() });
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

    if (
      !state.isRunning ||
      state.isPaused ||
      state.isComplete ||
      !state.currentSession ||
      state.startEpoch === null
    ) {
      return;
    }

    const elapsedMs = Date.now() - state.startEpoch - state.pausedAccumMs;
    const derived = computeTimerState(state.currentSession, elapsedMs / 1000);

    set({
      currentPhase: derived.currentPhase,
      currentRound: derived.currentRound,
      timeRemaining: derived.timeRemaining,
      totalRounds: derived.totalRounds,
      isComplete: derived.isComplete,
      isRunning: !derived.isComplete,
    });
  },
}));
