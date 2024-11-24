import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PokerGroup, UserInfo } from '../types';

interface RemoveMemberModalProps {
  group: PokerGroup;
  member: UserInfo;
  onClose: () => void;
}

export default function RemoveMemberModal({ group, member, onClose }: RemoveMemberModalProps) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);

    try {
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, {
        members: arrayRemove(member.id)
      });
      toast.success('Member removed successfully');
      onClose();
    } catch (error) {
      console.error('Remove member error:', error);
      toast.error('Failed to remove member');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">Remove Member</h2>

        <p className="text-gray-300 mb-6">
          Are you sure you want to remove <span className="font-semibold">{member.displayName || member.email}</span> from {group.name}?
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={removing}
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            className="btn-primary bg-red-600 hover:bg-red-700"
            disabled={removing}
          >
            {removing ? 'Removing...' : 'Remove Member'}
          </button>
        </div>
      </div>
    </div>
  );
}