import React, { useState } from 'react';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from '../common/LoadingSpinner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

const RegistrationModal: React.FC<Props> = ({ isOpen, onClose, eventId, eventTitle }) => {
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await apiClient.post(`/events/${eventId}/register`, formData);
      setMessage('✅ Successfully Registered! See you there.');
      setFormData({ fullName: '', phone: '', email: '' });
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border-t-4 border-primary">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Register for Event</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">✕</button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          You are registering for: <span className="font-bold text-primary">{eventTitle}</span>
        </p>

        {message && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        {loading ? <LoadingSpinner /> : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">Full Name</label>
              <input 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:outline-none"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Phone Number</label>
              <input 
                type="tel"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Email (Optional)</label>
              <input 
                type="email"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-purple-700 font-bold transition">
              Confirm Registration
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegistrationModal;