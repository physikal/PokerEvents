import { format } from 'date-fns';
import { usePokerEvents } from '../hooks/usePokerEvents';

export default function History() {
  const { events: pastEvents, loading } = usePokerEvents('past');

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Event History</h1>
      </div>

      {pastEvents.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No past events found</p>
          <p className="text-sm text-gray-500">Join or create an event to start your poker journey!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pastEvents.map((event) => (
            <div key={event.id} className="card">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <div className="mt-2 space-y-1 text-gray-400">
                      <p>{format(new Date(event.date), 'PPP')}</p>
                      <p>{event.location}</p>
                      <p>${event.buyIn} buy-in</p>
                      <p>{event.currentPlayers.length} players</p>
                    </div>
                  </div>
                </div>

                {event.winners && (
                  <div className="mt-4 md:mt-0 md:ml-8 flex-shrink-0">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Winners</h4>
                    <div className="space-y-2">
                      {event.winners.first && (
                        <div className="text-poker-gold">
                          1st - ${event.winners.first.prize}
                        </div>
                      )}
                      {event.winners.second && (
                        <div className="text-gray-400">
                          2nd - ${event.winners.second.prize}
                        </div>
                      )}
                      {event.winners.third && (
                        <div className="text-amber-700">
                          3rd - ${event.winners.third.prize}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}