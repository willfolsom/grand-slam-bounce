export type CourtType = 'clay' | 'hard' | 'grass';

export interface CourtTheme {
  courtColor: string;
  lineColor: string;
  surroundColor: string;
  name: string;
  label: string;
}

export const COURT_THEMES: Record<CourtType, CourtTheme> = {
  clay: {
    courtColor: '#c2622d',
    lineColor: '#ffffff',
    surroundColor: '#b8542a',
    name: 'Roland Garros',
    label: 'Clay Court',
  },
  hard: {
    courtColor: '#1a6bc4',
    lineColor: '#ffffff',
    surroundColor: '#1a4a8a',
    name: 'US Open',
    label: 'Hard Court',
  },
  grass: {
    courtColor: '#2d8c3c',
    lineColor: '#ffffff',
    surroundColor: '#1a6628',
    name: 'Wimbledon',
    label: 'Grass Court',
  },
};

export interface BallState {
  position: [number, number, number];
  velocity: [number, number, number];
  hasBounced: boolean;
  bounceCount: number;
  isServing: boolean;
  lastHitBy: 'player' | 'ai' | null;
}

export interface GameState {
  playerScore: number;
  aiScore: number;
  playerX: number;
  playerZ: number;
  isSwinging: boolean;
  gameStarted: boolean;
  pointOver: boolean;
  message: string;
}
