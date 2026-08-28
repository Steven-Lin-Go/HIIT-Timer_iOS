import { useSettingsStore } from '../stores/settingsStore';
import { STRINGS, type StringKey } from './strings';

// Translator bound to the current language setting. English is the fallback.
export const useT = (): ((key: StringKey) => string) => {
  const lang = useSettingsStore((s) => s.language);
  return (key) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
};
