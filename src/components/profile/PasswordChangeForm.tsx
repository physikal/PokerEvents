import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { User } from 'firebase/auth';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

interface PasswordChangeFormProps {
  user: User;
  onCancel: () => void;
}

export default function PasswordChangeForm({ user, onCancel }: PasswordChangeFormProps) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email!,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordData.newPassword);
      
      toast.success('Password updated successfully');
      onCancel();
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to update password. Please check your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <form onSubmit={handlePasswordChange} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Current Password</label>
        <input
          type="password"
          className="input w-full"
          value={passwordData.currentPassword}
          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">New Password</label>
        <input
          type="password"
          className="input w-full"
          value={passwordData.newPassword}
          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
        <input
          type="password"
          className="input w-full"
          value={passwordData.confirmPassword}
          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isChangingPassword}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isChangingPassword}
        >
          {isChangingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
}