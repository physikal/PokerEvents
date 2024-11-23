import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useProfile } from '../hooks/useProfile';
import { AlertCircle } from 'lucide-react';

const TIMEZONE_OPTIONS = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
];

export default function Profile() {
  const { profile, loading, updateProfile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: '',
    timezone: '',
  });

  const isNewUser = !profile?.displayName;

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        timezone: profile.timezone || 'America/Los_Angeles',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    try {
      const success = await updateProfile({
        displayName: formData.displayName.trim(),
        timezone: formData.timezone,
      });

      if (success) {
        toast.success('Profile updated successfully');
        if (isNewUser) {
          navigate('/');
        }
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        
        {isNewUser && (
          <div className="mb-6 p-4 bg-poker-red/20 border border-poker-red rounded-lg flex items-start gap-3">
            <AlertCircle className="flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Complete Your Profile</h3>
              <p className="text-sm text-gray-300">
                Please set your display name to continue. This will be visible to other players.
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Display Name <span className="text-poker-red">*</span>
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="Your name"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Time Zone</label>
            <select
              className="input w-full"
              value={formData.timezone}
              onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
              required
            >
              {TIMEZONE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-400">
              This will be used for all events you create and view
            </p>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              {isNewUser ? 'Complete Profile' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}