import { BlindTemplate, ChipTemplate, TournamentTemplate } from '../types/tournament';

export const DEFAULT_BLIND_TEMPLATE: BlindTemplate = {
  id: 'default-blinds',
  name: 'Standard Structure',
  levels: [
    { id: '1', smallBlind: 25, bigBlind: 50, ante: 0, duration: 20 },
    { id: '2', smallBlind: 50, bigBlind: 100, ante: 0, duration: 20 },
    { id: '3', smallBlind: 100, bigBlind: 200, ante: 25, duration: 20 },
    { id: '4', smallBlind: 200, bigBlind: 400, ante: 50, duration: 15 },
    { id: '5', smallBlind: 300, bigBlind: 600, ante: 75, duration: 15 },
    { id: '6', smallBlind: 400, bigBlind: 800, ante: 100, duration: 15 },
    { id: '7', smallBlind: 500, bigBlind: 1000, ante: 125, duration: 15 },
    { id: '8', smallBlind: 1000, bigBlind: 2000, ante: 250, duration: 10 },
  ],
};

export const DEFAULT_CHIP_TEMPLATE: ChipTemplate = {
  id: 'default-chips',
  name: 'Standard Stack',
  chips: [
    { value: 25, color: '#DC2626', quantity: 20 },  // Red
    { value: 100, color: '#2563EB', quantity: 20 }, // Blue
    { value: 500, color: '#059669', quantity: 10 }, // Green
    { value: 1000, color: '#000000', quantity: 5 }, // Black
  ],
};

export const TURBO_BLIND_TEMPLATE: BlindTemplate = {
  id: 'turbo-blinds',
  name: 'Turbo Structure',
  levels: [
    { id: '1', smallBlind: 25, bigBlind: 50, ante: 0, duration: 10 },
    { id: '2', smallBlind: 50, bigBlind: 100, ante: 25, duration: 10 },
    { id: '3', smallBlind: 100, bigBlind: 200, ante: 50, duration: 10 },
    { id: '4', smallBlind: 200, bigBlind: 400, ante: 100, duration: 8 },
    { id: '5', smallBlind: 400, bigBlind: 800, ante: 200, duration: 8 },
    { id: '6', smallBlind: 800, bigBlind: 1600, ante: 400, duration: 8 },
  ],
};

export const HIGH_ROLLER_CHIP_TEMPLATE: ChipTemplate = {
  id: 'high-roller-chips',
  name: 'High Roller Stack',
  chips: [
    { value: 100, color: '#DC2626', quantity: 20 },   // Red
    { value: 500, color: '#2563EB', quantity: 20 },   // Blue
    { value: 1000, color: '#059669', quantity: 15 },  // Green
    { value: 5000, color: '#000000', quantity: 10 },  // Black
    { value: 10000, color: '#7C3AED', quantity: 5 },  // Purple
  ],
};

export const DEFAULT_TOURNAMENT_TEMPLATE: TournamentTemplate = {
  id: 'default-tournament',
  name: 'Standard Tournament',
  blindTemplate: DEFAULT_BLIND_TEMPLATE,
  chipTemplate: DEFAULT_CHIP_TEMPLATE,
};

export const TURBO_TOURNAMENT_TEMPLATE: TournamentTemplate = {
  id: 'turbo-tournament',
  name: 'Turbo Tournament',
  blindTemplate: TURBO_BLIND_TEMPLATE,
  chipTemplate: DEFAULT_CHIP_TEMPLATE,
};

export const HIGH_ROLLER_TOURNAMENT_TEMPLATE: TournamentTemplate = {
  id: 'high-roller-tournament',
  name: 'High Roller Tournament',
  blindTemplate: {
    ...TURBO_BLIND_TEMPLATE,
    levels: TURBO_BLIND_TEMPLATE.levels.map(level => ({
      ...level,
      smallBlind: level.smallBlind * 10,
      bigBlind: level.bigBlind * 10,
      ante: level.ante * 10,
    })),
  },
  chipTemplate: HIGH_ROLLER_CHIP_TEMPLATE,
};

export const DEFAULT_TEMPLATES = [
  DEFAULT_TOURNAMENT_TEMPLATE,
  TURBO_TOURNAMENT_TEMPLATE,
  HIGH_ROLLER_TOURNAMENT_TEMPLATE,
];