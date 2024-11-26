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
        src="https://firebasestorage.googleapis.com/v0/b/pokerevents-3639d.firebasestorage.app/o/suckingout.png?alt=media&token=fd622af6-0b38-4029-9315-e76fa31e9763"
        alt="Sucking Out Logo"
        className="h-[6.2rem] w-auto" // Increased from 5.3rem to 6.2rem
      />
    </Link>
  );
}