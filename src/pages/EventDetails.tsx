import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserMinus, UserPlus, Trophy, Users, Calendar } from 'lucide-react';
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PokerEvent, UserInfo } from '../types';
import InviteModal from '../components/InviteModal';
import WinnerModal from '../components/WinnerModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatToPacific } from '../utils/dateUtils';
import { sendCancellationEmails } from '../lib/emailService';
import { generateICSContent, downloadICSFile } from '../utils/calendarUtils';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<PokerEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<UserInfo[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [inviteToRemove, setInviteToRemove] = useState<string | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(
      doc(db, 'events', id),
      async (doc) => {
        if (doc.exists()) {
          const eventData = { id: doc.id, ...doc.data() } as PokerEvent;
          setEvent(eventData);

          // Fetch participant details
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('__name__', 'in', eventData.currentPlayers));
          const userSnap = await getDocs(q);
          const usersList = userSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as UserInfo));
          setParticipants(usersList);
        } else {
          toast.error('Event not found');
          navigate('/');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, navigate]);

  const handleJoin = async () => {
    if (!event || !user) return;
    
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        currentPlayers: arrayUnion(user.uid),
        invitedPlayers: arrayRemove(user.email)
      });
      toast.success('Successfully joined the event!');
    } catch (error) {
      console.error('Join error:', error);
      toast.error('Failed to join event');
    }
  };

  const handleLeave = async () => {
    if (!event || !user) return;
    
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        currentPlayers: arrayRemove(user.uid)
      });
      toast.success('Successfully left the event');
      setShowLeaveConfirmation(false);
    } catch (error) {
      console.error('Leave error:', error);
      toast.error('Failed to leave event');
    }
  };

  const handleRemoveInvite = async () => {
    if (!event || !inviteToRemove) return;
    
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        invitedPlayers: arrayRemove(inviteToRemove)
      });
      toast.success('Invitation removed');
      setInviteToRemove(null);
    } catch (error) {
      console.error('Remove invite error:', error);
      toast.error('Failed to remove invitation');
    }
  };

  const handleSetWinners = async (winners: PokerEvent['winners']) => {
    if (!event) return;
    
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        winners,
        status: 'completed'
      });
      toast.success('Winners updated successfully!');
      setShowWinnerModal(false);
    } catch (error) {
      console.error('Set winners error:', error);
      toast.error('Failed to update winners');
    }
  };

  const handleCancelEvent = async () => {
    if (!event) return;

    try {
      // Get all participant emails
      const attendeeEmails = participants.map(p => p.email).filter(Boolean);
      const invitedEmails = event.invitedPlayers || [];
      const allEmails = [...attendeeEmails, ...invitedEmails];

      // Send cancellation emails
      await sendCancellationEmails({
        to_emails: allEmails,
        event_title: event.title,
        event_date: formatToPacific(event.date),
        event_location: event.location
      });

      // Delete the event
      await deleteDoc(doc(db, 'events', event.id));
      
      toast.success('Event cancelled successfully');
      navigate('/');
    } catch (error) {
      console.error('Cancel event error:', error);
      toast.error('Failed to cancel event');
    }
  };

  const handleCalendarDownload = () => {
    if (!event) return;

    const icsContent = generateICSContent({
      title: event.title,
      date: event.date,
      location: event.location,
      buyIn: event.buyIn,
      description: `Poker Night - ${event.currentPlayers.length}/${event.maxPlayers} players`
    });

    downloadICSFile(icsContent, `${event.title.toLowerCase().replace(/\s+/g, '-')}.ics`);
  };

  if (loading || !event) {
    return <div>Loading...</div>;
  }

  const isOwner = user?.uid === event.ownerId;
  const isParticipant = event.currentPlayers.includes(user?.uid || '');
  const canJoin = !isParticipant && event.currentPlayers.length < event.maxPlayers;
  const isInvited = event.invitedPlayers?.includes(user?.email || '');
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date() && event.status !== 'completed';

  const getParticipantName = (userId: string) => {
    const participant = participants.find(p => p.id === userId);
    return participant?.displayName || participant?.email || userId;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card">
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
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users size={20} />
            Attending Players ({event.currentPlayers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {participants.map((player) => (
              <div
                key={player.id}
                className="p-3 bg-gray-800 rounded-lg flex items-center justify-between"
              >
                <span>{player.displayName || player.email}</span>
                {player.id === event.ownerId && (
                  <span className="text-xs bg-poker-red px-2 py-1 rounded">Host</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {(isPastEvent || event.status === 'completed') && isOwner && (
          <button
            onClick={() => setShowWinnerModal(true)}
            className="btn-primary flex items-center justify-center gap-2 mt-6"
          >
            <Trophy size={18} />
            {event.winners ? 'Update Winners' : 'Set Winners'}
          </button>
        )}

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
      </div>

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
  );
}