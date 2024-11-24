import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PokerGroup } from '../types';

export function useGroupInvites() {
  const [invites, setInvites] = useState<PokerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) return;

    const groupsRef = collection(db, 'groups');
    const q = query(
      groupsRef,
      where('invitedMembers', 'array-contains', user.email)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const invitesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as PokerGroup));
        
        setInvites(invitesList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching group invites:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { invites, loading };
}