import type { TimerPhase } from '../timer/schedule';

// Style 01 "Fitness" — dark, high-contrast, neon accents. Single source of
// truth for colors/spacing/typography so screens never hardcode hex values.
export const colors = {
  bg: '#050B16',
  surface: '#0E1626',
  surfaceAlt: '#14213B',
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#FFFFFF',
  muted: '#9BA7C7',
  work: '#FF3B3B', // red — the brand accent
  rest: '#7CF1B1', // green
  prepare: '#8D9BFF', // blue
  cooldown: '#FFD36B', // amber
  danger: '#FF5D5D',
} as const;

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

export const font = {
  h1: 42,
  h2: 28,
  h3: 20,
  body: 15,
  small: 13,
  timer: 80,
} as const;

// Per-phase accent + human labels, shared by home/run screens and cues.
export const PHASE_META: Record<
  TimerPhase | 'complete',
  { label: string; accent: string }
> = {
  prepare: { label: 'PREPARE', accent: colors.prepare },
  work: { label: 'WORK', accent: colors.work },
  rest: { label: 'REST', accent: colors.rest },
  cooldown: { label: 'COOL DOWN', accent: colors.cooldown },
  complete: { label: 'DONE', accent: colors.rest },
};

export const difficultyColor: Record<string, string> = {
  EASY: colors.rest,
  MEDIUM: colors.cooldown,
  HARD: colors.work,
};
