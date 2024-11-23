import { X } from 'lucide-react';
import { PokerEvent } from '../types';

interface CancelEventModalProps {
  event: PokerEvent;
  onClose: () => void;
  onCancel: () => Promise<void>;
}

export default function CancelEventModal({ event, onClose, onCancel }: CancelEventModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCancel();
    onClose();
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

        <h2 className="text-xl font-bold mb-6">Cancel Event</h2>
        
        <p className="text-gray-300 mb-6">
          Are you sure you want to cancel this event? All attendees will be notified.
          This action cannot be undone.
        </p>

        <form onSubmit={handleSubmit} className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Keep Event
          </button>
          <button
            type="submit"
            className="btn-primary bg-red-600 hover:bg-red-700"
          >
            Cancel Event
          </button>
        </form>
      </div>
    </div>
  );
}