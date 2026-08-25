// A single heart-rate reading pulled from HealthKit, reduced to what the UI
// needs. `date` is an ISO string so it stays JSON-friendly and testable.
export interface HeartRateSample {
  bpm: number;
  date: string;
}

export const averageBpm = (samples: HeartRateSample[]): number => {
  if (samples.length === 0) return 0;
  const sum = samples.reduce((s, x) => s + x.bpm, 0);
  return Math.round(sum / samples.length);
};

export const maxBpm = (samples: HeartRateSample[]): number =>
  samples.reduce((m, x) => Math.max(m, x.bpm), 0);

export const minBpm = (samples: HeartRateSample[]): number =>
  samples.reduce((m, x) => (m === 0 ? x.bpm : Math.min(m, x.bpm)), 0);
