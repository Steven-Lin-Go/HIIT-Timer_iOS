import { Platform } from 'react-native';

const HEART_RATE = 'HKQuantityTypeIdentifierHeartRate';

export interface HeartRateStats {
  avg: number;
  max: number;
}

// Lazily require the native module so the app still runs where it isn't linked
// (Expo Go, Android, the test runner). Cached: undefined = not tried yet,
// null = unavailable.
let cached: unknown;
const getModule = (): any | null => {
  if (cached !== undefined) return cached as any | null;
  if (Platform.OS !== 'ios') {
    cached = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('@kingstinct/react-native-healthkit');
  } catch {
    cached = null;
  }
  return cached as any | null;
};

// True only on a real iOS build where HealthKit exists and is enabled.
export const isHealthAvailable = (): boolean => {
  const mod = getModule();
  if (!mod) return false;
  try {
    return Boolean(mod.isHealthDataAvailable());
  } catch {
    return false;
  }
};

// Prompt for read access to heart rate. Returns false if unavailable/denied.
export const requestHeartRateAuthorization = async (): Promise<boolean> => {
  const mod = getModule();
  if (!mod) return false;
  try {
    return await mod.requestAuthorization({ toRead: [HEART_RATE] });
  } catch {
    return false;
  }
};

// Ask HealthKit to compute avg/max over the window. Using a statistics query
// (not raw samples) keeps this O(1) over the bridge even for a year — pulling
// every sample froze the UI for tens of seconds.
export const queryHeartRateStats = async (
  startDate: Date,
  endDate: Date,
): Promise<HeartRateStats> => {
  const mod = getModule();
  if (!mod) return { avg: 0, max: 0 };
  try {
    const res = await mod.queryStatisticsForQuantity(
      HEART_RATE,
      ['discreteAverage', 'discreteMax'],
      { unit: 'count/min', filter: { date: { startDate, endDate } } },
    );
    return {
      avg: Math.round(res?.averageQuantity?.quantity ?? 0),
      max: Math.round(res?.maximumQuantity?.quantity ?? 0),
    };
  } catch {
    return { avg: 0, max: 0 };
  }
};
