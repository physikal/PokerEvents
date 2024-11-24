import { GroupStats } from '../types';

interface LeaderboardCardProps {
  stats: GroupStats[];
  sortBy: 'wins' | 'games';
}

export default function LeaderboardCard({ stats, sortBy }: LeaderboardCardProps) {
  const sortedStats = [...stats].sort((a, b) => {
    if (sortBy === 'wins') {
      return b.gamesWon - a.gamesWon;
    }
    return b.gamesPlayed - a.gamesPlayed;
  });

  return (
    <div className="space-y-3">
      {sortedStats.map((player, index) => (
        <div
          key={player.userId}
          className="p-3 bg-gray-800 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-gray-400 w-6">
              #{index + 1}
            </div>
            <div>
              <div className="font-semibold">{player.displayName}</div>
              {sortBy === 'wins' ? (
                <div className="text-sm text-gray-400">
                  {player.gamesWon} wins ({((player.gamesWon / player.gamesPlayed) * 100).toFixed(1)}%)
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  {player.gamesPlayed} games played
                </div>
              )}
            </div>
          </div>
          {sortBy === 'wins' && (
            <div className="text-right">
              <div className="text-poker-gold font-semibold">
                ${player.totalEarnings}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}