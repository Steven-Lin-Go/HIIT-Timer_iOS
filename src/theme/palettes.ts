// Color palettes for the four UI styles from the mockups. Layout tokens
// (radius/spacing/font) stay shared in fitness.ts; only colors swap per theme.
//
// Beyond flat colors each palette also carries the tokens that give a theme its
// *character*: the ink colors its decorative motif is drawn with (see
// components/ThemeMotif.tsx), the stroke treatment of the countdown ring, and
// the scrim/plate colors that keep text readable over a background image.

export type ThemeName = 'fitness' | 'bohemia' | 'zen' | 'ikea';

// How the countdown ring is drawn. Each maps to a branch in CircularTimer.
export type RingStyle =
  | 'bold' // fitness: thick, even, hard-edged
  | 'brush' // bohemia: two-tone painted arcs with soft caps
  | 'enso' // zen: hand-drawn ink circle, uneven weight, open gap
  | 'fine'; // ikea: thin track with a rounded progress cap

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

  // --- Style character ---
  motifInk: string; // primary stroke/fill of the decorative artwork
  motifSoft: string; // secondary, lower-emphasis artwork color
  motifOpacity: number; // how loudly the built-in motif reads (0-1)
  ringStyle: RingStyle;

  // --- Background-image legibility ---
  // scrim is laid over a photo to pull it back toward the theme's base tone;
  // plate is a translucent panel placed behind text that would otherwise float
  // directly on the photo.
  scrim: string;
  plate: string;
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
    motifInk: '#FF3B3B',
    motifSoft: '#33415F',
    motifOpacity: 0.55,
    ringStyle: 'bold',
    scrim: '#050B16',
    plate: 'rgba(5, 11, 22, 0.72)',
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
    motifInk: '#B5533C',
    motifSoft: '#7E8B6B',
    motifOpacity: 0.5,
    ringStyle: 'brush',
    scrim: '#F3E9DC',
    plate: 'rgba(243, 233, 220, 0.78)',
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
    motifInk: '#2B2724',
    motifSoft: '#9A948B',
    motifOpacity: 0.42,
    ringStyle: 'enso',
    scrim: '#F4F2ED',
    plate: 'rgba(244, 242, 237, 0.8)',
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
    motifInk: '#5C7F4A',
    motifSoft: '#C3B49B',
    motifOpacity: 0.5,
    ringStyle: 'fine',
    scrim: '#F5F3EE',
    plate: 'rgba(245, 243, 238, 0.78)',
  },
};

export type TimerPhaseKey = 'prepare' | 'work' | 'rest' | 'cooldown' | 'complete';

// Per-phase accent pulled from the active palette (labels come from i18n).
export const phaseAccent = (p: Palette, phase: TimerPhaseKey): string =>
  phase === 'complete' ? p.rest : p[phase];

export const difficultyColor = (p: Palette, d: string): string =>
  d === 'EASY' ? p.rest : d === 'HARD' ? p.work : p.cooldown;
