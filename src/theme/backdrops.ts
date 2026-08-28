import type { ImageSourcePropType } from 'react-native';

import type { BackgroundLevel } from '../types';
import type { ThemeName } from './palettes';

// Backdrop artwork and the legibility rules that govern it.
//
// Two sources of imagery can sit behind the timer screens:
//   1. an optional per-theme photo shipped in assets/themes/ (see THEME_PHOTOS)
//   2. a photo the user picks from their library (settings.backgroundUri)
// When neither is present the vector artwork in components/ThemeMotif.tsx is
// used instead, so every theme always has a distinct look.
//
// Whatever the source, the image is never shown raw. A scrim in the theme's
// base color is painted over it, and SCRIM_FLOOR caps how much photo can ever
// reach the screen. That cap is the reason the timer digits stay readable no
// matter what the user picks -- a busy, bright, or high-contrast photo still
// ends up as a damped wash rather than competing with the numbers.

/** Hard limit on photo visibility. 0.45 scrim = at most 55% photo. */
export const SCRIM_FLOOR = 0.45;

/** Scrim opacity per user-selected level. Higher scrim = fainter photo. */
export const BACKGROUND_SCRIM: Record<BackgroundLevel, number> = {
  subtle: 0.78,
  medium: 0.62,
  bold: SCRIM_FLOOR,
};

/** Scrim used for the built-in per-theme photos, which are pre-selected. */
export const THEME_PHOTO_SCRIM = 0.55;

/**
 * Optional bitmap backdrop per theme. Metro requires static literals, so a
 * photo only takes effect once it is both dropped into assets/themes/ *and*
 * uncommented here. Leaving an entry out is fine -- that theme falls back to
 * its vector motif.
 *
 * Recommended: 1290x2796 JPEG, composed so the busy detail sits low in the
 * frame (the ring and digits occupy the middle).
 *
 *   fitness: require('../../assets/themes/fitness.jpg'),
 *   bohemia: require('../../assets/themes/bohemia.jpg'),
 *   zen: require('../../assets/themes/zen.jpg'),
 *   ikea: require('../../assets/themes/ikea.jpg'),
 */
export const THEME_PHOTOS: Partial<Record<ThemeName, ImageSourcePropType>> = {};
