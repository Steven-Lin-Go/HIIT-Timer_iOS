import type { WorkoutSession } from '../types';

export const PREPARE_SECONDS = 10;

export type TimerPhase = 'prepare' | 'work' | 'rest';

export interface DerivedTimerState {
  currentPhase: TimerPhase;
  currentRound: number;
  timeRemaining: number;
  totalRounds: number;
  isComplete: boolean;
}

interface Segment {
  phase: TimerPhase;
  round: number;
  duration: number;
}

const clampDuration = (seconds: number) => Math.max(1, Math.floor(seconds));

// Deterministic timeline: prepare, then per round work (+ rest between rounds).
// No rest after the final work segment.
export const buildSchedule = (
  session: WorkoutSession,
  prepareSeconds = PREPARE_SECONDS,
): Segment[] => {
  const work = clampDuration(session.workTime);
  const rest = Math.max(0, Math.floor(session.restTime));
  const segments: Segment[] = [
    { phase: 'prepare', round: 1, duration: Math.max(0, Math.floor(prepareSeconds)) },
  ];

  for (let round = 1; round <= session.rounds; round += 1) {
    segments.push({ phase: 'work', round, duration: work });
    if (round < session.rounds && rest > 0) {
      segments.push({ phase: 'rest', round, duration: rest });
    }
  }

  return segments;
};

// Derive the full timer state purely from elapsed real seconds. Background-proof:
// callers pass wall-clock elapsed, so throttled/paused JS timers never drift.
export const computeTimerState = (
  session: WorkoutSession,
  elapsedSeconds: number,
  prepareSeconds = PREPARE_SECONDS,
): DerivedTimerState => {
  const segments = buildSchedule(session, prepareSeconds);
  const elapsed = Math.max(0, elapsedSeconds);
  let cursor = 0;

  for (const segment of segments) {
    const segmentEnd = cursor + segment.duration;
    if (elapsed < segmentEnd) {
      return {
        currentPhase: segment.phase,
        currentRound: segment.round,
        timeRemaining: Math.ceil(segmentEnd - elapsed),
        totalRounds: session.rounds,
        isComplete: false,
      };
    }
    cursor = segmentEnd;
  }

  return {
    currentPhase: 'prepare',
    currentRound: session.rounds,
    timeRemaining: 0,
    totalRounds: session.rounds,
    isComplete: true,
  };
};
