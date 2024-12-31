import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PokerEvent, UserInfo } from '../types';

export function useEventDetails(eventId: string) {
  const navigate = useNavigate();
  const [event, setEvent] = useState<PokerEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<UserInfo[]>([]);

  useEffect(() => {
    if (!eventId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'events', eventId),
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
  }, [eventId, navigate]);

  return { event, loading, participants };
}