import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { useSettingsStore } from '../stores/settingsStore';
import { BACKGROUND_SCRIM, THEME_PHOTOS, THEME_PHOTO_SCRIM } from '../theme/backdrops';
import { useTheme } from '../theme/useTheme';
import { ThemeMotif } from './ThemeMotif';

// The layer that sits behind every screen. Exactly one of three things shows:
//
//   user photo  -> only where allowCustom is set (the timer screens)
//   theme photo -> if one is registered in THEME_PHOTOS for the active theme
//   vector art  -> the ThemeMotif fallback, always available
//
// Photos are always covered by a scrim in the theme's base color. See
// theme/backdrops.ts for why that scrim is mandatory rather than optional.

interface Props {
  variant?: 'hero' | 'corner';
  /** Whether the user's own backdrop may be used here. */
  allowCustom?: boolean;
}

export function AppBackdrop({ variant = 'hero', allowCustom = false }: Props) {
  const theme = useSettingsStore((s) => s.theme);
  const backgroundUri = useSettingsStore((s) => s.backgroundUri);
  const backgroundLevel = useSettingsStore((s) => s.backgroundLevel);
  const c = useTheme();

  const custom = allowCustom && backgroundUri ? backgroundUri : null;
  const themePhoto = THEME_PHOTOS[theme];

  if (custom) {
    return (
      <Photo source={{ uri: custom }} scrim={c.scrim} opacity={BACKGROUND_SCRIM[backgroundLevel]} />
    );
  }
  if (themePhoto) {
    return <Photo source={themePhoto} scrim={c.scrim} opacity={THEME_PHOTO_SCRIM} />;
  }
  return <ThemeMotif variant={variant} />;
}

function Photo({
  source,
  scrim,
  opacity,
}: {
  source: ImageSourcePropType;
  scrim: string;
  opacity: number;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image source={source} resizeMode="cover" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: scrim, opacity }]} />
    </View>
  );
}

/** True when a photo (not the vector motif) is currently behind the content. */
export function useHasPhotoBackdrop(allowCustom: boolean): boolean {
  const theme = useSettingsStore((s) => s.theme);
  const backgroundUri = useSettingsStore((s) => s.backgroundUri);
  return Boolean((allowCustom && backgroundUri) || THEME_PHOTOS[theme]);
}
