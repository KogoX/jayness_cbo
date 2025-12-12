import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { CboEvent } from '../../types/event.types';

const PublicEvents: React.FC = () => {
  const [events, setEvents] = useState<CboEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await apiClient.get('/events');
        setEvents(data);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Events & News</h2>
          <p className="text-gray-500 mt-2">Stay updated with our community activities.</p>
        </div>

        {/* Grid - Exact match to Dashboard EventsList */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
            const eventDate = new Date(event.date);
            const month = eventDate.toLocaleString('default', { month: 'short' });
            const day = eventDate.getDate();

            return (
              <Link 
                to={`/public/events/${event._id}`} // <--- Links to PUBLIC details
                key={event._id} 
                className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row h-full transform hover:-translate-y-1"
              >
                {/* Image Section */}
                <div className="h-48 md:h-auto md:w-1/3 relative overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur rounded-lg p-2 text-center min-w-[3.5rem] shadow-sm">
                    <span className="block text-xs font-bold text-red-500 uppercase">{month}</span>
                    <span className="block text-xl font-bold text-gray-800">{day}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium 
                        ${event.category === 'Health' ? 'bg-red-100 text-red-600' : 
                          event.category === 'Environment' ? 'bg-green-100 text-green-600' : 
                          'bg-purple-100 text-purple-600'}`}>
                        {event.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 gap-2">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                     <span className="text-sm font-semibold text-primary group-hover:underline">
                       Register / View →
                     </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default PublicEvents;