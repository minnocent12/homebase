import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">

      {/* Logo + nav links */}
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="HomeBase" className="h-24 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/dashboard"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Dashboard
          </Link>
          <Link to="/requests"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Requests
          </Link>
          <Link to="/requests/new"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            New Request
          </Link>
        </div>
      </div>

      {/* User info + logout */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          Logout
        </button>
      </div>

    </nav>
  );
};

export default Navbar;