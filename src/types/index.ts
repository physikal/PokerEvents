export interface PokerEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  buyIn: number;
  maxPlayers: number;
  currentPlayers: string[];
  invitedPlayers: string[];
  ownerId: string;
  winners?: {
    first?: { userId: string; prize: number };
    second?: { userId: string; prize: number };
    third?: { userId: string; prize: number };
  };
  status: 'upcoming' | 'in-progress' | 'completed';
  createdAt: string;
  timezone?: string;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  upcomingGames: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}