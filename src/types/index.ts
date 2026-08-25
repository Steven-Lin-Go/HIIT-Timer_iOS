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
  totalDuration: number; // seconds
  estimatedCalories: number;
}

export type TimeFormat = 'MM:SS' | 'SS';
export type Units = 'metric' | 'imperial';

export interface AppSettings {
  timeFormat: TimeFormat;
  sound: boolean;
  vibration: boolean;
  countdownVoice: boolean;
  units: Units;
  bodyWeightKg: number; // used for calorie estimate
}
