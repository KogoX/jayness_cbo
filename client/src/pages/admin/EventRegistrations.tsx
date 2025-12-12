import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Registration {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  registeredAt: string;
}

const EventRegistrations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await apiClient.get(`/events/${id}/registrations`);
        setRegistrations(data);
      } catch (err: any) {
        setError('Failed to load registrations');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Link to="/admin/events" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1">
        ← Back to Manage Events
      </Link>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Event Registrations</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
          Total: {registrations.length}
        </span>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded">{error}</div>}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date Registered</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No registrations found for this event yet.
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{reg.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{reg.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{reg.email || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(reg.registeredAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventRegistrations;