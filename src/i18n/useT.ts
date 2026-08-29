import { useSettingsStore } from '../stores/settingsStore';
import { interpolate, type Vars } from './interpolate';
import { STRINGS, type StringKey } from './strings';

// Translator bound to the current language setting. English is the fallback.
// Placeholders let a count sit wherever each language needs it in the sentence.
export const useT = (): ((key: StringKey, vars?: Vars) => string) => {
  const lang = useSettingsStore((s) => s.language);
  return (key, vars) => interpolate(STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key, vars);
};
