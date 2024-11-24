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
  groupId?: string;
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
  groups?: string[];
}

export interface UserInfo {
  id: string;
  email: string;
  displayName?: string;
}

export interface PokerGroup {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  invitedMembers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupStats {
  userId: string;
  displayName: string;
  gamesPlayed: number;
  gamesWon: number;
  totalEarnings: number;
}