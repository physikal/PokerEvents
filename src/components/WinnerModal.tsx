import { useState } from 'react';
import { X } from 'lucide-react';
import { PokerEvent, UserInfo } from '../types';

interface WinnerModalProps {
  event: PokerEvent;
  participants: UserInfo[];
  onClose: () => void;
  onSetWinners: (winners: PokerEvent['winners']) => Promise<void>;
}

interface WinnerForm {
  first: { userId: string; prize: string };
  second: { userId: string; prize: string };
  third: { userId: string; prize: string };
}

export default function WinnerModal({ event, participants, onClose, onSetWinners }: WinnerModalProps) {
  const [winners, setWinners] = useState<WinnerForm>({
    first: { 
      userId: event.winners?.first?.userId || '', 
      prize: event.winners?.first?.prize?.toString() || '' 
    },
    second: { 
      userId: event.winners?.second?.userId || '', 
      prize: event.winners?.second?.prize?.toString() || '' 
    },
    third: { 
      userId: event.winners?.third?.userId || '', 
      prize: event.winners?.third?.prize?.toString() || '' 
    },
  });

  const [error, setError] = useState('');

  const validateWinners = (formData: WinnerForm) => {
    const prizes = [
      Number(formData.first.prize) || 0,
      Number(formData.second.prize) || 0,
      Number(formData.third.prize) || 0
    ];

    if (prizes[0] && prizes[1] && prizes[0] <= prizes[1]) {
      return '1st place prize must be greater than 2nd place';
    }

    if (prizes[1] && prizes[2] && prizes[1] <= prizes[2]) {
      return '2nd place prize must be greater than 3rd place';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateWinners(winners);
    if (validationError) {
      setError(validationError);
      return;
    }

    const formattedWinners: PokerEvent['winners'] = {};

    if (winners.first.userId) {
      formattedWinners.first = {
        userId: winners.first.userId,
        prize: Number(winners.first.prize) || 0
      };
    }

    if (winners.second.userId) {
      formattedWinners.second = {
        userId: winners.second.userId,
        prize: Number(winners.second.prize) || 0
      };
    }

    if (winners.third.userId) {
      formattedWinners.third = {
        userId: winners.third.userId,
        prize: Number(winners.third.prize) || 0
      };
    }

    if (Object.keys(formattedWinners).length === 0) {
      setError('Please select at least one winner');
      return;
    }

    await onSetWinners(formattedWinners);
  };

  const handleWinnerChange = (
    place: keyof WinnerForm,
    field: 'userId' | 'prize',
    value: string
  ) => {
    setWinners(prev => ({
      ...prev,
      [place]: {
        ...prev[place],
        [field]: value
      }
    }));
    setError('');
  };

  // Get display name for participant
  const getParticipantDisplay = (participant: UserInfo) => {
    return participant.displayName || participant.email || participant.id;
  };

  // Filter and sort participants
  const validParticipants = participants
    .filter(p => event.currentPlayers.includes(p.id))
    .sort((a, b) => {
      const aDisplay = getParticipantDisplay(a).toLowerCase();
      const bDisplay = getParticipantDisplay(b).toLowerCase();
      return aDisplay.localeCompare(bDisplay);
    });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">Set Winners</h2>

        {error && (
          <div className="mb-6 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {(['first', 'second', 'third'] as const).map((place, index) => (
            <div key={place} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'} Place Player
                </label>
                <select
                  className="input w-full"
                  value={winners[place].userId}
                  onChange={(e) => handleWinnerChange(place, 'userId', e.target.value)}
                >
                  <option value="">Select player</option>
                  {validParticipants.map((player) => (
                    <option key={player.id} value={player.id}>
                      {getParticipantDisplay(player)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prize Amount</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="Prize amount"
                  value={winners[place].prize}
                  onChange={(e) => handleWinnerChange(place, 'prize', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Save Winners
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}