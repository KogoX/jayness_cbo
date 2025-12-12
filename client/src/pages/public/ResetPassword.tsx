import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>(); // Get token from URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/auth/resetpassword/${token}`, { password });
      setMessage('Password Reset Successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired token');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Reset Password</h2>
        
        {message && <div className="mb-4 text-green-600 text-center">{message}</div>}
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            required
          />
          <button type="submit" className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            Set New Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;