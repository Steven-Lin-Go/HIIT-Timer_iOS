import { create } from 'zustand';

import type { TimerState, WorkoutSession } from '../types';
import {
  computeTimerState,
  PREPARE_SECONDS,
  segmentStarts,
  totalScheduledSeconds,
  workRoundsCompletedBetween,
  workSecondsForRounds,
} from '../timer/schedule';
import { useHistoryStore } from './historyStore';

interface TimerStore extends TimerState {
  currentSession: WorkoutSession | null;
  // Wall-clock anchors. State is derived from these, so background/lock-screen
  // JS timer throttling never causes drift.
  startEpoch: number | null;
  pausedAccumMs: number;
  pauseStartedAt: number | null;
  // Wall clock when the session began. Unlike startEpoch this is never
  // re-anchored by a skip, so it measures time the user actually spent.
  startedAtWall: number | null;
  // Rounds the clock has run through, and how far along the schedule the last
  // tick reached. A skip moves the play position without crediting anything.
  doneRounds: number[];
  lastPosition: number;
  setSession: (session: WorkoutSession) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skip: (direction: 'forward' | 'back') => void;
  tick: () => void;
}

// Write one history entry for a finished session, describing what was actually
// done rather than what was scheduled: rounds the clock ran through, the work
// seconds those rounds contain, and elapsed wall time excluding pauses.
// Shared by tick() and forward-skip completion.
const recordCompletion = (
  session: WorkoutSession,
  doneRounds: number[],
  elapsedSeconds: number,
) => {
  useHistoryStore.getState().record({
    sessionId: session.id,
    sessionName: session.name,
    completedRounds: doneRounds.length,
    totalDuration: Math.max(0, Math.round(elapsedSeconds)),
    workSeconds: workSecondsForRounds(session, doneRounds),
  });
};

// Seconds the user has been in the session, pauses removed.
const wallElapsedSeconds = (
  startedAtWall: number | null,
  pausedAccumMs: number,
  now: number,
): number => (startedAtWall === null ? 0 : (now - startedAtWall - pausedAccumMs) / 1000);

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
  startedAtWall: null,
  doneRounds: [] as number[],
  lastPosition: 0,
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
      const now = Date.now();
      set({
        ...idleDerived(state.currentSession),
        isRunning: true,
        startEpoch: now,
        pausedAccumMs: 0,
        pauseStartedAt: null,
        startedAtWall: now,
        doneRounds: [],
        lastPosition: 0,
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

  // Jump to the previous/next segment boundary by re-anchoring elapsed time.
  // Ignored while paused, idle, or complete.
  skip: (direction) => {
    const state = get();
    const session = state.currentSession;

    if (!session || !state.isRunning || state.isPaused || state.isComplete || state.startEpoch === null) {
      return;
    }

    const starts = segmentStarts(session);
    const total = totalScheduledSeconds(session);
    const now = Date.now();
    const elapsed = (now - state.startEpoch - state.pausedAccumMs) / 1000;

    let idx = 0;
    for (let i = 0; i < starts.length; i += 1) {
      if (elapsed >= starts[i]!) idx = i;
    }

    let target: number;
    if (direction === 'forward') {
      target = idx + 1 < starts.length ? starts[idx + 1]! : total;
    } else {
      // Within the first 2s of a segment, back goes to the previous one;
      // otherwise it just restarts the current segment.
      const withinCurrent = elapsed - starts[idx]!;
      target = withinCurrent > 2 || idx === 0 ? starts[idx]! : starts[idx - 1]!;
    }

    const derived = computeTimerState(session, target);
    if (derived.isComplete && !state.isComplete) {
      recordCompletion(
        session,
        state.doneRounds,
        wallElapsedSeconds(state.startedAtWall, state.pausedAccumMs, now),
      );
    }

    set({
      startEpoch: now - state.pausedAccumMs - target * 1000,
      // Resume crediting from wherever the jump landed.
      lastPosition: target,
      currentPhase: derived.currentPhase,
      currentRound: derived.currentRound,
      timeRemaining: derived.timeRemaining,
      totalRounds: derived.totalRounds,
      isComplete: derived.isComplete,
      isRunning: !derived.isComplete,
    });
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

    const now = Date.now();
    const elapsedMs = now - state.startEpoch - state.pausedAccumMs;
    const position = elapsedMs / 1000;
    const derived = computeTimerState(state.currentSession, position);

    // Credit any work segment the clock ran past since the last tick. Backwards
    // movement credits nothing, and a round already done is not counted twice.
    const fresh = workRoundsCompletedBetween(
      state.currentSession,
      state.lastPosition,
      position,
    ).filter((round) => !state.doneRounds.includes(round));
    const doneRounds = fresh.length === 0 ? state.doneRounds : [...state.doneRounds, ...fresh];

    // Log one history entry on the false→true completion edge.
    if (derived.isComplete && !state.isComplete) {
      recordCompletion(
        state.currentSession,
        doneRounds,
        wallElapsedSeconds(state.startedAtWall, state.pausedAccumMs, now),
      );
    }

    set({
      doneRounds,
      lastPosition: Math.max(state.lastPosition, position),
      currentPhase: derived.currentPhase,
      currentRound: derived.currentRound,
      timeRemaining: derived.timeRemaining,
      totalRounds: derived.totalRounds,
      isComplete: derived.isComplete,
      isRunning: !derived.isComplete,
    });
  },
}));
