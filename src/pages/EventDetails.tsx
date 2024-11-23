import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PokerEvent } from '../types';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<PokerEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'events', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() } as PokerEvent);
        }
      } catch (error) {
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleJoin = async () => {
    if (!event || !user) return;
    
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        currentPlayers: arrayUnion(user.uid)
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

  const handleSetWinners = async (winners: PokerEvent['winners']) => {
    if (!event) return;
    
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        winners,
        status: 'completed'
      });
      toast.success('Winners updated successfully!');
    } catch (error) {
      toast.error('Failed to update winners');
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
            <div>
              {canJoin && (
                <button onClick={handleJoin} className="btn-primary">
                  Join Event
                </button>
              )}
              {isParticipant && !isOwner && (
                <button onClick={handleLeave} className="btn-secondary">
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

        {isOwner && event.status === 'upcoming' && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Manage Event</h2>
            <div className="space-x-4">
              <button
                onClick={() => {
                  // Add winner management logic
                }}
                className="btn-primary"
              >
                Set Winners
              </button>
              <button
                onClick={() => {
                  // Add cancellation logic
                }}
                className="btn-secondary"
              >
                Cancel Event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}