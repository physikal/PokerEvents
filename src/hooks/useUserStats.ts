import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserStats } from '../types';

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    upcomingGames: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      const eventsRef = collection(db, 'events');
      const today = new Date().toISOString();

      // Get completed games
      const completedQuery = query(
        eventsRef,
        where('currentPlayers', 'array-contains', user.uid),
        where('status', '==', 'completed')
      );

      // Get upcoming games
      const upcomingQuery = query(
        eventsRef,
        where('currentPlayers', 'array-contains', user.uid),
        where('date', '>=', today)
      );

      const [completedSnap, upcomingSnap] = await Promise.all([
        getDocs(completedQuery),
        getDocs(upcomingQuery)
      ]);

      let gamesWon = 0;

      completedSnap.forEach(doc => {
        const data = doc.data();
        if (data.winners?.first?.userId === user.uid) {
          gamesWon++;
        }
      });

      setStats({
        gamesPlayed: completedSnap.size,
        gamesWon,
        upcomingGames: upcomingSnap.size
      });
      setLoading(false);
    }

    fetchStats();
  }, [user]);

  return { stats, loading };
}