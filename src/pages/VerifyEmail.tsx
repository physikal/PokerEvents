import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      // Get oobCode from URL parameters
      const searchParams = new URLSearchParams(location.search);
      const actionCode = searchParams.get('oobCode');
      
      if (!actionCode) {
        setError('Invalid verification link');
        setVerifying(false);
        return;
      }

      try {
        await applyActionCode(auth, actionCode);
        // Force refresh the user's token to update emailVerified status
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }
        setVerifying(false);
        toast.success('Email verified successfully!');
      } catch (error) {
        console.error('Email verification error:', error);
        setError('Failed to verify email address. The link may have expired.');
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [location]);

  if (verifying) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="card w-full max-w-md text-center py-8">
          <h2 className="text-xl font-bold mb-4">Verifying Email Address</h2>
          <p className="text-gray-400">Please wait while we verify your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-md text-center py-8">
        {error ? (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-4">Verification Failed</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Return to Dashboard
            </button>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-4">Email Verified!</h2>
            <p className="text-gray-400 mb-6">
              Your email has been successfully verified.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Continue to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}