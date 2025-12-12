import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Simple type for User selector
interface UserOption {
  _id: string;
  name: string;
  email: string;
}

const AdminNotifications: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  
  // Form State
  const [recipient, setRecipient] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');

  // Fetch users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await apiClient.get('/users'); 
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      await apiClient.post('/notifications', {
        userId: recipient,
        title,
        message,
        type
      });
      setMsg({ type: 'success', text: 'Notification sent successfully!' });
      setTitle('');
      setMessage('');
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Failed to send.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Send Notifications</h2>

      {msg && (
        <div className={`p-4 rounded-lg ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {msg.text}
        </div>
      )}

      {/* Added 'relative' class to container for overlay positioning */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
        
        {/* --- LOADING SPINNER OVERLAY --- */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl transition-all duration-300">
            <LoadingSpinner />
            <p className="text-primary font-bold mt-4 animate-pulse">Sending Notification...</p>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-6">
          
          {/* Recipient Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Recipient</label>
            <select 
              className="w-full border p-2 rounded-lg"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >
              <option value="all">📢 All Users (Broadcast)</option>
              <optgroup label="Specific Users">
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
            <div className="flex gap-4">
              {['info', 'alert', 'success'].map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value={t} 
                    checked={type === t} 
                    onChange={(e) => setType(e.target.value)}
                  />
                  <span className="capitalize">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
            <input 
              className="w-full border p-2 rounded-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
              placeholder="e.g. System Maintenance"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
            <textarea 
              className="w-full border p-2 rounded-lg"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Type your update here..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition"
          >
            Send Notification
          </button>

        </form>
      </div>
    </div>
  );
};

export default AdminNotifications;