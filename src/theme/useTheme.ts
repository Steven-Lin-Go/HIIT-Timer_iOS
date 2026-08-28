import { useSettingsStore } from '../stores/settingsStore';
import { PALETTES, type Palette } from './palettes';

// Active color palette, driven by the theme setting.
export const useTheme = (): Palette => {
  const theme = useSettingsStore((s) => s.theme);
  return PALETTES[theme] ?? PALETTES.fitness;
};
