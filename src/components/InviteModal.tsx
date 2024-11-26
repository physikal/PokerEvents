import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PokerEvent } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { sendInvitationEmail } from '../lib/emailService';
import { formatToPacific } from '../utils/dateUtils';

interface InviteModalProps {
  event: PokerEvent;
  onClose: () => void;
}

export default function InviteModal({ event, onClose }: InviteModalProps) {
  const { user } = useAuth();
  const [emails, setEmails] = useState('');
  const [sending, setSending] = useState(false);

  const validateEmails = (emailList: string[]): string[] => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailList.filter(email => emailRegex.test(email.trim()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !emails || sending) return;

    // Split emails by commas or newlines and trim whitespace
    const emailList = emails
      .split(/[\s,]+/)
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);

    // Validate emails
    const validEmails = validateEmails(emailList);
    
    if (validEmails.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    if (validEmails.length !== emailList.length) {
      toast.error('Some email addresses are invalid and will be skipped');
    }

    setSending(true);
    try {
      const eventRef = doc(db, 'events', event.id);
      
      // Update Firestore with all valid emails at once
      await updateDoc(eventRef, {
        invitedPlayers: arrayUnion(...validEmails)
      });

      // Generate the absolute URL for the event
      const baseUrl = window.location.origin;
      const eventUrl = `${baseUrl}/#/event/${event.id}`;

      // Send invitation emails
      await Promise.all(validEmails.map(email => 
        sendInvitationEmail({
          to_email: email,
          event_title: event.title,
          event_date: formatToPacific(event.date),
          event_location: event.location,
          event_buyin: event.buyIn,
          event_link: eventUrl,
          reply_to: user.email || 'noreply@suckingout.com'
        }).catch(error => {
          console.error(`Failed to send email to ${email}:`, error);
          // Don't throw, just log the error and continue
        })
      ));

      toast.success(`Invitations sent to ${validEmails.length} email${validEmails.length === 1 ? '' : 's'}`);
      onClose();
    } catch (error) {
      console.error('Invite players error:', error);
      toast.error('Failed to send invitations');
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

        <h2 className="text-xl font-bold mb-6">Invite Players</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Addresses</label>
            <textarea
              className="input w-full h-32 resize-none"
              placeholder="Enter email addresses (comma or newline separated)&#10;example1@email.com&#10;example2@email.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              required
            />
            <p className="mt-1 text-sm text-gray-400">
              You can enter multiple email addresses separated by commas or new lines
            </p>
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
              {sending ? 'Sending...' : 'Send Invites'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}