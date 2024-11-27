import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  const { user } = useAuth();
  const homeRoute = user ? '/dashboard' : '/';

  return (
    <Link to={homeRoute} className={`flex items-center ${className}`}>
      <img
        src="https://firebasestorage.googleapis.com/v0/b/pokerevents-3639d.firebasestorage.app/o/suckingout_cropped.png?alt=media&token=81fbd230-1384-4c53-a6ee-cfd641cf0600"
        alt="Sucking Out Logo"
        className="h-[6.2rem] w-auto"
      />
    </Link>
  );
}