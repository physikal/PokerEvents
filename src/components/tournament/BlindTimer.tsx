import { useState, useEffect, useCallback } from 'react';
import { Timer, Pause, Play, SkipForward, Settings } from 'lucide-react';
import { Tournament, BlindLevel } from '../../types/tournament';
import { formatTime } from '../../utils/timeUtils';

interface BlindTimerProps {
  tournament: Tournament;
  onTimeUpdate: (timeRemaining: number) => void;
  onLevelComplete: () => void;
  onTogglePause: () => void;
}

export default function BlindTimer({ tournament, onTimeUpdate, onLevelComplete, onTogglePause }: BlindTimerProps) {
  const [timeDisplay, setTimeDisplay] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (tournament.isRunning && !tournament.isPaused) {
      interval = setInterval(() => {
        const newTime = tournament.timeRemaining - 1;
        onTimeUpdate(newTime);

        if (newTime <= 0) {
          onLevelComplete();
        }
      }, 1000);
    }

    setTimeDisplay(formatTime(tournament.timeRemaining));

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [tournament.isRunning, tournament.isPaused, tournament.timeRemaining]);

  const currentLevel = tournament.levels[tournament.currentLevel];

  return (
    <div className="card bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Level {tournament.currentLevel + 1}</h2>
          <p className="text-gray-400">
            Blinds: {currentLevel.smallBlind}/{currentLevel.bigBlind}
            {currentLevel.ante > 0 && ` - Ante: ${currentLevel.ante}`}
          </p>
        </div>
        <div className="text-4xl font-bold font-mono">{timeDisplay}</div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onTogglePause}
          className="btn-primary p-3 rounded-full"
          title={tournament.isPaused ? 'Resume' : 'Pause'}
        >
          {tournament.isPaused ? <Play size={24} /> : <Pause size={24} />}
        </button>
        <button
          onClick={onLevelComplete}
          className="btn-secondary p-3 rounded-full"
          title="Next Level"
        >
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
}