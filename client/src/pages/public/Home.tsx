import React, { useState, useEffect, memo, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import PaymentModal from '../../components/common/PaymentModal';
import ProgramCard from '../../components/programs/ProgramCard';
import type { Program } from '../../types/program.types';
import type { CboEvent } from '../../types/event.types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [events, setEvents] = useState<CboEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data in background
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const [progRes, eventRes] = await Promise.all([
          apiClient.get('/programs'),
          apiClient.get('/events')
        ]);
        
        if (isMounted) {
          setPrograms(progRes.data);
          setEvents(eventRes.data.slice(0, 3)); // Only show top 3 events
        }
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize displayed programs and events
  const displayedPrograms = useMemo(() => programs.slice(0, 3), [programs]);

  // Skeleton Loader Component (Gray Box Placeholder)
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-96 animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="mt-auto pt-4 border-t border-gray-50 h-8 bg-gray-100 rounded"></div>
      </div>
    </div>
  );

  // NOTE: We removed the "if (loading) return..." check here.
  // The page renders IMMEDIATELY now!

  return (
    <div className="flex flex-col font-sans">
      
      {/* 1. HERO SECTION (Loads Instantly) */}
      <section className="relative bg-primary text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2000')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <span className="inline-block py-1 px-4 rounded-full bg-white/10 border border-white/20 text-sm font-semibold mb-6 backdrop-blur-sm text-secondary animate-fade-in-up">
            Community First • Integrity • Empowerment
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Empowering Communities,<br /> 
            <span className="text-secondary">Transforming Lives</span>
          </h1>
          <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Jayness CBO is dedicated to uplifting the vulnerable through education, healthcare, and economic empowerment. Join us in building a resilient future.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => setIsDonateOpen(true)}
              className="bg-secondary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-600 transition shadow-lg transform hover:-translate-y-1"
            >
              Donate Now
            </button>
            <Link 
              to="/join"
              className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              Join the Mission
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC PROGRAMS (Shows Skeletons while loading) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Initiatives</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We focus on sustainable development through these key pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Show 3 Fake Cards while loading
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              // Show Real Data when ready
              displayedPrograms.map((program) => (
                <ProgramCard 
                  key={program._id} 
                  program={program} 
                  isPublic={true} 
                />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link to="/public/programs" className="inline-flex items-center text-primary font-bold hover:text-purple-800 hover:underline text-lg transition">
              View All Programs 
              <span className="ml-2 text-xl">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. IMPACT STATS (Static - Loads Instantly) */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-4">
            <div className="text-4xl font-bold text-secondary mb-2">500+</div>
            <div className="text-gray-600 font-medium">Families Supported</div>
          </div>
          <div className="p-4">
            <div className="text-4xl font-bold text-secondary mb-2">120</div>
            <div className="text-gray-600 font-medium">Children Educated</div>
          </div>
          <div className="p-4">
            <div className="text-4xl font-bold text-secondary mb-2">50</div>
            <div className="text-gray-600 font-medium">Women Empowered</div>
          </div>
          <div className="p-4">
            <div className="text-4xl font-bold text-secondary mb-2">{programs.length || 6}</div>
            <div className="text-gray-600 font-medium">Active Programs</div>
          </div>
        </div>
      </section>

      {/* 4. UPCOMING EVENTS (Shows Skeletons while loading) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Latest Events</h2>
              <p className="text-gray-500 mt-2">Join us in our next community activity.</p>
            </div>
            <Link to="/public/events" className="text-primary font-bold hover:underline">
              See Full Calendar →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
               <>
                 <SkeletonCard />
                 <SkeletonCard />
                 <SkeletonCard />
               </>
            ) : events.length > 0 ? (
              events.map((event) => (
                <div 
                  key={event._id} 
                  onClick={() => navigate(`/public/events/${event._id}`)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur rounded p-2 text-center min-w-[3.5rem] shadow-sm">
                      <span className="block text-xs font-bold text-red-500 uppercase">
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="block text-xl font-bold text-gray-800">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-xs text-gray-500 mb-3 space-x-2">
                      <span className="bg-purple-50 text-primary px-2 py-1 rounded font-bold uppercase tracking-wide text-[10px]">
                        {event.category}
                      </span>
                      <span>•</span>
                      <span>{event.location}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed border-gray-300">
                No upcoming events found.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION (Loads Instantly) */}
      <section className="bg-primary py-24 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-4 z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">"Stronger Together"</h2>
          <p className="text-purple-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Our motto drives everything we do. Whether through time, resources, or advocacy, your involvement helps us reshape futures and restore dignity.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => setIsDonateOpen(true)}
              className="bg-secondary text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-yellow-600 transition shadow-lg transform hover:scale-105"
            >
              Make a Donation
            </button>
          </div>
        </div>
      </section>

      <PaymentModal 
        isOpen={isDonateOpen} 
        onClose={() => setIsDonateOpen(false)}
      />
    </div>
  );
};

export default memo(Home);