import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import type { User } from '../../types/user.types';
import LoadingSpinner from '../../components/common/LoadingSpinner'; // <--- Import Spinner

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const { data } = await apiClient.get('/admin/users');
      setUsers(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiClient.delete(`/admin/users/${id}`);
        setSuccessMessage('User deleted successfully');
        fetchUsers();
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleRoleUpdate = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (window.confirm(`Change role to ${newRole}?`)) {
      try {
        await apiClient.put(`/admin/users/${user._id}/role`, { role: newRole });
        setSuccessMessage(`User role updated to ${newRole}`);
        fetchUsers();
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Update failed');
      }
    }
  };

  if (loading) return <LoadingSpinner />; // <--- Use Spinner

  return (
    <div className="space-y-6">
      <Link to="/admin" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1 transition">
        ← Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage Users</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          Total: {users.length}
        </span>
      </div>

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded text-sm">{error}</div>}
      {successMessage && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded text-sm">{successMessage}</div>}

      {/* RESPONSIVE TABLE WRAPPER */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button 
                      onClick={() => handleRoleUpdate(user)}
                      className="text-indigo-600 hover:text-indigo-900 transition"
                    >
                      {user.role === 'admin' ? 'Demote' : 'Make Admin'}
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-900 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;