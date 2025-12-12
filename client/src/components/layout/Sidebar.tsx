import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: { role?: string } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // IMPROVED: Check if the current URL *starts with* the path
  // This keeps "Programs" highlighted even when you are viewing Program Details
  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname !== '/dashboard') {
      return "text-gray-600 hover:bg-gray-50 hover:text-primary border-l-4 border-transparent";
    }
    return location.pathname.startsWith(path)
      ? "bg-purple-50 border-primary text-primary border-l-4 font-medium" 
      : "text-gray-600 hover:bg-gray-50 hover:text-primary border-l-4 border-transparent";
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-primary">Jayness CBO</h1>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-red-500">
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 flex flex-col px-4 gap-2">
          
          {/* --- ADMIN LINK --- */}
          {user?.role === 'admin' && (
            <Link 
              to="/admin" 
              onClick={onClose}
              className="flex items-center px-4 py-3 mb-4 text-white bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition"
            >
              🔒 Admin Panel
            </Link>
          )}

          {/* 1. Dashboard / Overview */}
          <Link 
            to="/dashboard" 
            onClick={onClose}
            className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/dashboard')}`}
          >
            Overview
          </Link>

          {/* 2. Programs */}
          <Link 
            to="/dashboard/programs" 
            onClick={onClose}
            className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/dashboard/programs')}`}
          >
            Programs
          </Link>

          {/* 3. My Contributions */}
          <Link 
            to="/dashboard/financials" 
            onClick={onClose}
            className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/dashboard/financials')}`}
          >
            My Contributions
          </Link>

          {/* 4. Events */}
          <Link 
            to="/dashboard/events" 
            onClick={onClose}
            className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/dashboard/events')}`}
          >
            Events & News
          </Link>
          <Link 
            to="/dashboard/impact"
          className={`flex items-center px-4 py-3 rounded-r-lg transition${isActive('/dashboard/impact')}`}>
            Impact & Gallery
          </Link>
          
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-6 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;