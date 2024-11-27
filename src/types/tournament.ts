export interface BlindLevel {
  id: string;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number; // in minutes
}

export interface ChipTemplate {
  id: string;
  name: string;
  chips: {
    value: number;
    color: string;
    quantity: number;
  }[];
}

export interface BlindTemplate {
  id: string;
  name: string;
  levels: BlindLevel[];
}

export interface Tournament {
  id: string;
  name: string;
  currentLevel: number;
  levels: BlindLevel[];
  timeRemaining: number; // in seconds
  isRunning: boolean;
  isPaused: boolean;
  chipTemplate?: ChipTemplate;
}

export interface TournamentTemplate {
  id: string;
  name: string;
  blindTemplate: BlindTemplate;
  chipTemplate: ChipTemplate;
}