import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import apiClient from '../../api/axiosClient';
import type { CboEvent } from '../../types/event.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RegistrationModal from '../../components/events/RegistrationModal';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [event, setEvent] = useState<CboEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Check if we are viewing this as a public user or logged-in member
  const isPublic = location.pathname.includes('/public');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await apiClient.get(`/events/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!event) return <div className="p-8 text-center text-red-500">Event not found.</div>;

  const eventDate = new Date(event.date);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-0">
      
      {/* SMART BACK BUTTON */}
      <button 
        onClick={() => isPublic ? navigate('/public/events') : navigate('/dashboard/events')} 
        className="text-sm text-gray-500 hover:text-primary mb-2 flex items-center gap-1 transition"
      >
        ← {isPublic ? 'Back to Calendar' : 'Back to Events'}
      </button>

      {/* Hero Image */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-md group">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
          <div className="p-8 text-white w-full">
            <div className="flex justify-between items-end">
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase mb-2 inline-block
                  ${event.category === 'Health' ? 'bg-red-500' : 
                    event.category === 'Environment' ? 'bg-green-500' : 
                    'bg-purple-500'}`}>
                  {event.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
              </div>
              
              {/* Date Badge */}
              <div className="text-center bg-white/20 backdrop-blur-md rounded-lg p-2 min-w-[4rem]">
                <span className="block text-sm font-bold uppercase">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                <span className="block text-2xl font-bold">{eventDate.getDate()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Event Details</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
            {event.description}
          </p>
          
          <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h3 className="font-bold text-primary mb-2">Why you should attend</h3>
            <p className="text-sm text-gray-600">
              Community engagement is at the heart of Jayness CBO. This event is an opportunity 
              to network, learn, and contribute to the growth of our society.
            </p>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Logistics</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <span className="block font-bold text-gray-800">Location</span>
                  {event.location}
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-lg">⏰</span>
                <div>
                  <span className="block font-bold text-gray-800">Time</span>
                  10:00 AM - 4:00 PM
                </div>
              </li>
            </ul>

            <button 
              onClick={() => setIsRegisterOpen(true)}
              className="w-full mt-6 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-hover shadow-md transition-all active:scale-95"
            >
              Register to Attend
            </button>
          </div>
        </div>
      </div>

      {event && (
        <RegistrationModal 
          isOpen={isRegisterOpen} 
          onClose={() => setIsRegisterOpen(false)}
          eventId={event._id}
          eventTitle={event.title}
        />
      )}
    </div>
  );
};

export default EventDetails;