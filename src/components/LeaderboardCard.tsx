import { GroupStats } from '../types';

interface LeaderboardCardProps {
  stats: GroupStats[];
}

export default function LeaderboardCard({ stats }: LeaderboardCardProps) {
  const sortedStats = [...stats].sort((a, b) => b.gamesWon - a.gamesWon);

  return (
    <div className="space-y-4">
      {sortedStats.map((player, index) => (
        <div
          key={player.userId}
          className="p-4 bg-gray-800 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold text-gray-400 w-6">
              #{index + 1}
            </div>
            <div>
              <div className="font-semibold">{player.displayName}</div>
              <div className="text-sm text-gray-400">
                {player.gamesWon} wins / {player.gamesPlayed} games
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-poker-gold font-semibold">
              ${player.totalEarnings}
            </div>
            <div className="text-sm text-gray-400">
              {((player.gamesWon / player.gamesPlayed) * 100).toFixed(1)}% win rate
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}