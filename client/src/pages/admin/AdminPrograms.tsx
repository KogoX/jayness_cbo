import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import type { Program } from '../../types/program.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminPrograms: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null); 
  
  // Updated Form Data with 'status'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetBudget: 0,
    image: '',
    status: 'Active' // Default status
  });

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/programs');
      setPrograms(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load programs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this program?')) {
      try {
        await apiClient.delete(`/programs/${id}`);
        fetchPrograms();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const handleEdit = (program: Program) => {
    setEditId(program._id);
    setFormData({
      title: program.title,
      description: program.description,
      targetBudget: program.targetBudget,
      image: program.image,
      status: program.status || 'Active' // Load existing status
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await apiClient.put(`/programs/${editId}`, formData);
      } else {
        await apiClient.post('/programs', formData);
      }
      resetForm();
      fetchPrograms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ 
      title: '', 
      description: '', 
      targetBudget: 0, 
      image: '', 
      status: 'Active' 
    });
  };

  // Helper for Status Badge Color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Link to="/admin" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1 transition">
        ← Back to Dashboard
      </Link>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage Programs</h2>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow-sm"
        >
          + Add Program
        </button>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 border-l-4 border-l-primary">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-800">{editId ? 'Edit Program' : 'Create New Initiative'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Title & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category Title</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                >
                  <option value="">Select Category...</option>
                  <option value="Child and Orphan Support">Child and Orphan Support</option>
                  <option value="Women Empowerment Hub">Women Empowerment Hub</option>
                  <option value="Community Health Initiative">Community Health Initiative</option>
                  <option value="Education and Literacy Drive">Education and Literacy Drive</option>
                  <option value="Youth Empowerment and Innovation">Youth Empowerment and Innovation</option>
                  <option value="Environmental and Civic Engagement">Environmental and Civic Engagement</option>
                </select>
              </div>

              {/* NEW: STATUS DROPDOWN */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active (Accepting Donations)</option>
                  <option value="Upcoming">Upcoming (Coming Soon)</option>
                  <option value="Completed">Completed (Closed)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea 
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            {/* Row 2: Budget & Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Target Budget (Ksh)</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  value={formData.targetBudget}
                  onChange={(e) => setFormData({...formData, targetBudget: Number(e.target.value)})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                {editId ? 'Update Program' : 'Save Program'}
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESPONSIVE TABLE WRAPPER */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Title</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Raised / Target</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {programs.map((program) => (
                <tr key={program._id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{program.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{program.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* STATUS BADGE */}
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(program.status || 'Active')}`}>
                      {program.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <span className="text-green-600 font-medium">Ksh {program.currentRaised.toLocaleString()}</span>
                    <span className="mx-1">/</span>
                    <span>{program.targetBudget.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap space-x-3">
                    <button 
                      onClick={() => handleEdit(program)}
                      className="text-indigo-600 hover:text-indigo-900 transition"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(program._id)}
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

export default AdminPrograms;