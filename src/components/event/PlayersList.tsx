import { Users } from 'lucide-react';
import { UserInfo } from '../../types';

interface PlayersListProps {
  participants: UserInfo[];
  ownerId: string;
}

export default function PlayersList({ participants, ownerId }: PlayersListProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users size={20} />
        Attending Players ({participants.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {participants.map((player) => (
          <div
            key={player.id}
            className="p-3 bg-gray-800 rounded-lg flex items-center justify-between"
          >
            <span>{player.displayName || player.email}</span>
            {player.id === ownerId && (
              <span className="text-xs bg-poker-red px-2 py-1 rounded">Host</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}