import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PokerGroup } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { sendGroupInvitation } from '../lib/emailService';

interface InviteMemberModalProps {
  group: PokerGroup;
  onClose: () => void;
}

export default function InviteMemberModal({ group, onClose }: InviteMemberModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email || sending) return;

    setSending(true);
    try {
      // First update Firestore
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, {
        invitedMembers: arrayUnion(email.toLowerCase())
      });

      // Then try to send the email notification
      try {
        // Generate the absolute URL for the groups page
        const baseUrl = window.location.origin;
        const groupUrl = `${baseUrl}/#/groups`;

        await sendGroupInvitation({
          to_email: email,
          group_name: group.name,
          inviter_name: user.displayName || user.email || 'A poker player',
          group_link: groupUrl,
          reply_to: user.email || 'noreply@suckingout.com'
        });

        toast.success(`Invitation sent to ${email}`);
      } catch (emailError) {
        // Log the error but don't fail the invitation process
        console.error('Failed to send email notification:', emailError);
        toast.success(`Invitation sent to ${email} (email notification failed)`);
      }

      setEmail('');
      onClose();
    } catch (error) {
      console.error('Invite member error:', error);
      toast.error('Failed to send invitation');
    } finally {
      setSending(false);
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

        <h2 className="text-xl font-bold mb-6">Invite Member to {group.name}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              className="input w-full"
              placeholder="player@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}