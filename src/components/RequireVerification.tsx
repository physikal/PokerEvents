import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RequireVerification({ children }: { children: React.ReactNode }) {
  const { user, sendVerificationEmail } = useAuth();

  if (!user?.emailVerified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="card w-full max-w-md">
          <div className="mb-6 p-4 bg-poker-red/20 border border-poker-red rounded-lg flex items-start gap-3">
            <AlertCircle className="flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Email Verification Required</h3>
              <p className="text-sm text-gray-300 mt-1">
                Please verify your email address to access this feature. Check your inbox for the verification link.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sendVerificationEmail();
              toast.success('Verification email sent! Please check your inbox.');
            }}
            className="btn-primary w-full"
          >
            Resend Verification Email
          </button>

          <p className="mt-4 text-sm text-gray-400 text-center">
            Once verified, refresh the page to continue.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}