import { Navigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';

export default function RequireProfile({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useProfile();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile?.displayName) {
    return <Navigate to="/profile" />;
  }

  return <>{children}</>;
}