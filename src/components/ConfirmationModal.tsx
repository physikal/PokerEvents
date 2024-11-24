import { useState } from 'react';
import { X } from 'lucide-react';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmStyle?: 'danger' | 'primary';
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function ConfirmationModal({
  title,
  message,
  confirmLabel = 'Confirm',
  confirmStyle = 'primary',
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonClasses = confirmStyle === 'danger' 
    ? 'bg-red-600 hover:bg-red-700' 
    : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`btn-primary ${buttonClasses}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}