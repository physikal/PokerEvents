import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PokerEvent } from '../types';

export function useInvitations() {
  const [invitations, setInvitations] = useState<PokerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) return;

    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('invitedPlayers', 'array-contains', user.email),
      where('status', '==', 'upcoming')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const invitationsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as PokerEvent));
        
        setInvitations(invitationsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching invitations:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { invitations, loading };
}