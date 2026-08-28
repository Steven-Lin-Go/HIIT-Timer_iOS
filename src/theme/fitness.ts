// Shared layout tokens, identical across all themes. Colors live in palettes.ts
// and are selected at runtime via useTheme().

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
