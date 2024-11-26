import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toPacificISOString, formatToPacific } from '../utils/dateUtils';
import PreviousAttendees from '../components/PreviousAttendees';
import { sendInvitationEmail } from '../lib/emailService';
import { UserInfo } from '../types';
import { useGroups } from '../hooks/useGroups';
import { useLocations } from '../hooks/useLocations';
import { Users, Plus } from 'lucide-react';
import AddLocationModal from '../components/AddLocationModal';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups } = useGroups();
  const { locations } = useLocations();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    buyIn: '',
    maxPlayers: '',
    groupId: '',
  });
  const [selectedAttendees, setSelectedAttendees] = useState<UserInfo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);

  const validateForm = () => {
    if (!formData.title.trim()) throw new Error('Event title is required');
    if (!formData.date) throw new Error('Event date is required');
    if (!formData.location.trim()) throw new Error('Location is required');
    if (!formData.buyIn || Number(formData.buyIn) < 0) throw new Error('Valid buy-in amount is required');
    if (!formData.maxPlayers || Number(formData.maxPlayers) < 2) throw new Error('Maximum players must be at least 2');

    const eventDate = new Date(formData.date);
    if (isNaN(eventDate.getTime())) throw new Error('Invalid date format');

    // Only validate future date if it's not a group event
    if (!formData.groupId && eventDate < new Date()) {
      throw new Error('Event date must be in the future');
    }

    return eventDate;
  };

  const fetchGroupMembers = async (groupId: string): Promise<UserInfo[]> => {
    const selectedGroup = groups.find(g => g.id === groupId);
    if (!selectedGroup) return [];

    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('__name__', 'in', selectedGroup.members.filter(id => id !== user?.uid))
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email || '',
        displayName: doc.data().displayName,
      }));
    } catch (error) {
      console.error('Error fetching group members:', error);
      throw new Error('Failed to fetch group members');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const eventDate = validateForm();

      // Get group members if a group is selected
      let groupMembers: UserInfo[] = [];
      if (formData.groupId) {
        groupMembers = await fetchGroupMembers(formData.groupId);
      }

      // Combine selected attendees and group members
      const allAttendees = [...selectedAttendees];
      groupMembers.forEach(member => {
        if (!allAttendees.some(a => a.id === member.id)) {
          allAttendees.push(member);
        }
      });

      // Create event
      const eventData = {
        title: formData.title.trim(),
        date: toPacificISOString(eventDate),
        location: formData.location.trim(),
        buyIn: Number(formData.buyIn),
        maxPlayers: Number(formData.maxPlayers),
        currentPlayers: [user.uid],
        invitedPlayers: allAttendees.map(a => a.email),
        ownerId: user.uid,
        status: 'upcoming',
        createdAt: toPacificISOString(new Date()),
        groupId: formData.groupId || null,
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      toast.success('Event created successfully!');
      
      // Only send notifications if the event is in the future
      if (eventDate > new Date()) {
        // Generate event URL
        const baseUrl = window.location.origin;
        const eventUrl = `${baseUrl}/#/event/${docRef.id}`;

        // Send email notifications to all attendees
        if (allAttendees.length > 0) {
          await Promise.all(allAttendees.map(attendee => 
            sendInvitationEmail({
              to_email: attendee.email,
              event_title: eventData.title,
              event_date: formatToPacific(eventDate),
              event_location: eventData.location,
              event_buyin: eventData.buyIn,
              event_link: eventUrl,
              reply_to: user.email || 'noreply@suckingout.com'
            }).catch(error => {
              console.error(`Failed to send email to ${attendee.email}:`, error);
              // Don't throw, just log the error and continue
            })
          ));
        }
      }

      navigate(`/event/${docRef.id}`);
    } catch (error) {
      console.error('Create event error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAttendeeToggle = (attendee: UserInfo) => {
    setSelectedAttendees(prev => {
      const isSelected = prev.some(a => a.id === attendee.id);
      if (isSelected) {
        return prev.filter(a => a.id !== attendee.id);
      }
      return [...prev, attendee];
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {groups.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Users size={16} />
                Group (Optional)
              </label>
              <select
                name="groupId"
                className="input w-full"
                value={formData.groupId}
                onChange={handleChange}
              >
                <option value="">Select a group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-400">
                All group members will be automatically invited
                {formData.groupId && ". Past dates are allowed for group events."}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Event Title</label>
            <input
              type="text"
              name="title"
              className="input w-full"
              placeholder="Friday Night Poker"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date & Time (Pacific)</label>
              <input
                type="datetime-local"
                name="date"
                className="input w-full"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Location</label>
                <button
                  type="button"
                  onClick={() => setShowAddLocation(true)}
                  className="text-poker-red hover:text-red-400"
                >
                  <Plus size={16} />
                </button>
              </div>
              {locations.length > 0 ? (
                <select
                  name="location"
                  className="input w-full"
                  value={formData.location}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.address}>
                      {location.name}
                    </option>
                  ))}
                  <option value="custom">Enter Custom Location</option>
                </select>
              ) : (
                <input
                  type="text"
                  name="location"
                  className="input w-full"
                  placeholder="123 Poker St"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              )}
              {locations.length > 0 && formData.location === 'custom' && (
                <input
                  type="text"
                  name="location"
                  className="input w-full mt-2"
                  placeholder="Enter custom location"
                  value=""
                  onChange={handleChange}
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Buy-in Amount</label>
              <input
                type="number"
                name="buyIn"
                className="input w-full"
                placeholder="50"
                min="0"
                value={formData.buyIn}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Players</label>
              <input
                type="number"
                name="maxPlayers"
                className="input w-full"
                placeholder="9"
                min="2"
                value={formData.maxPlayers}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>

      {user && (
        <div className="card">
          <PreviousAttendees
            currentUserId={user.uid}
            onSelect={handleAttendeeToggle}
            selectedAttendees={selectedAttendees.map(a => a.id)}
          />
        </div>
      )}

      {showAddLocation && (
        <AddLocationModal onClose={() => setShowAddLocation(false)} />
      )}
    </div>
  );
}