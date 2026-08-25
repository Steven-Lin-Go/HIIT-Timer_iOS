import { create } from 'zustand';

import {
  isHealthAvailable,
  queryHeartRate,
  requestHeartRateAuthorization,
} from '../health/healthkit';
import type { HeartRateSample } from '../health/heartRate';
import type { StatsPeriod } from '../stats/aggregate';

type HeartRateStatus = 'idle' | 'unavailable' | 'denied' | 'loading' | 'ready';

const PERIOD_DAYS: Record<StatsPeriod, number> = { week: 7, month: 30, year: 365 };

interface HeartRateStore {
  status: HeartRateStatus;
  samples: HeartRateSample[];
  connect: () => Promise<void>;
  load: (period: StatsPeriod) => Promise<void>;
}

// Heart rate is read live from HealthKit (not persisted). `connect` handles the
// permission prompt; `load` fetches the window for the current stats period.
export const useHeartRateStore = create<HeartRateStore>((set, get) => ({
  status: isHealthAvailable() ? 'idle' : 'unavailable',
  samples: [],

  connect: async () => {
    if (!isHealthAvailable()) {
      set({ status: 'unavailable' });
      return;
    }
    const granted = await requestHeartRateAuthorization();
    set({ status: granted ? 'idle' : 'denied' });
  },

  load: async (period) => {
    if (!isHealthAvailable()) {
      set({ status: 'unavailable' });
      return;
    }
    if (get().status === 'denied') return;

    set({ status: 'loading' });
    const end = new Date();
    const start = new Date(end.getTime() - PERIOD_DAYS[period] * 24 * 60 * 60 * 1000);
    const samples = await queryHeartRate(start, end);
    set({ samples, status: 'ready' });
  },
}));
