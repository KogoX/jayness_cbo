import React, { memo, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../../api/axiosClient';

type VerifyState = 'loading' | 'success' | 'error';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<VerifyState>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!token) {
        if (isMounted) {
          setStatus('error');
          setMessage('Invalid verification link.');
        }
        return;
      }

      try {
        const response = await apiClient.get(`/auth/verify-email/${token}`);
        if (!isMounted) return;
        setStatus('success');
        setMessage(response.data?.message || 'Email verified successfully. You can now sign in.');
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification link is invalid or expired.');
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (event: React.FormEvent) => {
    event.preventDefault();
    setResendMessage(null);

    if (!email.trim()) {
      setResendMessage('Enter your email to resend verification.');
      return;
    }

    setResendLoading(true);
    try {
      const response = await apiClient.post('/auth/resend-verification', {
        email: email.trim().toLowerCase(),
      });
      setResendMessage(response.data?.message || 'Verification email sent.');
    } catch (err: any) {
      setResendMessage(err.response?.data?.message || 'Could not resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-3 text-center text-2xl font-bold text-gray-800">Email Verification</h2>
        <p
          className={`mb-6 text-center text-sm ${
            status === 'success' ? 'text-green-700' : status === 'error' ? 'text-red-700' : 'text-gray-600'
          }`}
        >
          {message}
        </p>

        {status === 'success' && (
          <Link
            to="/?auth=signin"
            className="block w-full rounded-md bg-primary px-4 py-2 text-center text-white transition hover:bg-purple-700"
          >
            Continue to Sign In
          </Link>
        )}

        {status === 'error' && (
          <form onSubmit={handleResend} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Resend verification email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <button
              type="submit"
              disabled={resendLoading}
              className="w-full rounded-md bg-primary px-4 py-2 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {resendLoading ? 'Sending...' : 'Resend Verification'}
            </button>
            {resendMessage && <p className="text-center text-sm text-gray-600">{resendMessage}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default memo(VerifyEmail);
