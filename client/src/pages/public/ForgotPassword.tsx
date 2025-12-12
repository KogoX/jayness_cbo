import React, { useState, memo } from 'react';
import apiClient from '../../api/axiosClient';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await apiClient.post('/auth/forgotpassword', { email });
      setMessage('Email sent! Check your inbox for the reset link.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">Forgot Password</h2>
        <p className="mb-6 text-center text-sm text-gray-600">Enter your email and we'll send you a reset link.</p>
        
        {message && <div className="mb-4 text-green-600 text-center">{message}</div>}
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
          <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-purple-700 transition shadow-md hover:shadow-lg">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default memo(ForgotPassword);