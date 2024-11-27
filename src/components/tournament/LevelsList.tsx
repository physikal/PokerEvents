import { BlindLevel } from '../../types/tournament';

interface LevelsListProps {
  levels: BlindLevel[];
  currentLevel: number;
}

export default function LevelsList({ levels, currentLevel }: LevelsListProps) {
  return (
    <div className="card bg-gray-900">
      <h2 className="text-xl font-bold mb-4">Blind Structure</h2>
      <div className="space-y-2">
        {levels.map((level, index) => (
          <div
            key={level.id}
            className={`p-3 rounded-lg ${
              index === currentLevel
                ? 'bg-poker-red text-white'
                : index < currentLevel
                ? 'bg-gray-800 text-gray-400'
                : 'bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Level {index + 1}</span>
                <span className="ml-4">
                  {level.smallBlind}/{level.bigBlind}
                </span>
                {level.ante > 0 && (
                  <span className="ml-2 text-sm">Ante: {level.ante}</span>
                )}
              </div>
              <span>{level.duration}min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}