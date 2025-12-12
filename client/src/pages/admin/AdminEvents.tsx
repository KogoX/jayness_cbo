import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import type { CboEvent } from '../../types/event.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<CboEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null); 
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    category: 'Social',
    description: '',
    image: ''
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/events');
      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this event?')) {
      await apiClient.delete(`/events/${id}`);
      fetchEvents();
    }
  };

  const handleEdit = (event: CboEvent) => {
    setEditId(event._id);
    const formattedDate = new Date(event.date).toISOString().split('T')[0];
    
    setFormData({
      title: event.title,
      date: formattedDate,
      location: event.location,
      category: event.category,
      description: event.description,
      image: event.image
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await apiClient.put(`/events/${editId}`, formData);
      } else {
        await apiClient.post('/events', formData);
      }
      setShowForm(false);
      setEditId(null);
      setFormData({ title: '', date: '', location: '', category: 'Social', description: '', image: '' });
      fetchEvents();
    } catch (error) {
      alert('Failed to save event');
    }
  };

  const openCreateForm = () => {
    setEditId(null);
    setFormData({ title: '', date: '', location: '', category: 'Social', description: '', image: '' });
    setShowForm(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Link to="/admin" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1 transition">
        ← Back to Dashboard
      </Link>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage Events</h2>
        <button 
          onClick={openCreateForm}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow-sm"
        >
          + Add Event
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 border-l-4 border-l-primary">
          <h3 className="font-bold mb-4 text-lg text-gray-800">{editId ? 'Edit Event' : 'Create New Event'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Event Title</label>
                <input 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                <input 
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                <input 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Health">Health</option>
                  <option value="Environment">Environment</option>
                  <option value="Education">Education</option>
                  <option value="Social">Social</option>
                  <option value="Governance">Governance</option>
                </select>
              </div>
            </div>
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
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
              <input 
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                {editId ? 'Update Event' : 'Save Event'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESPONSIVE TABLE */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Title</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Location</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event._id}>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{event.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{event.location}</td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap flex gap-4">
                    
                    {/* View Attendees Link */}
                    <Link 
                      to={`/admin/events/${event._id}/registrations`}
                      className="text-blue-600 hover:text-blue-900 transition flex items-center gap-1"
                    >
                      <span>👥</span> View
                    </Link>

                    <button 
                      onClick={() => handleEdit(event)}
                      className="text-indigo-600 hover:text-indigo-900 transition"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(event._id)}
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

export default AdminEvents;