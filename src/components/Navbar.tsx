import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, History, LayoutDashboard, Users, Mail } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  if (!user && !isLandingPage) return null;

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? '/dashboard' : '/'} className="text-xl font-bold text-white">
            Poker Nights
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-6">
              <Link 
                to="/dashboard" 
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
                to="/groups" 
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <Users size={18} />
                Groups
              </Link>
              <Link 
                to="/profile" 
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <User size={18} />
                Profile
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <Mail size={18} />
                Contact
              </Link>
              <button
                onClick={() => logout()}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-6">
              <Link 
                to="/contact"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <Mail size={18} />
                Contact
              </Link>
              <Link 
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}