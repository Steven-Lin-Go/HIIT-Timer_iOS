// Color palettes for the four UI styles from the mockups. Layout tokens
// (radius/spacing/font) stay shared in fitness.ts; only colors swap per theme.

export type ThemeName = 'fitness' | 'bohemia' | 'zen' | 'ikea';

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  muted: string;
  work: string; // primary accent (work phase)
  rest: string;
  prepare: string;
  cooldown: string;
  danger: string;
  dutchOrange: string; // selected timer-mode highlight
  statusBar: 'light' | 'dark';
}

export const PALETTES: Record<ThemeName, Palette> = {
  // 01 Fitness — dark, high-contrast neon.
  fitness: {
    bg: '#050B16',
    surface: '#0E1626',
    surfaceAlt: '#14213B',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#FFFFFF',
    muted: '#9BA7C7',
    work: '#FF3B3B',
    rest: '#7CF1B1',
    prepare: '#8D9BFF',
    cooldown: '#FFD36B',
    danger: '#FF5D5D',
    dutchOrange: '#FF7F00',
    statusBar: 'light',
  },
  // 02 Bohemia — warm earth tones, light.
  bohemia: {
    bg: '#F3E9DC',
    surface: '#EADBC8',
    surfaceAlt: '#DFC9AE',
    border: 'rgba(90, 60, 40, 0.16)',
    text: '#4A3728',
    muted: '#8A7563',
    work: '#B5533C',
    rest: '#7E8B6B',
    prepare: '#9C7A5B',
    cooldown: '#C99A4E',
    danger: '#A94E3B',
    dutchOrange: '#C4732A',
    statusBar: 'dark',
  },
  // 03 Zen — ink on paper, minimal, seal red.
  zen: {
    bg: '#F4F2ED',
    surface: '#FCFBF8',
    surfaceAlt: '#E7E3DA',
    border: 'rgba(30, 30, 30, 0.12)',
    text: '#1E1B18',
    muted: '#7A756E',
    work: '#C0392B',
    rest: '#6B7A5E',
    prepare: '#5A6675',
    cooldown: '#B08A3E',
    danger: '#C0392B',
    dutchOrange: '#CC6B29',
    statusBar: 'dark',
  },
  // 04 Natural (Ikea) — light, natural green/wood.
  ikea: {
    bg: '#F5F3EE',
    surface: '#FFFFFF',
    surfaceAlt: '#E8EDE4',
    border: 'rgba(40, 60, 40, 0.12)',
    text: '#2E3A2E',
    muted: '#7C877C',
    work: '#4C7A34',
    rest: '#8FB98A',
    prepare: '#6D9DC5',
    cooldown: '#D9A441',
    danger: '#C0553B',
    dutchOrange: '#E08A2B',
    statusBar: 'dark',
  },
};

export type TimerPhaseKey = 'prepare' | 'work' | 'rest' | 'cooldown' | 'complete';

// Per-phase accent pulled from the active palette (labels come from i18n).
export const phaseAccent = (p: Palette, phase: TimerPhaseKey): string =>
  phase === 'complete' ? p.rest : p[phase];

export const difficultyColor = (p: Palette, d: string): string =>
  d === 'EASY' ? p.rest : d === 'HARD' ? p.work : p.cooldown;
