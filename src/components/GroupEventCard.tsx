import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { PokerEvent, UserInfo } from '../types';
import { formatToPacific } from '../utils/dateUtils';

interface GroupEventCardProps {
  event: PokerEvent;
  participants: UserInfo[];
}

export default function GroupEventCard({ event, participants }: GroupEventCardProps) {
  const getParticipantName = (userId: string) => {
    const participant = participants.find(p => p.id === userId);
    return participant?.displayName || participant?.email || userId;
  };

  return (
    <Link
      to={`/event/${event.id}`}
      className="block card hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{event.title}</h3>
          <p className="text-gray-400">
            {formatToPacific(event.date)} at {event.location}
          </p>
          <p className="text-sm text-poker-red font-medium mt-1">
            ${event.buyIn} buy-in
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-400">
            {event.currentPlayers.length}/{event.maxPlayers} players
          </p>
          {event.winners && (
            <div className="mt-2 text-sm">
              {event.winners.first && (
                <div className="text-poker-gold flex items-center justify-end gap-1">
                  <Trophy size={14} />
                  {getParticipantName(event.winners.first.userId)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}