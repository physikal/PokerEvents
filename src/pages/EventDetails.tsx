import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserMinus, UserPlus, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEventDetails } from '../hooks/useEventDetails';
import { EventService } from '../services/eventService';
import EventHeader from '../components/event/EventHeader';
import PlayersList from '../components/event/PlayersList';
import InviteModal from '../components/InviteModal';
import TableManagement from '../components/TableManagement';
import WinnerModal from '../components/WinnerModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { event, loading, participants } = useEventDetails(id!);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [inviteToRemove, setInviteToRemove] = useState<string | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  if (loading || !event || !user) {
    return <div>Loading...</div>;
  }

  const isOwner = user.uid === event.ownerId;
  const isParticipant = event.currentPlayers.includes(user.uid);
  const canJoin = !isParticipant && event.currentPlayers.length < event.maxPlayers;
  const isInvited = event.invitedPlayers?.includes(user.email || '');
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date() && event.status !== 'completed';

  const getParticipantName = (userId: string) => {
    const participant = participants.find(p => p.id === userId);
    return participant?.displayName || participant?.email || userId;
  };

  const handleJoin = async () => {
    if (!user.email) return;
    
    try {
      await EventService.joinEvent(event.id, user.uid, user.email);
      toast.success('Successfully joined the event!');
    } catch (error) {
      toast.error('Failed to join event');
    }
  };

  const handleLeave = async () => {
    try {
      await EventService.leaveEvent(event.id, user.uid);
      toast.success('Successfully left the event');
      setShowLeaveConfirmation(false);
    } catch (error) {
      toast.error('Failed to leave event');
    }
  };

  const handleRemoveInvite = async () => {
    if (!inviteToRemove) return;
    
    try {
      await EventService.removeInvite(event.id, inviteToRemove);
      toast.success('Invitation removed');
      setInviteToRemove(null);
    } catch (error) {
      toast.error('Failed to remove invitation');
    }
  };

  const handleSetWinners = async (winners: typeof event.winners) => {
    try {
      await EventService.setWinners(event.id, winners);
      toast.success('Winners updated successfully!');
      setShowWinnerModal(false);
    } catch (error) {
      toast.error('Failed to update winners');
    }
  };

  const handleCancelEvent = async () => {
    try {
      const participantEmails = participants
        .map(p => p.email)
        .filter((email): email is string => Boolean(email));

      await EventService.cancelEvent(event, participantEmails);
      toast.success('Event cancelled successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to cancel event');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card">
        <EventHeader event={event} />

        <div className="space-y-2">
          {event.status === 'upcoming' && (
            <div className="space-y-2">
              {isOwner && (
                <>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <UserPlus size={18} />
                    Invite Players
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="btn-secondary w-full text-red-400 hover:text-white"
                  >
                    Cancel Event
                  </button>
                </>
              )}
              {canJoin && isInvited && (
                <button onClick={handleJoin} className="btn-primary w-full">
                  Accept Invitation
                </button>
              )}
              {canJoin && !isInvited && (
                <button onClick={handleJoin} className="btn-primary w-full">
                  Join Event
                </button>
              )}
              {isParticipant && !isOwner && (
                <button 
                  onClick={() => setShowLeaveConfirmation(true)} 
                  className="btn-secondary w-full"
                >
                  Leave Event
                </button>
              )}
            </div>
          )}
        </div>

        {/* Players Section */}
        <PlayersList participants={participants} ownerId={event.ownerId} />

        {/* Winners Section */}
        {event.winners && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Winners</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {event.winners.first && (
                <div className="card bg-gradient-to-br from-poker-gold to-yellow-600">
                  <p className="font-bold">1st Place</p>
                  <p className="text-lg">{getParticipantName(event.winners.first.userId)}</p>
                  <p className="text-sm">${event.winners.first.prize}</p>
                </div>
              )}
              {event.winners.second && (
                <div className="card bg-gradient-to-br from-gray-400 to-gray-600">
                  <p className="font-bold">2nd Place</p>
                  <p className="text-lg">{getParticipantName(event.winners.second.userId)}</p>
                  <p className="text-sm">${event.winners.second.prize}</p>
                </div>
              )}
              {event.winners.third && (
                <div className="card bg-gradient-to-br from-amber-700 to-amber-900">
                  <p className="font-bold">3rd Place</p>
                  <p className="text-lg">{getParticipantName(event.winners.third.userId)}</p>
                  <p className="text-sm">${event.winners.third.prize}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table Management */}
        {event.status === 'upcoming' && (
          <div className="mt-8">
            <TableManagement
              event={event}
              participants={participants}
              currentUserId={user.uid}
              isOwner={isOwner}
            />
          </div>
        )}

        {/* Invited Players Section */}
        {isOwner && event.invitedPlayers?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Invited Players</h3>
            <div className="space-y-2">
              {event.invitedPlayers.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => setInviteToRemove(email)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <UserMinus size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {showInviteModal && (
          <InviteModal
            event={event}
            onClose={() => setShowInviteModal(false)}
          />
        )}

        {showWinnerModal && (
          <WinnerModal
            event={event}
            participants={participants}
            onClose={() => setShowWinnerModal(false)}
            onSetWinners={handleSetWinners}
          />
        )}

        {showCancelModal && (
          <ConfirmationModal
            title="Cancel Event"
            message="Are you sure you want to cancel this event? All attendees will be notified. This action cannot be undone."
            confirmLabel="Cancel Event"
            confirmStyle="danger"
            onConfirm={handleCancelEvent}
            onClose={() => setShowCancelModal(false)}
          />
        )}

        {showLeaveConfirmation && (
          <ConfirmationModal
            title="Leave Event"
            message="Are you sure you want to leave this event?"
            confirmLabel="Leave Event"
            confirmStyle="danger"
            onConfirm={handleLeave}
            onClose={() => setShowLeaveConfirmation(false)}
          />
        )}

        {inviteToRemove && (
          <ConfirmationModal
            title="Remove Invitation"
            message={`Are you sure you want to remove the invitation for ${inviteToRemove}?`}
            confirmLabel="Remove Invitation"
            confirmStyle="danger"
            onConfirm={handleRemoveInvite}
            onClose={() => setInviteToRemove(null)}
          />
        )}
      </div>
    </div>
  );
}