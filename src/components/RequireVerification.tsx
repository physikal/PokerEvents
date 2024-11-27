import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function RequireVerification({ children }: { children: React.ReactNode }) {
  const { user, sendVerificationEmail } = useAuth();
  const [checkingVerification, setCheckingVerification] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (user && !user.emailVerified) {
      // Check verification status every 5 seconds
      intervalId = setInterval(async () => {
        try {
          setCheckingVerification(true);
          await user.reload();
          if (user.emailVerified) {
            clearInterval(intervalId);
            window.location.reload(); // Force reload once verified
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
        } finally {
          setCheckingVerification(false);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user]);

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
            disabled={checkingVerification}
          >
            Resend Verification Email
          </button>

          <p className="mt-4 text-sm text-gray-400 text-center">
            The page will automatically refresh once your email is verified.
            {checkingVerification && (
              <span className="block mt-2 text-poker-red">
                Checking verification status...
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}