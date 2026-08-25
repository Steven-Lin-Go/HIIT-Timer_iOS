import type { TimeFormat } from '../types';

// Clock for the big timer. 'MM:SS' always; 'SS' shows raw seconds under a
// minute, then falls back to MM:SS so long segments stay readable.
export const formatClock = (seconds: number, mode: TimeFormat = 'MM:SS'): string => {
  const safe = Math.max(0, Math.floor(seconds));
  if (mode === 'SS' && safe < 60) {
    return safe.toString();
  }
  const m = Math.floor(safe / 60).toString().padStart(2, '0');
  const s = (safe % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Human duration for stats/cards, e.g. 2:48:30 or 12:30.
export const formatDuration = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};
