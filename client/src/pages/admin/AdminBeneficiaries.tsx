import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Beneficiary } from '../../types/beneficiary.types';
import type { Program } from '../../types/program.types'; // Needed for the dropdown

const AdminBeneficiaries: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]); // For dropdown
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    age: '',
    gender: 'Female',
    location: '',
    assignedProgram: '',
    needs: ''
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [benRes, progRes] = await Promise.all([
        apiClient.get('/beneficiaries'),
        apiClient.get('/programs')
      ]);
      setBeneficiaries(benRes.data);
      setPrograms(progRes.data);
      setError(null);
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this beneficiary?')) {
      try {
        await apiClient.delete(`/beneficiaries/${id}`);
        fetchData(); // Refresh list
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/beneficiaries', formData);
      setShowForm(false);
      setFormData({ fullName: '', idNumber: '', age: '', gender: 'Female', location: '', assignedProgram: '', needs: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Link to="/admin" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1 transition">
        ← Back to Dashboard
      </Link>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Beneficiaries</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow-sm"
        >
          {showForm ? 'Cancel' : '+ Register New'}
        </button>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded">{error}</div>}

      {/* REGISTRATION FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 border-l-4 border-l-primary">
          <h3 className="font-bold mb-4 text-lg text-gray-800">Register Beneficiary</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  className="w-full border p-2 rounded focus:outline-none focus:border-primary"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ID Number / Birth Cert</label>
                <input 
                  className="w-full border p-2 rounded focus:outline-none focus:border-primary"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Age</label>
                <input 
                  type="number"
                  className="w-full border p-2 rounded focus:outline-none focus:border-primary"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                <select 
                  className="w-full border p-2 rounded focus:outline-none focus:border-primary"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                <input 
                  className="w-full border p-2 rounded focus:outline-none focus:border-primary"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Assign to Program</label>
                <select 
                  className="w-full border p-2 rounded focus:outline-none focus:border-primary"
                  value={formData.assignedProgram}
                  onChange={(e) => setFormData({...formData, assignedProgram: e.target.value})}
                  required
                >
                  <option value="">Select a Program...</option>
                  {programs.map(prog => (
                    <option key={prog._id} value={prog._id}>{prog.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Primary Need</label>
                <input 
                  className="w-full border p-2 rounded focus:outline-none focus:border-primary"
                  placeholder="e.g. School Fees"
                  value={formData.needs}
                  onChange={(e) => setFormData({...formData, needs: e.target.value})}
                  required
                />
              </div>
            </div>

            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
              Save Record
            </button>
          </form>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Details</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Program</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Needs</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {beneficiaries.map((ben) => (
                <tr key={ben._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{ben.fullName}</div>
                    <div className="text-xs text-gray-500">ID: {ben.idNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {ben.gender}, {ben.age} yrs<br/>
                    <span className="text-xs text-gray-400">{ben.location}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                      {typeof ben.assignedProgram === 'object' ? ben.assignedProgram.title : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ben.needs}</td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => handleDelete(ben._id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Remove
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

export default AdminBeneficiaries;