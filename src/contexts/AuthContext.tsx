import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  sendEmailVerification as firebaseSendEmailVerification,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { sendVerificationEmail as sendVerificationEmailService } from '../lib/emailService';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send verification email immediately after account creation
    if (userCredential.user) {
      try {
        // Send Firebase verification email
        await firebaseSendEmailVerification(userCredential.user);

        // Send our custom styled email
        await sendVerificationEmailService({
          to_email: userCredential.user.email!,
          verification_link: `${window.location.origin}/#/verify-email` // Base URL only, Firebase will append the oobCode
        });

        toast.success('Verification email sent! Please check your inbox.');
      } catch (error) {
        console.error('Failed to send verification email:', error);
        toast.error('Account created but failed to send verification email. Click "Resend" to try again.');
      }
    }
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const sendVerificationEmail = async () => {
    if (!user || user.emailVerified) return;

    try {
      // Send Firebase verification email
      await firebaseSendEmailVerification(user);

      // Send our custom styled email
      await sendVerificationEmailService({
        to_email: user.email!,
        verification_link: `${window.location.origin}/#/verify-email` // Base URL only, Firebase will append the oobCode
      });

      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Failed to send verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    signInWithGoogle,
    sendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};