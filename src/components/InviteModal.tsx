import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { format } from 'date-fns';
import { PokerEvent } from '../types';

interface InviteModalProps {
  event: PokerEvent;
  onClose: () => void;
  onInvite: (email: string) => Promise<void>;
}

export default function InviteModal({ event, onClose, onInvite }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    try {
      // First update Firestore with the invited player
      await onInvite(email);
      
      // Generate the absolute URL for the event
      const baseUrl = window.location.origin;
      const eventUrl = `${baseUrl}/#/event/${event.id}`;
      
      // Then send the invitation email using EmailJS
      const templateParams = {
        to_email: email,
        event_title: event.title,
        event_date: format(new Date(event.date), 'PPP p'),
        event_location: event.location,
        event_buyin: event.buyIn,
        event_link: eventUrl,
        reply_to: 'noreply@suckingout.com'
      };

      await emailjs.send(
        'service_4rpie4o',
        'template_g5fi4ts',
        templateParams,
        'ESqYejjB3y34cO3rL'
      );

      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      onClose();
    } catch (error) {
      console.error('Invitation error:', error);
      toast.error(`Failed to send invitation to ${email}`);
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

        <h2 className="text-xl font-bold mb-6">Invite Player</h2>

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