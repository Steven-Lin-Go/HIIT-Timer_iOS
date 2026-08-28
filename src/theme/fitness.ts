// Shared layout tokens, identical across all themes. Colors live in palettes.ts
// and are selected at runtime via useTheme().

import type { Lang } from '../i18n/strings';

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
} as const;

// Type scale for text. Read it through useFont() rather than importing `font`
// directly, so sizes follow the interface language.
export const font = {
  micro: 10, // chart ticks, stat hints
  tab: 13, // bottom tab bar labels
  chip: 13, // difficulty badges
  small: 13,
  period: 15, // stats period selector (week / month / year)
  subTab: 16, // section tabs (presets / my workouts)
  body: 15,
  label: 16, // list rows, inputs, card titles
  action: 18, // primary buttons
  h3: 20,
  // Numeric readouts. Not scaled -- these show digits, and the layouts around
  // them (stat tiles, the countdown ring) are sized to the current values.
  h2: 28,
  h1: 42,
  timer: 80,
} as const;

export type FontScale = Record<keyof typeof font, number>;

/**
 * Traditional Chinese glyphs carry far more stroke detail than Latin letters,
 * so at a shared nominal size they read smaller and denser. Every size that
 * carries words is bumped when the UI is in Chinese; digit-only and icon sizes
 * are left alone.
 */
export const ZH_FONT_BUMP = 2;

const zhFont: FontScale = {
  ...font,
  micro: font.micro + ZH_FONT_BUMP,
  tab: font.tab + ZH_FONT_BUMP,
  chip: font.chip + ZH_FONT_BUMP,
  small: font.small + ZH_FONT_BUMP,
  period: font.period + ZH_FONT_BUMP,
  subTab: font.subTab + ZH_FONT_BUMP,
  body: font.body + ZH_FONT_BUMP,
  label: font.label + ZH_FONT_BUMP,
  action: font.action + ZH_FONT_BUMP,
  h3: font.h3 + ZH_FONT_BUMP,
};

export const fontFor = (lang: Lang): FontScale => (lang === 'zh-TW' ? zhFont : font);
