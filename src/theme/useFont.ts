import { useSettingsStore } from '../stores/settingsStore';
import { fontFor, type FontScale } from './fitness';

// Active type scale, driven by the language setting. Returns one of two module
// constants, so the result is reference-stable and safe as a useMemo dependency.
export const useFont = (): FontScale => fontFor(useSettingsStore((s) => s.language));
