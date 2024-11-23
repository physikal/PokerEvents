import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { UserMinus, UserPlus } from 'lucide-react';
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PokerEvent } from '../types';
import InviteModal from '../components/InviteModal';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<PokerEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Set up real-time listener for the event document
    const unsubscribe = onSnapshot(
      doc(db, 'events', id),
      (doc) => {
        if (doc.exists()) {
          setEvent({ id: doc.id, ...doc.data() } as PokerEvent);
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

    // Cleanup subscription on unmount
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
    } catch (error) {
      toast.error('Failed to leave event');
    }
  };

  const handleInvite = async (email: string) => {
    if (!event) return;
    
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        invitedPlayers: arrayUnion(email)
      });
    } catch (error) {
      throw new Error('Failed to update invited players');
    }
  };

  const handleRemoveInvite = async (email: string) => {
    if (!event) return;
    
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        invitedPlayers: arrayRemove(email)
      });
      toast.success('Invitation removed');
    } catch (error) {
      toast.error('Failed to remove invitation');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const isOwner = user?.uid === event.ownerId;
  const isParticipant = event.currentPlayers.includes(user?.uid || '');
  const isInvited = event.invitedPlayers?.includes(user?.email || '');
  const canJoin = !isParticipant && event.currentPlayers.length < event.maxPlayers;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <div className="space-y-2 text-gray-400">
              <p>{format(new Date(event.date), 'PPP p')}</p>
              <p>{event.location}</p>
              <p>${event.buyIn} buy-in</p>
              <p>{event.currentPlayers.length}/{event.maxPlayers} players</p>
            </div>
          </div>

          {event.status === 'upcoming' && (
            <div className="space-y-2">
              {isOwner && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <UserPlus size={18} />
                  Invite Players
                </button>
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
                <button onClick={handleLeave} className="btn-secondary w-full">
                  Leave Event
                </button>
              )}
            </div>
          )}
        </div>

        {event.status === 'completed' && event.winners && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Winners</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {event.winners.first && (
                <div className="card bg-gradient-to-br from-poker-gold to-yellow-600">
                  <p className="font-bold">1st Place</p>
                  <p className="text-lg">${event.winners.first.prize}</p>
                </div>
              )}
              {event.winners.second && (
                <div className="card bg-gradient-to-br from-gray-400 to-gray-600">
                  <p className="font-bold">2nd Place</p>
                  <p className="text-lg">${event.winners.second.prize}</p>
                </div>
              )}
              {event.winners.third && (
                <div className="card bg-gradient-to-br from-amber-700 to-amber-900">
                  <p className="font-bold">3rd Place</p>
                  <p className="text-lg">${event.winners.third.prize}</p>
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
                    onClick={() => handleRemoveInvite(email)}
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
          onInvite={handleInvite}
        />
      )}
    </div>
  );
}