import { Platform } from 'react-native';

import type { HeartRateSample } from './heartRate';

const HEART_RATE = 'HKQuantityTypeIdentifierHeartRate';

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

// Read heart-rate samples in a date window, normalized to { bpm, date }.
export const queryHeartRate = async (
  startDate: Date,
  endDate: Date,
): Promise<HeartRateSample[]> => {
  const mod = getModule();
  if (!mod) return [];
  try {
    const samples = await mod.queryQuantitySamples(HEART_RATE, {
      unit: 'count/min',
      filter: { date: { startDate, endDate } },
      limit: 0, // all
      ascending: true,
    });
    return (samples ?? []).map((sample: { quantity: number; startDate: Date | string }) => ({
      bpm: Math.round(sample.quantity),
      date:
        sample.startDate instanceof Date
          ? sample.startDate.toISOString()
          : String(sample.startDate),
    }));
  } catch {
    return [];
  }
};
