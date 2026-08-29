export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface WorkoutSession {
  id: string;
  name: string;
  workTime: number; // seconds
  restTime: number; // seconds
  rounds: number;
  prepareTime?: number; // seconds, defaults to PREPARE_SECONDS
  cooldownTime?: number; // seconds, 0/undefined = no cooldown
  difficulty?: Difficulty;
  isPreset?: boolean; // true = built-in, false/undefined = user-created
  createdAt: Date;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  currentRound: number;
  currentPhase: 'prepare' | 'work' | 'rest' | 'cooldown';
  timeRemaining: number;
  totalRounds: number;
}

export interface HistoryEntry {
  id: string;
  sessionId: string;
  sessionName: string;
  completedAt: string; // ISO string, JSON-safe for persistence
  completedRounds: number;
  totalDuration: number; // seconds, whole session including rest and cooldown
  workSeconds: number; // seconds spent in work intervals only
}

export type TimeFormat = 'MM:SS' | 'SS';

// How strongly a background photo is allowed to show through. Each level maps
// to a scrim opacity in theme/backdrops.ts; the strongest level still keeps a
// substantial wash over the photo so timer digits stay readable.
export type BackgroundLevel = 'subtle' | 'medium' | 'bold';

// Metric-only per product scope. `language` drives both UI text and voice
// countdown (zh-TW / English). `theme` selects one of the four UI styles.
export interface AppSettings {
  timeFormat: TimeFormat;
  sound: boolean;
  vibration: boolean;
  countdownVoice: boolean;
  language: 'zh-TW' | 'en';
  theme: 'fitness' | 'bohemia' | 'zen' | 'ikea';
  // Optional user-supplied backdrop for the timer screens. Stored as a file://
  // URI inside the app's document directory, so it survives cache eviction.
  backgroundUri: string | null;
  backgroundLevel: BackgroundLevel;
}
