import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PokerEvent } from '../types';
import { nowInPacific } from '../utils/dateUtils';

export function usePokerEvents(type: 'upcoming' | 'past') {
  const [events, setEvents] = useState<PokerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const eventsRef = collection(db, 'events');
    const now = nowInPacific().toISOString();
    
    const q = query(
      eventsRef,
      where('currentPlayers', 'array-contains', user.uid),
      where('date', type === 'upcoming' ? '>=' : '<', now),
      orderBy('date', type === 'upcoming' ? 'asc' : 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as PokerEvent));
        
        setEvents(eventsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, type]);

  return { events, loading };
}