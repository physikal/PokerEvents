import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toPacificISOString } from '../utils/dateUtils';

interface AddLocationModalProps {
  onClose: () => void;
}

export default function AddLocationModal({ onClose }: AddLocationModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const locationData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        ownerId: user.uid,
        createdAt: toPacificISOString(new Date()),
      };

      await addDoc(collection(db, 'locations'), locationData);
      toast.success('Location added successfully!');
      onClose();
    } catch (error) {
      console.error('Add location error:', error);
      toast.error('Failed to add location');
    } finally {
      setIsSubmitting(false);
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

        <h2 className="text-xl font-bold mb-6">Add New Location</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Location Name <span className="text-poker-red">*</span>
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John's House"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Address <span className="text-poker-red">*</span>
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Poker St, City, State"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}