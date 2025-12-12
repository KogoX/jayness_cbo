import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import type { CboEvent } from '../../types/event.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// 1. Define Props
interface EventsListProps {
  isPublic?: boolean; // Optional prop
}

const EventsList: React.FC<EventsListProps> = ({ isPublic = false }) => {
  const [events, setEvents] = useState<CboEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Determine the Base Path based on the prop
  const basePath = isPublic ? '/public/events' : '/dashboard/events';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiClient.get('/events');
        setEvents(res.data);
      } catch (error) {
        console.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Events & News</h2>
        <p className="text-gray-500 text-sm">Stay updated with our community activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => {
          const eventDate = new Date(event.date);
          const month = eventDate.toLocaleString('default', { month: 'short' });
          const day = eventDate.getDate();

          return (
            <Link 
              // 3. USE DYNAMIC PATH HERE
              to={`${basePath}/${event._id}`} 
              key={event._id} 
              className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row h-full transform hover:-translate-y-1"
            >
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
                     {isPublic ? 'Register / View →' : 'View Details →'}
                   </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default EventsList;