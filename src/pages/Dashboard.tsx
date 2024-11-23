import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { usePokerEvents } from '../hooks/usePokerEvents';
import { useUserStats } from '../hooks/useUserStats';

export default function Dashboard() {
  const { events: upcomingEvents, loading: eventsLoading } = usePokerEvents('upcoming');
  const { stats, loading: statsLoading } = useUserStats();

  if (eventsLoading || statsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-poker-red to-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-200">Games Played</p>
              <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-poker-gold to-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900">Wins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.gamesWon}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-green-600 to-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-200">Total Earnings</p>
              <p className="text-2xl font-bold">${stats.totalEarnings}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-200">Upcoming Games</p>
              <p className="text-2xl font-bold">{stats.upcomingGames}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Upcoming Events</h2>
          <Link to="/create-event" className="btn-primary">
            Create Event
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No upcoming events. Create one to get started!</p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                to={`/event/${event.id}`}
                className="block card hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-gray-400">
                      {format(new Date(event.date), 'PPP')} at {event.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-poker-red font-semibold">${event.buyIn}</p>
                    <p className="text-gray-400">
                      {event.currentPlayers.length}/{event.maxPlayers} players
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}