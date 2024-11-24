import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Trophy, UserPlus } from 'lucide-react';
import { useGroup } from '../hooks/useGroup';
import { useGroupStats } from '../hooks/useGroupStats';
import { useAuth } from '../contexts/AuthContext';
import InviteMemberModal from '../components/InviteMemberModal';
import LeaderboardCard from '../components/LeaderboardCard';

export default function GroupDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { group, loading: groupLoading, members } = useGroup(id!);
  const { stats, loading: statsLoading } = useGroupStats(id!);
  const [showInviteModal, setShowInviteModal] = useState(false);

  if (groupLoading || statsLoading) {
    return <div>Loading...</div>;
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  const isOwner = user?.uid === group.ownerId;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users size={24} />
            {group.name}
          </h1>
          {group.description && (
            <p className="text-gray-400 mt-2">{group.description}</p>
          )}
        </div>
        {isOwner && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus size={18} />
            Invite Members
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy size={20} />
              Leaderboard
            </h2>
            <LeaderboardCard stats={stats} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Members ({members.length})</h2>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 bg-gray-800 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {member.displayName || member.email}
                    </div>
                    {member.displayName && (
                      <div className="text-sm text-gray-400">{member.email}</div>
                    )}
                  </div>
                  {member.id === group.ownerId && (
                    <span className="text-xs bg-poker-red px-2 py-1 rounded">
                      Owner
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <InviteMemberModal
          group={group}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}