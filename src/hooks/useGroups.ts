import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PokerGroup } from '../types';

export function useGroups() {
  const [groups, setGroups] = useState<PokerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const groupsRef = collection(db, 'groups');
    const q = query(
      groupsRef,
      where('members', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const groupsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as PokerGroup));
        
        setGroups(groupsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching groups:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { groups, loading };
}