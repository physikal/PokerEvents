import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GroupStats, PokerEvent } from '../types';

export function useGroupStats(groupId: string) {
  const [stats, setStats] = useState<GroupStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get all completed events for this group
        const eventsRef = collection(db, 'events');
        const q = query(
          eventsRef,
          where('groupId', '==', groupId),
          where('status', '==', 'completed')
        );
        const eventsSnap = await getDocs(q);

        // Collect player statistics
        const playerStats = new Map<string, {
          gamesPlayed: number;
          gamesWon: number;
          totalEarnings: number;
          displayName?: string;
        }>();

        // Process each event
        for (const doc of eventsSnap.docs) {
          const event = doc.data() as PokerEvent;
          
          // Track games played
          event.currentPlayers.forEach(playerId => {
            if (!playerStats.has(playerId)) {
              playerStats.set(playerId, {
                gamesPlayed: 0,
                gamesWon: 0,
                totalEarnings: 0
              });
            }
            const stats = playerStats.get(playerId)!;
            stats.gamesPlayed++;
          });

          // Track wins and earnings
          if (event.winners) {
            if (event.winners.first) {
              const stats = playerStats.get(event.winners.first.userId)!;
              stats.gamesWon++;
              stats.totalEarnings += event.winners.first.prize;
            }
            if (event.winners.second) {
              const stats = playerStats.get(event.winners.second.userId)!;
              stats.totalEarnings += event.winners.second.prize;
            }
            if (event.winners.third) {
              const stats = playerStats.get(event.winners.third.userId)!;
              stats.totalEarnings += event.winners.third.prize;
            }
          }
        }

        // Fetch player details
        const playerIds = Array.from(playerStats.keys());
        if (playerIds.length > 0) {
          const usersRef = collection(db, 'users');
          const usersQuery = query(
            usersRef,
            where('__name__', 'in', playerIds)
          );
          const usersSnap = await getDocs(usersQuery);
          
          usersSnap.docs.forEach(doc => {
            const stats = playerStats.get(doc.id);
            if (stats) {
              stats.displayName = doc.data().displayName || doc.data().email;
            }
          });
        }

        // Convert to array and sort by wins
        const statsArray: GroupStats[] = Array.from(playerStats.entries()).map(
          ([userId, stats]) => ({
            userId,
            displayName: stats.displayName || userId,
            gamesPlayed: stats.gamesPlayed,
            gamesWon: stats.gamesWon,
            totalEarnings: stats.totalEarnings
          })
        );

        setStats(statsArray);
      } catch (error) {
        console.error('Error fetching group stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [groupId]);

  return { stats, loading };
}