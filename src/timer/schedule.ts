import type { WorkoutSession } from '../types';

export const PREPARE_SECONDS = 10;

export type TimerPhase = 'prepare' | 'work' | 'rest' | 'cooldown';

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

// Deterministic timeline: prepare, then per round work (+ rest between rounds),
// then an optional cooldown. No rest after the final work segment.
export const buildSchedule = (session: WorkoutSession): Segment[] => {
  const work = clampDuration(session.workTime);
  const rest = Math.max(0, Math.floor(session.restTime));
  const prepare = Math.max(0, Math.floor(session.prepareTime ?? PREPARE_SECONDS));
  const cooldown = Math.max(0, Math.floor(session.cooldownTime ?? 0));
  const segments: Segment[] = [{ phase: 'prepare', round: 1, duration: prepare }];

  for (let round = 1; round <= session.rounds; round += 1) {
    segments.push({ phase: 'work', round, duration: work });
    if (round < session.rounds && rest > 0) {
      segments.push({ phase: 'rest', round, duration: rest });
    }
  }

  if (cooldown > 0) {
    segments.push({ phase: 'cooldown', round: session.rounds, duration: cooldown });
  }

  return segments;
};

// Total scheduled duration in seconds — used for history/stats.
export const totalScheduledSeconds = (session: WorkoutSession): number =>
  buildSchedule(session).reduce((sum, segment) => sum + segment.duration, 0);

/**
 * Rounds whose work segment ends inside (from, to] on the schedule timeline.
 *
 * The run screen advances `to` a second at a time, so a round is reported here
 * only once the clock has actually run through its work segment. A forward skip
 * moves the play position without passing this range, which is what keeps
 * skipped rounds out of the history.
 */
export const workRoundsCompletedBetween = (
  session: WorkoutSession,
  from: number,
  to: number,
): number[] => {
  const rounds: number[] = [];
  let cursor = 0;
  for (const segment of buildSchedule(session)) {
    const end = cursor + segment.duration;
    if (segment.phase === 'work' && end > from && end <= to) {
      rounds.push(segment.round);
    }
    cursor = end;
  }
  return rounds;
};

// Seconds of work contributed by the given rounds.
export const workSecondsForRounds = (
  session: WorkoutSession,
  rounds: readonly number[],
): number =>
  buildSchedule(session)
    .filter((segment) => segment.phase === 'work' && rounds.includes(segment.round))
    .reduce((sum, segment) => sum + segment.duration, 0);

// Cumulative start offset (seconds) of every segment — lets the run screen skip
// to the previous/next boundary by re-anchoring elapsed time.
export const segmentStarts = (session: WorkoutSession): number[] => {
  const starts: number[] = [];
  let cursor = 0;
  for (const segment of buildSchedule(session)) {
    starts.push(cursor);
    cursor += segment.duration;
  }
  return starts;
};

// Derive the full timer state purely from elapsed real seconds. Background-proof:
// callers pass wall-clock elapsed, so throttled/paused JS timers never drift.
export const computeTimerState = (
  session: WorkoutSession,
  elapsedSeconds: number,
): DerivedTimerState => {
  const segments = buildSchedule(session);
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
