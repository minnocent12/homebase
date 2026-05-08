import { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleBadgeStyle: Record<string, string> = {
  ADMIN:      'bg-red-100 text-red-700',
  MANAGER:    'bg-purple-100 text-purple-700',
  TECHNICIAN: 'bg-teal-100 text-teal-700',
  ASSOCIATE:  'bg-blue-100 text-blue-700',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const canViewAnalytics = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const canManageUsers   = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const isAdmin          = user?.role === 'ADMIN';

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
          {canViewAnalytics && (
            <Link to="/analytics"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Analytics
            </Link>
          )}
          {canManageUsers && (
            <Link to="/users"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Users
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/teams"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Teams
            </Link>
          )}
        </div>
      </div>

      {/* User dropdown */}
      <div className="flex items-center">
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user.fullName}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadgeStyle[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                {user.role}
              </span>
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
                </div>
                <Link
                  to={`/users/${user.userId}`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </nav>
  );
};

export default Navbar;
