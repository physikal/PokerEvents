import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-email':
            toast.error('Invalid email address');
            break;
          case 'auth/user-disabled':
            toast.error('This account has been disabled');
            break;
          case 'auth/user-not-found':
            toast.error('No account found with this email');
            break;
          case 'auth/wrong-password':
            toast.error('Incorrect password');
            break;
          default:
            toast.error('Failed to sign in');
        }
      } else {
        toast.error('Failed to sign in');
      }
    }
  };

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
      setShowResetForm(false);
      setResetEmail('');
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

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/popup-blocked':
            toast.error('Please allow popups for this website');
            break;
          case 'auth/popup-closed-by-user':
            toast.error('Sign in was cancelled');
            break;
          case 'auth/cancelled-popup-request':
            // Ignore this error as it's not relevant to users
            break;
          default:
            toast.error('Failed to sign in with Google');
        }
      } else {
        toast.error('Failed to sign in with Google');
      }
    }
  };

  if (showResetForm) {
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
                onClick={() => setShowResetForm(false)}
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In to Poker Nights</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="input w-full"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="input w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowResetForm(true)}
              className="mt-1 text-sm text-poker-red hover:text-red-400"
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="btn-primary w-full">
            Sign In
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="mt-4 w-full btn-secondary"
          >
            Sign in with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-poker-red hover:text-red-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}