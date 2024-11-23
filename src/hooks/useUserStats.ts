import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserStats } from '../types';

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    totalEarnings: 0,
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
      let totalEarnings = 0;

      completedSnap.forEach(doc => {
        const data = doc.data();
        if (data.winners) {
          if (data.winners.first?.userId === user.uid) {
            gamesWon++;
            totalEarnings += data.winners.first.prize;
          } else if (data.winners.second?.userId === user.uid) {
            totalEarnings += data.winners.second.prize;
          } else if (data.winners.third?.userId === user.uid) {
            totalEarnings += data.winners.third.prize;
          }
        }
      });

      setStats({
        gamesPlayed: completedSnap.size,
        gamesWon,
        totalEarnings,
        upcomingGames: upcomingSnap.size
      });
      setLoading(false);
    }

    fetchStats();
  }, [user]);

  return { stats, loading };
}