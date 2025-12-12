import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axiosClient';

interface NavbarProps {
  user: { name: string; email: string; image?: string } | null;
  onMenuClick: () => void;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'info' | 'alert' | 'success';
  createdAt: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onMenuClick }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getImageUrl = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  // Fetch Notifications on Load
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const { data } = await apiClient.get('/notifications');
        setNotifications(data);
      } catch (error) {
        console.error("Notifs error", error);
      }
    };
    fetchNotifs();
    
    // Optional: Poll every 60 seconds for new messages
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200 px-4 py-3 lg:px-8">
      <div className="flex items-center justify-between">
        
        {/* LEFT: Mobile Menu & Brand */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="p-2 -ml-2 text-gray-600 rounded-md lg:hidden hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-xl font-bold text-primary lg:hidden">Jayness Foundation</span>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4">
          
          {/* NOTIFICATION BELL */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-gray-400 hover:text-primary transition relative p-1 rounded-full hover:bg-gray-50 outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white text-[9px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* DROPDOWN */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-700 text-sm">Notifications</h3>
                  <span className="text-xs text-gray-500">{unreadCount} Unread</span>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">No notifications yet.</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n._id} 
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition ${!n.isRead ? 'bg-purple-50/50' : ''}`}
                        onClick={() => handleMarkRead(n._id)}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                            n.type === 'alert' ? 'bg-red-500' : 
                            n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* USER PROFILE LINK (Existing Code) */}
          <Link 
            to="/dashboard/profile" 
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full border border-transparent hover:border-gray-100 transition group"
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition">
                {user?.name || 'Member'}
              </span>
              <span className="text-xs text-gray-500">View Profile</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold shadow-sm overflow-hidden border border-gray-100">
              {user?.image ? (
                <img 
                  src={getImageUrl(user.image)} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) e.currentTarget.parentElement.innerText = user.name.charAt(0);
                  }}
                />
              ) : (
                <span className="text-lg">{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;