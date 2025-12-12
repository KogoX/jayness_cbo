import React, { useEffect, useState } from 'react';
import apiClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  totalFunds: number;
  activePrograms: number;
}


const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get('/admin/stats');
        setStats(data);
      } catch (error) {
        console.error("Admin stats failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Admin Overview</h2>
        <p className="text-gray-500 text-sm">Welcome back, Admin. Here is what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Members</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalUsers}</h3>
            </div>
            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">👥</span>
          </div>
        </div>

        {/* Funds Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Raised</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">
                Ksh {stats?.totalFunds.toLocaleString()}
              </h3>
            </div>
            <span className="bg-green-100 text-green-600 p-2 rounded-lg">💰</span>
          </div>
        </div>

        {/* Programs Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Active Programs</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.activePrograms}</h3>
            </div>
            <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">🚀</span>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
          <button 
             onClick={() => navigate('/admin/events')} // Link to Events
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition"
          >
              Manage Events
          </button>

          <button 
              onClick={() => navigate('/admin/programs')} // Link to Programs
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition"
          >
              Manage Programs
          </button>
            <button 
              onClick={() => navigate('/admin/users')}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition"
            >
              Manage Users
            </button>
            <button 
              onClick={() => navigate('/admin/beneficiaries')}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition"
            >
              Manage Beneficiaries
            </button>
            <button 
              onClick={() => navigate('/admin/notifications')}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition"
                >
              Send Broadcast / Message
            </button>
            <button 
                  onClick={() => navigate('/admin/impact')}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition"
                >
                  <span>📸</span> Update Impact / Gallery
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;