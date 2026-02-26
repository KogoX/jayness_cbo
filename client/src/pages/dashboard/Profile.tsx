import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { notifyAuthChanged } from '../../utils/authEvents';

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [emailVerificationMessage, setEmailVerificationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setImage(user.image || '');
      setIsEmailVerified(Boolean(user.isEmailVerified));
    }
  }, []);

  const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      const { data } = await apiClient.post('/upload', formData, config);
      setImage(data); 
      setUploading(false);
      setMessage({ type: 'success', text: 'Image uploaded! Click Save Changes to apply.' });
    } catch (error) {
      console.error(error);
      setUploading(false);
      setMessage({ type: 'error', text: 'Image upload failed' });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (password && !oldPassword) {
      setMessage({ type: 'error', text: 'Please enter your current password to change it.' });
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.put('/users/profile', {
        name,
        email,
        phone,
        image,
        oldPassword: oldPassword || undefined,
        password: password || undefined,
      });

      localStorage.setItem('user', JSON.stringify(data));
      notifyAuthChanged();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      setOldPassword('');
      setPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000); 

    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    setEmailVerificationMessage(null);
    setSendingOtp(true);
    try {
      const { data } = await apiClient.post('/auth/email-otp');
      setEmailVerificationMessage({ type: 'success', text: data?.message || 'Verification code sent.' });
    } catch (err: any) {
      setEmailVerificationMessage({ type: 'error', text: err.response?.data?.message || 'Could not send verification code.' });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp.trim()) {
      setEmailVerificationMessage({ type: 'error', text: 'Please enter the verification code.' });
      return;
    }

    setEmailVerificationMessage(null);
    setVerifyingOtp(true);
    try {
      const { data } = await apiClient.post('/auth/email-otp/verify', { otp: emailOtp.trim() });
      if (data?.user?.isEmailVerified) {
        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : {};
        const updatedUser = { ...parsedUser, ...data.user, isEmailVerified: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        notifyAuthChanged();
        setIsEmailVerified(true);
        setEmailOtp('');
      }
      setEmailVerificationMessage({ type: 'success', text: data?.message || 'Email verified successfully.' });
    } catch (err: any) {
      setEmailVerificationMessage({ type: 'error', text: err.response?.data?.message || 'Verification failed.' });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return `https://ui-avatars.com/api/?name=${name}&background=6B21A8&color=fff`;
    if (path.startsWith('http')) return path;
    return `https://jayness-cbo.onrender.com${path}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      {emailVerificationMessage && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          emailVerificationMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {emailVerificationMessage.text}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
        
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl transition-all duration-300">
            <LoadingSpinner />
            <p className="text-primary font-bold mt-4 animate-pulse">Updating Profile...</p>
          </div>
        )}
        
        {/* --- PROFILE IMAGE WITH EDIT OVERLAY --- */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg mb-4">
              <img 
                src={getImageUrl(image)} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${name}&background=6B21A8&color=fff`}
              />
              
              {/* Dark Overlay with Pen Icon */}
              <label 
                htmlFor="profile-image-upload" 
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-300"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <div className="text-white flex flex-col items-center">
                    {/* Pen Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Edit</span>
                  </div>
                )}
              </label>
            </div>
            
            {/* Hidden Input */}
            <input 
              id="profile-image-upload"
              type="file" 
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={uploadFileHandler}
            />
          </div>

          <h3 className="text-xl font-bold text-gray-800">{name}</h3>
          <p className="text-gray-500">{email}</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input 
                type="email"
                className="w-full border p-2 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
                value={email}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07..."
              />
            </div>
            
            {/* Removed the manual File Input here since it is now handled by clicking the image */}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Email Verification</h4>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-sm font-semibold ${isEmailVerified ? 'text-green-700' : 'text-amber-700'}`}>
                  {isEmailVerified ? 'Verified' : 'Not verified'}
                </span>
                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    disabled={sendingOtp}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
                  >
                    {sendingOtp ? 'Sending...' : 'Send verification code'}
                  </button>
                )}
              </div>

              {!isEmailVerified && (
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit code"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    className="w-full md:max-w-xs border p-2 rounded focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={verifyingOtp}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-60"
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify email'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Security Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Required only if changing password"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                  <input 
                    type="password"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={loading || uploading}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
