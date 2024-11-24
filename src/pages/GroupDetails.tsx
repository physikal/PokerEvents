import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Trophy, UserPlus, Mail, UserMinus, LogOut, Calendar } from 'lucide-react';
import { useGroup } from '../hooks/useGroup';
import { useGroupStats } from '../hooks/useGroupStats';
import { useGroupEvents } from '../hooks/useGroupEvents';
import { useAuth } from '../contexts/AuthContext';
import InviteMemberModal from '../components/InviteMemberModal';
import LeaderboardCard from '../components/LeaderboardCard';
import GroupEventCard from '../components/GroupEventCard';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { UserInfo } from '../types';

export default function GroupDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { group, loading: groupLoading, members, error } = useGroup(id!);
  const { stats, loading: statsLoading } = useGroupStats(id!);
  const { events: upcomingEvents, loading: upcomingLoading } = useGroupEvents(id!, 'upcoming');
  const { events: pastEvents, loading: pastLoading } = useGroupEvents(id!, 'past');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<UserInfo | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [inviteToCancel, setInviteToCancel] = useState<string | null>(null);

  // Check if user has access to this group
  useEffect(() => {
    if (!groupLoading && group && user) {
      const hasAccess = group.members.includes(user.uid) || 
                       (user.email && group.invitedMembers.includes(user.email));
      
      if (!hasAccess) {
        toast.error('You do not have access to this group');
        navigate('/groups');
      }
    }
  }, [group, user, navigate, groupLoading]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      toast.error('Failed to load group details');
      navigate('/groups');
    }
  }, [error, navigate]);

  const handleCancelInvite = async () => {
    if (!group || !isOwner || !inviteToCancel) return;
    
    try {
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, {
        invitedMembers: arrayRemove(inviteToCancel)
      });
      toast.success('Invitation cancelled');
      setInviteToCancel(null);
    } catch (error) {
      console.error('Cancel invitation error:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  const handleRemoveMember = async () => {
    if (!group || !isOwner || !memberToRemove || memberToRemove.id === group.ownerId) return;
    
    try {
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, {
        members: arrayRemove(memberToRemove.id)
      });
      toast.success('Member removed successfully');
      setMemberToRemove(null);
    } catch (error) {
      console.error('Remove member error:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleLeaveGroup = async () => {
    if (!group || !user) return;
    
    try {
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, {
        members: arrayRemove(user.uid)
      });
      toast.success('Successfully left the group');
      navigate('/groups');
    } catch (error) {
      console.error('Leave group error:', error);
      toast.error('Failed to leave group');
    }
  };

  if (groupLoading || statsLoading || upcomingLoading || pastLoading) {
    return <div>Loading...</div>;
  }

  if (!group || !user) {
    return null;
  }

  const isOwner = user.uid === group.ownerId;
  const isMember = group.members.includes(user.uid);

  // If user is not a member or owner, don't show anything
  if (!isMember && !isOwner) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-gray-400 mt-1">{group.description}</p>
          )}
        </div>
        <div className="space-x-3">
          {isOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus size={18} />
              Invite Members
            </button>
          )}
          {!isOwner && (
            <button
              onClick={() => setShowLeaveConfirmation(true)}
              className="btn-secondary flex items-center gap-2 text-red-400 hover:text-white"
            >
              <LogOut size={18} />
              Leave Group
            </button>
          )}
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wins Leaderboard */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-poker-gold" />
            Most Wins
          </h2>
          <LeaderboardCard stats={stats} sortBy="wins" />
        </div>

        {/* Games Played Leaderboard */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-400" />
            Most Active
          </h2>
          <LeaderboardCard stats={stats} sortBy="games" />
        </div>
      </div>

      {/* Events Section */}
      <div className="space-y-8">
        {/* Upcoming Events */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Upcoming Events
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No upcoming events</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <GroupEventCard
                  key={event.id}
                  event={event}
                  participants={members}
                />
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Past Events</h2>
            <div className="space-y-4">
              {pastEvents.map(event => (
                <GroupEventCard
                  key={event.id}
                  event={event}
                  participants={members}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users size={20} />
          Members ({members.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
            >
              <div>
                <div className="font-medium">
                  {member.displayName || member.email}
                </div>
                {member.displayName && (
                  <div className="text-sm text-gray-400">{member.email}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {member.id === group.ownerId && (
                  <span className="text-xs bg-poker-red px-2 py-1 rounded">
                    Owner
                  </span>
                )}
                {isOwner && member.id !== group.ownerId && (
                  <button
                    onClick={() => setMemberToRemove(member)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <UserMinus size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invites */}
      {isOwner && group.invitedMembers.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail size={20} />
            Pending Invites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.invitedMembers.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <span>{email}</span>
                <button
                  onClick={() => setInviteToCancel(email)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <UserMinus size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showInviteModal && (
        <InviteMemberModal
          group={group}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {memberToRemove && (
        <ConfirmationModal
          title="Remove Member"
          message={`Are you sure you want to remove ${memberToRemove.displayName || memberToRemove.email} from ${group.name}?`}
          confirmLabel="Remove Member"
          confirmStyle="danger"
          onConfirm={handleRemoveMember}
          onClose={() => setMemberToRemove(null)}
        />
      )}

      {showLeaveConfirmation && (
        <ConfirmationModal
          title="Leave Group"
          message={`Are you sure you want to leave ${group.name}? You'll need a new invitation to rejoin.`}
          confirmLabel="Leave Group"
          confirmStyle="danger"
          onConfirm={handleLeaveGroup}
          onClose={() => setShowLeaveConfirmation(false)}
        />
      )}

      {inviteToCancel && (
        <ConfirmationModal
          title="Cancel Invitation"
          message={`Are you sure you want to cancel the invitation for ${inviteToCancel}?`}
          confirmLabel="Cancel Invitation"
          confirmStyle="danger"
          onConfirm={handleCancelInvite}
          onClose={() => setInviteToCancel(null)}
        />
      )}
    </div>
  );
}