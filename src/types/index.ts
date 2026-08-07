export interface WorkoutSession {
  id: string;
  name: string;
  workTime: number; // seconds
  restTime: number; // seconds
  rounds: number;
  createdAt: Date;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  currentRound: number;
  currentPhase: 'work' | 'rest' | 'prepare';
  timeRemaining: number;
  totalRounds: number;
}

export interface WorkoutHistory {
  id: string;
  sessionId: string;
  completedAt: Date;
  completedRounds: number;
  totalDuration: number;
}
