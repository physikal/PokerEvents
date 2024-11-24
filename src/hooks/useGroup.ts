import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PokerGroup, UserInfo } from '../types';

export function useGroup(groupId: string) {
  const [group, setGroup] = useState<PokerGroup | null>(null);
  const [members, setMembers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const groupRef = doc(db, 'groups', groupId);

    const unsubscribe = onSnapshot(
      groupRef,
      async (doc) => {
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
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching group:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupId]);

  return { group, members, loading };
}