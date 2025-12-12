import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

const MainLayout: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null); const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Close sidebar on route change (Mobile UX)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* 1. CONSTANT SIDEBAR */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* 2. CONSTANT NAVBAR */}
        <Navbar 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)} 
        />

        {/* 3. DYNAMIC CONTENT AREA */}
        {/* This <Outlet /> is where specific pages (Dashboard, Programs, etc.) will appear */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col">
          <Outlet /> 
        </main>

        {/* 4. CONSTANT FOOTER */}
        <Footer />

      </div>
    </div>
  );
};

export default MainLayout;