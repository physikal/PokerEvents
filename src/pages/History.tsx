import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { usePokerEvents } from '../hooks/usePokerEvents';
import { useAuth } from '../contexts/AuthContext';
import WinnerModal from '../components/WinnerModal';
import { PokerEvent, UserInfo } from '../types';
import { formatToPacific } from '../utils/dateUtils';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';

export default function History() {
  const { events: pastEvents, loading } = usePokerEvents('past');
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<PokerEvent | null>(null);
  const [participants, setParticipants] = useState<Record<string, UserInfo>>({});

  // Fetch all unique participant details across all events
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        // Collect unique player IDs from all events
        const playerIds = new Set<string>();
        pastEvents.forEach(event => {
          event.currentPlayers.forEach(id => playerIds.add(id));
          if (event.winners) {
            if (event.winners.first) playerIds.add(event.winners.first.userId);
            if (event.winners.second) playerIds.add(event.winners.second.userId);
            if (event.winners.third) playerIds.add(event.winners.third.userId);
          }
        });

        if (playerIds.size > 0) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('__name__', 'in', Array.from(playerIds)));
          const userSnap = await getDocs(q);
          
          const participantsMap: Record<string, UserInfo> = {};
          userSnap.docs.forEach(doc => {
            participantsMap[doc.id] = {
              id: doc.id,
              email: doc.data().email || '',
              displayName: doc.data().displayName,
            };
          });
          
          setParticipants(participantsMap);
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
      }
    };

    if (pastEvents.length > 0) {
      fetchParticipants();
    }
  }, [pastEvents]);

  const handleSetWinners = async (winners: PokerEvent['winners']) => {
    if (!selectedEvent) return;
    
    try {
      const eventRef = doc(db, 'events', selectedEvent.id);
      await updateDoc(eventRef, {
        winners,
        status: 'completed'
      });
      toast.success('Winners updated successfully!');
      setSelectedEvent(null);
    } catch (error) {
      console.error('Set winners error:', error);
      toast.error('Failed to update winners');
    }
  };

  const getParticipantName = (userId: string) => {
    const participant = participants[userId];
    return participant?.displayName || participant?.email || userId;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Event History</h1>
      </div>

      {pastEvents.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No past events found</p>
          <p className="text-sm text-gray-500">Join or create an event to start your poker journey!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pastEvents.map((event) => (
            <div key={event.id} className="card">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <div className="mt-2 space-y-1 text-gray-400">
                      <p>{formatToPacific(event.date)}</p>
                      <p>{event.location}</p>
                      <p>${event.buyIn} buy-in</p>
                      <p>{event.currentPlayers.length} players</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-8 flex-shrink-0">
                  {event.ownerId === user?.uid && (
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Trophy size={18} />
                      {event.winners ? 'Update Winners' : 'Set Winners'}
                    </button>
                  )}

                  {event.winners && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">Winners</h4>
                      <div className="space-y-2">
                        {event.winners.first && (
                          <div className="text-poker-gold">
                            1st - {getParticipantName(event.winners.first.userId)} (${event.winners.first.prize})
                          </div>
                        )}
                        {event.winners.second && (
                          <div className="text-gray-400">
                            2nd - {getParticipantName(event.winners.second.userId)} (${event.winners.second.prize})
                          </div>
                        )}
                        {event.winners.third && (
                          <div className="text-amber-700">
                            3rd - {getParticipantName(event.winners.third.userId)} (${event.winners.third.prize})
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <WinnerModal
          event={selectedEvent}
          participants={Object.values(participants)}
          onClose={() => setSelectedEvent(null)}
          onSetWinners={handleSetWinners}
        />
      )}
    </div>
  );
}