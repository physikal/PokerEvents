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
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  totalEarnings: number;
  upcomingGames: number;
}