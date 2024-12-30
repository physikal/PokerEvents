import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Mail } from 'lucide-react';

interface PasswordResetFormProps {
  onCancel: () => void;
}

export default function PasswordResetForm({ onCancel }: PasswordResetFormProps) {
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Password reset email sent! Please check your inbox.');
      onCancel();
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-email':
            toast.error('Invalid email address');
            break;
          case 'auth/user-not-found':
            toast.error('No account found with this email');
            break;
          default:
            toast.error('Failed to send reset email');
        }
      } else {
        toast.error('Failed to send reset email');
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-8 h-8 text-poker-red" />
          <h2 className="text-2xl font-bold">Reset Password</h2>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="input w-full"
              placeholder="your@email.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <p className="mt-1 text-sm text-gray-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isResetting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isResetting}
            >
              {isResetting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}