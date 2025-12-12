import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Program } from '../../types/program.types';

const JoinProgram: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State - Added phone and email
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Female',
    location: '',
    assignedProgram: '',
    needs: ''
  });

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data } = await apiClient.get('/programs');
        setPrograms(data);
      } catch (err) {
        console.error("Could not load programs");
      } finally {
        setPageLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/beneficiaries/public/register', formData);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center border-t-4 border-green-500">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Received!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for registering. We will contact you at <strong>{formData.phone}</strong> regarding your application status.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary">Join a Program</h1>
          <p className="mt-2 text-gray-600">
            Register yourself or a family member to receive support from Jayness CBO.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <LoadingSpinner />
            </div>
          )}

          {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6 border-l-4 border-red-500">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Personal Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Jane Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
                
                {/* ID Number (Kept as requested) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number / Birth Cert No.</label>
                  <input 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. 12345678"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input 
                    type="number"
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Info (NEW) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input 
                    type="tel"
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. 0712 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Optional)</label>
                  <input 
                    type="email"
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Program & Needs */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Support Needed</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location / Village</label>
                  <input 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Westlands, Nairobi"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Program</label>
                  <select 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    value={formData.assignedProgram}
                    onChange={(e) => setFormData({...formData, assignedProgram: e.target.value})}
                    required
                  >
                    <option value="">-- Choose a Program --</option>
                    {programs.map(prog => (
                      <option key={prog._id} value={prog._id}>{prog.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specific Needs / Comments</label>
                  <textarea 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    rows={3}
                    placeholder="Briefly describe why you are applying..."
                    value={formData.needs}
                    onChange={(e) => setFormData({...formData, needs: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-purple-700 transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-gray-500 hover:text-primary">
                Already a member? Log in here
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinProgram;