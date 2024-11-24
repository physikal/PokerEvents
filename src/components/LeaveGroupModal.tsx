import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PokerGroup } from '../types';

interface LeaveGroupModalProps {
  group: PokerGroup;
  onClose: () => void;
}

export default function LeaveGroupModal({ group, onClose }: LeaveGroupModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const handleLeave = async () => {
    if (!user || leaving) return;
    setLeaving(true);

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
      setLeaving(false);
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

        <h2 className="text-xl font-bold mb-6">Leave Group</h2>

        <p className="text-gray-300 mb-6">
          Are you sure you want to leave {group.name}? You'll need a new invitation to rejoin.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={leaving}
          >
            Cancel
          </button>
          <button
            onClick={handleLeave}
            className="btn-primary bg-red-600 hover:bg-red-700"
            disabled={leaving}
          >
            {leaving ? 'Leaving...' : 'Leave Group'}
          </button>
        </div>
      </div>
    </div>
  );
}