import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: { role?: string } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user }) => {
  const location = useLocation();
  const isAdminView = location.pathname.startsWith('/admin');

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname !== '/dashboard') {
      return 'text-gray-600 hover:bg-gray-50 hover:text-primary border-l-4 border-transparent';
    }
    if (path === '/admin' && location.pathname !== '/admin') {
      return 'text-gray-600 hover:bg-gray-50 hover:text-primary border-l-4 border-transparent';
    }
    return location.pathname.startsWith(path)
      ? 'bg-purple-50 border-primary text-primary border-l-4 font-medium'
      : 'text-gray-600 hover:bg-gray-50 hover:text-primary border-l-4 border-transparent';
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:static lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <img src="/logo.svg" alt="Jayness Logo" className="h-10 w-auto" />
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-red-500" aria-label="Close menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isAdminView ? (
          <nav className="mt-6 flex-1 flex flex-col px-4 gap-2 pb-6">
            <div className="rounded-xl bg-slate-900 text-white p-4 mb-2">
              <p className="text-[11px] uppercase tracking-wider text-slate-300">Admin Console</p>
              <p className="text-sm font-semibold mt-1">Organization Controls</p>
            </div>

            <Link
              to="/dashboard"
              onClick={onClose}
              className="mb-3 flex items-center gap-2 px-4 py-3 text-primary bg-purple-50 rounded-lg border border-primary/20 hover:bg-purple-100 transition font-medium"
            >
              Back to Member Dashboard
            </Link>

            <Link to="/admin" onClick={onClose} className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/admin')}`}>
              Overview
            </Link>
            <Link to="/admin/users" onClick={onClose} className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/admin/users')}`}>
              Users
            </Link>
            <Link to="/admin/programs" onClick={onClose} className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/admin/programs')}`}>
              Programs
            </Link>
            <Link to="/admin/events" onClick={onClose} className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/admin/events')}`}>
              Events
            </Link>
            <Link to="/admin/beneficiaries" onClick={onClose} className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/admin/beneficiaries')}`}>
              Beneficiaries
            </Link>
            <Link to="/admin/impact" onClick={onClose} className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/admin/impact')}`}>
              Impact
            </Link>
            <Link to="/admin/notifications" onClick={onClose} className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/admin/notifications')}`}>
              Notifications
            </Link>
          </nav>
        ) : (
          <nav className="mt-6 flex-1 flex flex-col px-4 gap-2 pb-6">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-3 mb-2 text-primary bg-purple-50 rounded-lg border border-primary/20 hover:bg-purple-100 transition font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Return to Homepage
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-3 mb-4 text-white bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 10-6 0v2c0 1.657 1.343 3 3 3zm-7 9v-2a4 4 0 014-4h6a4 4 0 014 4v2"
                  />
                </svg>
                Admin Panel
              </Link>
            )}

            <Link to="/dashboard" onClick={onClose} className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/dashboard')}`}>
              Overview
            </Link>
            <Link
              to="/dashboard/programs"
              onClick={onClose}
              className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/dashboard/programs')}`}
            >
              Programs
            </Link>
            <Link
              to="/dashboard/financials"
              onClick={onClose}
              className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/dashboard/financials')}`}
            >
              My Contributions
            </Link>
            <Link
              to="/dashboard/events"
              onClick={onClose}
              className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/dashboard/events')}`}
            >
              Events & News
            </Link>
            <Link
              to="/dashboard/impact"
              onClick={onClose}
              className={`flex items-center px-4 py-3 rounded-r-lg transition ${isActive('/dashboard/impact')}`}
            >
              Impact & Gallery
            </Link>
          </nav>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
