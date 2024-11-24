import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PokerGroup, UserInfo } from '../types';

export function useGroup(groupId: string) {
  const [group, setGroup] = useState<PokerGroup | null>(null);
  const [members, setMembers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const groupRef = doc(db, 'groups', groupId);

    const unsubscribe = onSnapshot(
      groupRef,
      async (doc) => {
        try {
          if (doc.exists()) {
            const groupData = { id: doc.id, ...doc.data() } as PokerGroup;
            setGroup(groupData);

            // Fetch member details
            if (groupData.members.length > 0) {
              const usersRef = collection(db, 'users');
              const q = query(
                usersRef,
                where('__name__', 'in', groupData.members)
              );
              const userSnap = await getDocs(q);
              const membersList = userSnap.docs.map(doc => ({
                id: doc.id,
                email: doc.data().email || '',
                displayName: doc.data().displayName,
              }));
              setMembers(membersList);
            } else {
              setMembers([]);
            }
          } else {
            setError(new Error('Group not found'));
          }
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to load group'));
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching group:', err);
        setError(err instanceof Error ? err : new Error('Failed to load group'));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupId]);

  return { group, members, loading, error };
}