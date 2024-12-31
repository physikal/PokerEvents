import { Calendar } from 'lucide-react';
import { PokerEvent } from '../../types';
import { formatToPacific } from '../../utils/dateUtils';
import { generateICSContent, downloadICSFile } from '../../utils/calendarUtils';

interface EventHeaderProps {
  event: PokerEvent;
}

export default function EventHeader({ event }: EventHeaderProps) {
  const handleCalendarDownload = () => {
    const icsContent = generateICSContent({
      title: event.title,
      date: event.date,
      location: event.location,
      buyIn: event.buyIn,
      description: `Poker Night - ${event.currentPlayers.length}/${event.maxPlayers} players`
    });

    downloadICSFile(icsContent, `${event.title.toLowerCase().replace(/\s+/g, '-')}.ics`);
  };

  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <div className="space-y-2 text-gray-400">
          <p>{formatToPacific(event.date)}</p>
          <p>{event.location}</p>
          <p>${event.buyIn} buy-in</p>
          <p>{event.currentPlayers.length}/{event.maxPlayers} players</p>
          <button
            onClick={handleCalendarDownload}
            className="inline-flex items-center gap-2 text-poker-red hover:text-red-400 transition-colors"
          >
            <Calendar size={18} />
            Add to Calendar
          </button>
        </div>
      </div>
    </div>
  );
}