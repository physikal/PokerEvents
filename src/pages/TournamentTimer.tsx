import { useState } from 'react';
import { Tournament, TournamentTemplate } from '../types/tournament';
import BlindTimer from '../components/tournament/BlindTimer';
import LevelsList from '../components/tournament/LevelsList';
import ChipStack from '../components/tournament/ChipStack';
import TemplateSelector from '../components/tournament/TemplateSelector';
import { DEFAULT_TOURNAMENT_TEMPLATE } from '../data/defaultTemplates';

function createTournamentFromTemplate(template: TournamentTemplate): Tournament {
  return {
    id: template.id,
    name: template.name,
    currentLevel: 0,
    levels: template.blindTemplate.levels,
    timeRemaining: template.blindTemplate.levels[0].duration * 60,
    isRunning: true,
    isPaused: true,
    chipTemplate: template.chipTemplate,
  };
}

export default function TournamentTimer() {
  const [tournament, setTournament] = useState<Tournament>(
    createTournamentFromTemplate(DEFAULT_TOURNAMENT_TEMPLATE)
  );

  const handleTimeUpdate = (timeRemaining: number) => {
    setTournament(prev => ({
      ...prev,
      timeRemaining,
    }));
  };

  const handleLevelComplete = () => {
    if (tournament.currentLevel < tournament.levels.length - 1) {
      const nextLevel = tournament.currentLevel + 1;
      setTournament(prev => ({
        ...prev,
        currentLevel: nextLevel,
        timeRemaining: prev.levels[nextLevel].duration * 60,
      }));
    } else {
      setTournament(prev => ({
        ...prev,
        isRunning: false,
      }));
    }
  };

  const handleTogglePause = () => {
    setTournament(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const handleTemplateChange = (template: TournamentTemplate) => {
    setTournament(createTournamentFromTemplate(template));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <BlindTimer
            tournament={tournament}
            onTimeUpdate={handleTimeUpdate}
            onLevelComplete={handleLevelComplete}
            onTogglePause={handleTogglePause}
          />
        </div>
        <TemplateSelector onSelect={handleTemplateChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LevelsList
          levels={tournament.levels}
          currentLevel={tournament.currentLevel}
        />
        
        {tournament.chipTemplate && (
          <ChipStack template={tournament.chipTemplate} />
        )}
      </div>
    </div>
  );
}