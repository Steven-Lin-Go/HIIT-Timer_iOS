import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncStorage } from '../lib/persist';
import type { AppSettings } from '../types';

interface SettingsStore extends AppSettings {
  update: (patch: Partial<AppSettings>) => void;
}

const DEFAULTS: AppSettings = {
  timeFormat: 'MM:SS',
  sound: true,
  vibration: true,
  countdownVoice: false,
  voiceLanguage: 'zh-TW',
  bodyWeightKg: 70,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      update: (patch) => set(patch),
    }),
    { name: 'hiit-settings', storage: asyncStorage },
  ),
);
