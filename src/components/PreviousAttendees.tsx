import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserInfo } from '../types';
import { Users } from 'lucide-react';

interface PreviousAttendeesProps {
  currentUserId: string;
  onSelect: (attendee: UserInfo) => void;
  selectedAttendees: string[];
}

export default function PreviousAttendees({ currentUserId, onSelect, selectedAttendees }: PreviousAttendeesProps) {
  const [previousAttendees, setPreviousAttendees] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPreviousAttendees() {
      try {
        // Get all events where the current user participated
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(
          eventsRef,
          where('currentPlayers', 'array-contains', currentUserId)
        );
        const eventsSnap = await getDocs(eventsQuery);

        // Collect unique player IDs from all events
        const playerIds = new Set<string>();
        eventsSnap.docs.forEach(doc => {
          const players = doc.data().currentPlayers as string[];
          players.forEach(id => {
            if (id !== currentUserId) {
              playerIds.add(id);
            }
          });
        });

        if (playerIds.size > 0) {
          // Fetch user details for all players
          const usersRef = collection(db, 'users');
          const usersQuery = query(
            usersRef,
            where('__name__', 'in', Array.from(playerIds))
          );
          const usersSnap = await getDocs(usersQuery);
          
          const attendees = usersSnap.docs.map(doc => ({
            id: doc.id,
            displayName: doc.data().displayName,
            email: doc.data().email,
          }));

          // Sort by display name
          attendees.sort((a, b) => {
            const aName = a.displayName || a.email || '';
            const bName = b.displayName || b.email || '';
            return aName.localeCompare(bName);
          });

          setPreviousAttendees(attendees);
        }
      } catch (error) {
        console.error('Error fetching previous attendees:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPreviousAttendees();
  }, [currentUserId]);

  if (loading) {
    return <div>Loading previous attendees...</div>;
  }

  if (previousAttendees.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Users size={20} />
        Previous Attendees
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {previousAttendees.map((attendee) => {
          const isSelected = selectedAttendees.includes(attendee.id);
          return (
            <button
              key={attendee.id}
              onClick={() => onSelect(attendee)}
              className={`p-3 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'bg-poker-red text-white'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <span className="block font-medium">
                {attendee.displayName || attendee.email}
              </span>
              {attendee.displayName && (
                <span className="text-sm text-gray-400">{attendee.email}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}