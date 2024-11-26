import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { usePokerEvents } from '../hooks/usePokerEvents';
import { useInvitations } from '../hooks/useInvitations';
import { useUserStats } from '../hooks/useUserStats';
import { useAuth } from '../contexts/AuthContext';
import { Users, Crown, Mail, Check, X } from 'lucide-react';
import { useGroups } from '../hooks/useGroups';
import { useGroupInvites } from '../hooks/useGroupInvites';
import { PokerEvent } from '../types';
import { formatToPacific } from '../utils/dateUtils';
import { InvitationService } from '../services/invitationService';

export default function Dashboard() {
  const { events: upcomingEvents, loading: eventsLoading } = usePokerEvents('upcoming');
  const { invitations, loading: invitationsLoading } = useInvitations();
  const { stats, loading: statsLoading } = useUserStats();
  const { groups } = useGroups();
  const { invites: groupInvites, loading: groupInvitesLoading } = useGroupInvites();
  const { user } = useAuth();

  const handleAcceptInvite = async (eventId: string) => {
    try {
      await InvitationService.acceptEventInvite(eventId, user);
      toast.success('Successfully joined the event!');
    } catch (error) {
      console.error('Accept invitation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to join event');
    }
  };

  const handleDeclineInvite = async (eventId: string) => {
    try {
      await InvitationService.declineEventInvite(eventId, user);
      toast.success('Invitation declined');
    } catch (error) {
      console.error('Decline invitation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to decline invitation');
    }
  };

  const handleAcceptGroupInvite = async (groupId: string) => {
    try {
      await InvitationService.acceptGroupInvite(groupId, user);
      toast.success('Successfully joined the group!');
    } catch (error) {
      console.error('Accept group invitation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to join group');
    }
  };

  const handleDeclineGroupInvite = async (groupId: string) => {
    try {
      await InvitationService.declineGroupInvite(groupId, user);
      toast.success('Group invitation declined');
    } catch (error) {
      console.error('Decline group invitation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to decline invitation');
    }
  };

  // Categorize events
  const categorizedEvents = upcomingEvents.reduce((acc, event) => {
    if (event.ownerId === user?.uid) {
      acc.hosting.push(event);
    } else if (event.groupId) {
      acc.group.push(event);
    } else {
      acc.individual.push(event);
    }
    return acc;
  }, {
    hosting: [] as PokerEvent[],
    group: [] as PokerEvent[],
    individual: [] as PokerEvent[]
  });

  const renderEventCard = (event: PokerEvent) => (
    <Link
      key={event.id}
      to={`/event/${event.id}`}
      className="block card hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{event.title}</h3>
          <p className="text-gray-400">
            {formatToPacific(event.date)} at {event.location}
          </p>
          {event.groupId && (
            <div className="mt-1 flex items-center gap-1 text-sm text-poker-gold">
              <Users size={14} />
              {groups.find(g => g.id === event.groupId)?.name || 'Group Event'}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-poker-red font-semibold">${event.buyIn}</p>
          <p className="text-gray-400">
            {event.currentPlayers.length}/{event.maxPlayers} players
          </p>
        </div>
      </div>
    </Link>
  );

  if (eventsLoading || statsLoading || invitationsLoading || groupInvitesLoading) {
    return <div>Loading...</div>;
  }

  const hasInvites = invitations.length > 0 || groupInvites.length > 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-poker-red to-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-200">Games Played</p>
              <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-gray-100 to-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900">Wins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.gamesWon}</p>
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

      {hasInvites && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Mail size={20} />
            Pending Invitations
          </h2>

          <div className="space-y-6">
            {/* Event Invitations */}
            {invitations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Events</h3>
                {invitations.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-400">
                        {formatToPacific(event.date)} at {event.location}
                      </p>
                      <p className="text-sm text-poker-red font-medium">
                        ${event.buyIn} buy-in
                      </p>
                      {event.groupId && (
                        <div className="mt-1 flex items-center gap-1 text-sm text-poker-gold">
                          <Users size={14} />
                          {groups.find(g => g.id === event.groupId)?.name || 'Group Event'}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeclineInvite(event.id)}
                        className="btn-secondary p-2"
                        title="Decline"
                      >
                        <X size={18} className="text-red-400" />
                      </button>
                      <button
                        onClick={() => handleAcceptInvite(event.id)}
                        className="btn-primary p-2"
                        title="Accept"
                      >
                        <Check size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Group Invitations */}
            {groupInvites.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Groups</h3>
                {groupInvites.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-gray-400 mt-1">{group.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeclineGroupInvite(group.id)}
                        className="btn-secondary p-2"
                        title="Decline"
                      >
                        <X size={18} className="text-red-400" />
                      </button>
                      <button
                        onClick={() => handleAcceptGroupInvite(group.id)}
                        className="btn-primary p-2"
                        title="Accept"
                      >
                        <Check size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
          <div className="space-y-8">
            {/* Events you're hosting */}
            {categorizedEvents.hosting.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-poker-gold">
                  <Crown size={20} />
                  Events You're Hosting
                </h3>
                <div className="space-y-4">
                  {categorizedEvents.hosting.map(renderEventCard)}
                </div>
              </div>
            )}

            {/* Group events */}
            {categorizedEvents.group.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-400">
                  <Users size={20} />
                  Group Events
                </h3>
                <div className="space-y-4">
                  {categorizedEvents.group.map(renderEventCard)}
                </div>
              </div>
            )}

            {/* Individual events */}
            {categorizedEvents.individual.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Individual Events</h3>
                <div className="space-y-4">
                  {categorizedEvents.individual.map(renderEventCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}