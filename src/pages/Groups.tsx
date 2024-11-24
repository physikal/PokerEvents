import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Mail } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useGroups } from '../hooks/useGroups';
import { useGroupInvites } from '../hooks/useGroupInvites';
import CreateGroupModal from '../components/CreateGroupModal';
import { toast } from 'react-hot-toast';

export default function Groups() {
  const { user } = useAuth();
  const { groups, loading: groupsLoading } = useGroups();
  const { invites, loading: invitesLoading } = useGroupInvites();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleAcceptInvite = async (groupId: string) => {
    if (!user?.email) return;
    
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
        invitedMembers: arrayRemove(user.email)
      });
      toast.success('Successfully joined the group!');
    } catch (error) {
      console.error('Accept group invitation error:', error);
      toast.error('Failed to join group');
    }
  };

  if (groupsLoading || invitesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users size={24} />
          My Groups
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Create Group
        </button>
      </div>

      {invites.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail size={20} />
            Group Invitations
          </h2>
          <div className="space-y-4">
            {invites.map((group) => (
              <div
                key={group.id}
                className="p-4 bg-gray-800 rounded-lg flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-gray-400 mt-1">{group.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleAcceptInvite(group.id)}
                  className="btn-primary"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {groups.length === 0 && invites.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No groups found</p>
          <p className="text-sm text-gray-500">Create a group to start organizing regular poker nights!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {groups.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="card hover:bg-gray-800 transition-colors"
            >
              <h3 className="text-xl font-bold mb-2">{group.name}</h3>
              {group.description && (
                <p className="text-gray-400 mb-4">{group.description}</p>
              )}
              <div className="text-sm text-gray-500">
                {group.members.length} members
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}