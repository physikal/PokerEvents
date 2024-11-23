import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, History, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-white">
            Poker Nights
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link 
              to="/history" 
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <History size={18} />
              History
            </Link>
            <Link 
              to="/profile" 
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <User size={18} />
              Profile
            </Link>
            <button
              onClick={() => logout()}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}